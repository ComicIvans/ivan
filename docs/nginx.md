# nginx delante de la aplicación

Configuración recomendada para el VPS. El repositorio no la aplica: hay que
copiarla al vhost de nginx y recargarlo a mano.

El contenedor escucha solo en `127.0.0.1:3000` (`docker-compose.yml`), y la
propia aplicación envía las cabeceras de seguridad desde `nuxt-security`
(`nuxt.config.ts`): `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y
`Permissions-Policy`. nginx solo tiene que terminar TLS, reenviar las
peticiones y redirigir el dominio secundario.

## Lo que la aplicación espera del proxy

- **Un único proxy.** Para los controles de abuso (el límite del formulario de
  contacto y de los informes CSP), la aplicación usa la última entrada de
  `X-Forwarded-For`, que es la que añade nginx. Si delante de nginx hubiera
  otra capa (una CDN u otro balanceador), esa última entrada sería la de la
  capa y todos los clientes compartirían el mismo límite. En ese caso hay que
  configurar `set_real_ip_from` y `real_ip_header` para que `$remote_addr` sea
  la IP real del cliente.
- **Sin cabeceras de seguridad en nginx.** Si nginx las añade con
  `add_header`, cada respuesta las lleva dos veces. Cuando los valores no
  coinciden (por ejemplo `X-Frame-Options: DENY` y `SAMEORIGIN`), el
  resultado depende del navegador, y dos `Content-Security-Policy` se aplican
  a la vez, de modo que una política de nginx podría bloquear recursos que la
  de la aplicación permite. Revisa también
  las que se heredan del bloque `http {}` o de fragmentos incluidos (como
  `snippets/ssl-params.conf`):

  ```sh
  sudo nginx -T | grep -n add_header
  ```

- **Un solo dominio canónico.** `isalidocobo.page` sirve la web;
  `ivan.wupp.dev` responde con un 301 a la misma ruta del dominio canónico, en
  lugar de servir una copia del sitio.

## vhost

Las rutas de los certificados son las habituales de Let's Encrypt (certbot);
ajústalas a las del servidor.

```nginx
# HTTP: send every request to the canonical HTTPS origin.
server {
    listen 80;
    listen [::]:80;
    server_name isalidocobo.page ivan.wupp.dev;

    # With certbot's webroot method, keep its challenges reachable:
    # location /.well-known/acme-challenge/ { root /var/www/certbot; }

    location / {
        return 301 https://isalidocobo.page$request_uri;
    }
}

# Secondary domain: permanent redirect to the canonical domain.
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ivan.wupp.dev;

    ssl_certificate     /etc/letsencrypt/live/ivan.wupp.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ivan.wupp.dev/privkey.pem;

    return 301 https://isalidocobo.page$request_uri;
}

# Canonical domain: proxy to the app container.
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name isalidocobo.page;

    ssl_certificate     /etc/letsencrypt/live/isalidocobo.page/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/isalidocobo.page/privkey.pem;

    # No security add_header lines here: the app already sends them.

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Replace whatever the client sent: the app trusts only the last
        # X-Forwarded-For entry, so it must be the address nginx saw.
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

`http2 on;` requiere nginx 1.25.1 o posterior. En versiones anteriores, quita
esa línea y usa `listen 443 ssl http2;`.

`X-Forwarded-For $remote_addr` descarta lo que envíe el cliente.
`$proxy_add_x_forwarded_for` también funciona, porque la aplicación solo mira
la última entrada, pero con `$remote_addr` la aplicación no recibe datos que
el cliente pueda falsificar.

## Comprobación

Después de `sudo nginx -t && sudo systemctl reload nginx`:

```sh
# Each security header must appear exactly once (every line ends in 1).
for h in content-security-policy strict-transport-security x-frame-options \
  x-content-type-options referrer-policy permissions-policy; do
  printf '%s %s\n' "$h" "$(curl -sSI https://isalidocobo.page/ | grep -ci "^$h:")"
done

# Also on an API error, which nginx used to answer with conflicting values.
curl -sSI https://isalidocobo.page/api/no-existe | grep -i '^x-frame-options:'

# The secondary domain and plain HTTP redirect to the same path on the
# canonical domain: expect 301 and location: https://isalidocobo.page/galeria
curl -sSI https://ivan.wupp.dev/galeria | grep -iE '^(HTTP|location)'
curl -sSI http://isalidocobo.page/galeria | grep -iE '^(HTTP|location)'
```
