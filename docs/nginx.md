# nginx delante de la aplicación

La configuración de nginx de producción está versionada en
[`deploy/nginx/`](../deploy/nginx/). El repositorio no la aplica por sí solo:
hay que copiarla al VPS e instalarla con `apply.sh` (ver
[Aplicar los cambios](#aplicar-los-cambios)).

El contenedor escucha solo en `127.0.0.1:3000` (`docker-compose.yml`), y la
propia aplicación envía las cabeceras de seguridad desde `nuxt-security`
(`nuxt.config.ts`): `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y
`Permissions-Policy`. nginx solo termina TLS, reenvía las peticiones, redirige
los dominios secundarios, limita el tamaño de los cuerpos y el ritmo de las
peticiones de imágenes redimensionadas (`/_ipx`) y escribe los registros con
la mínima información personal.

## Lo que la aplicación espera del proxy

- **Un único proxy.** Para los controles de abuso (el límite del formulario de
  contacto y de los informes CSP), la aplicación usa la última entrada de
  `X-Forwarded-For`, que es la que añade nginx. Si delante de nginx hubiera
  otra capa (una CDN u otro balanceador), esa última entrada sería la de la
  capa y todos los clientes compartirían el mismo límite. En ese caso hay que
  configurar `set_real_ip_from` y `real_ip_header` para que `$remote_addr` sea
  la IP real del cliente.
- **Sin cabeceras de seguridad ni de caché en nginx.** Si nginx añade
  cabeceras de seguridad con `add_header`, cada respuesta las lleva dos veces.
  Cuando los valores no coinciden (por ejemplo `X-Frame-Options: DENY` y
  `SAMEORIGIN`), el resultado depende del navegador, y dos
  `Content-Security-Policy` se aplican a la vez, de modo que una política de
  nginx podría bloquear recursos que la de la aplicación permite. Las
  cabeceras de caché también las pone la aplicación, según la ruta.
- **Un solo dominio canónico.** `isalidocobo.page` sirve la web;
  `ivan.wupp.dev` y `www.isalidocobo.page` responden con un 301 a la misma
  ruta del dominio canónico, en lugar de servir una copia del sitio.

## Archivos

| Archivo                            | Destino en el VPS                             |
| ---------------------------------- | --------------------------------------------- |
| `conf.d/00-isalidocobo-http.conf`  | `/etc/nginx/conf.d/00-isalidocobo-http.conf`  |
| `conf.d/isalidocobo.page.conf`     | `/etc/nginx/conf.d/isalidocobo.page.conf`     |
| `conf.d/www.isalidocobo.page.conf` | `/etc/nginx/conf.d/www.isalidocobo.page.conf` |
| `logrotate-nginx-isalidocobo`      | `/etc/logrotate.d/nginx-isalidocobo`          |
| `apply.sh`                         | se ejecuta desde la carpeta copiada           |

### `conf.d/00-isalidocobo-http.conf`

Ajustes del bloque `http {}`: `nginx.conf` incluye `conf.d/*.conf` dentro de
`http {}`, y el prefijo `00-` hace que se cargue antes que los vhosts que los
usan.

- **Formato de registro `isalidocobo_privacy`.** Es el que publica el aviso
  legal: dirección anonimizada, fecha y hora, método, ruta (`$uri`, sin la
  cadena de consulta), protocolo, código de estado, bytes enviados, tiempo de
  respuesta y user-agent. No guarda la cadena de consulta (puede llevar datos
  que no hacen falta), el `Referer` ni `X-Forwarded-For`.
- **Anonimización de la dirección.** Un `map` recorta `$remote_addr` antes de
  escribirla: de una IPv4 conserva la /24 (`203.0.113.0`) y de una IPv6, la /32
  (`2001:db8::`). Lo que no encaja en esos patrones, como una IPv6 escrita de
  forma poco habitual, se registra como `-`, nunca completo.
- **`limit_req_zone` de `/_ipx`.** Solo se admite en `http {}`: define el ritmo
  por cliente (10 peticiones por segundo) que usa el vhost canónico.

El formato `main` y las líneas `add_header` del `http {}` de `nginx.conf` se
quedan como están (otros sitios del servidor los usan): los vhosts de este
sitio los sustituyen por los suyos.

### `conf.d/isalidocobo.page.conf`

- **`upstream nuxt_ivan`** con `keepalive`: reutiliza las conexiones con el
  contenedor (por eso `proxy_http_version 1.1` y `Connection ""`).
- **Puerto 80** de `isalidocobo.page` e `ivan.wupp.dev`: 301 a HTTPS en el
  dominio canónico.
- **`ivan.wupp.dev` en 443**: 301 a la misma ruta de `isalidocobo.page`. El
  certificado de `isalidocobo.page` cubre también `ivan.wupp.dev` y `www`.
- **`isalidocobo.page` en 443**: el proxy a la aplicación, con
  `client_max_body_size 64k` (el mayor cuerpo legítimo es un informe CSP, y es
  el único límite para los cuerpos enviados por partes, que no llevan
  `Content-Length`), `X-Forwarded-For $remote_addr` (descarta lo que envíe el
  cliente: la aplicación solo confía en la última entrada), tiempos de espera
  del proxy y el límite de `/_ipx` (ráfaga de 100, que cubre una página de la
  galería y su visor; el exceso recibe un 429).
- **Sondas habituales** (archivos ocultos, `wp-admin`, `xmlrpc.php`, `.env`,
  `package.json`, `Dockerfile`…): 404 directo desde nginx. `/.well-known/`
  queda fuera de esa regla para que sigan funcionando los retos de Let's
  Encrypt y los archivos que la aplicación sirve ahí.

### `conf.d/www.isalidocobo.page.conf`

`www.isalidocobo.page`, en 80 y 443: 301 a la misma ruta del dominio
canónico.

### Detalles comunes a los vhosts

- **Registros propios.** Los tres vhosts escriben en
  `/var/log/nginx/isalidocobo/access.log` (formato `isalidocobo_privacy`) y
  `/var/log/nginx/isalidocobo/error.log` (nivel `warn`). El registro de
  errores no admite un formato propio: sus líneas incluyen la IP completa del
  cliente, la petición con su cadena de consulta, el `Host` y, si lo hay, el
  `Referer`. Por eso el aviso legal lo menciona aparte y se conserva el mismo
  tiempo.
- **`limit_req_log_level notice`** en `/_ipx`: los rechazos del limitador se
  registran por debajo del nivel `warn` del registro de errores, así que una
  avalancha de peticiones no lo llena de direcciones completas.
- **`add_header Alt-Svc`** en cada `server` de HTTPS. Anuncia HTTP/3, y además
  corta la herencia: nginx solo hereda las `add_header` de `http {}` en los
  bloques que no definen ninguna. Sin esa línea volverían las cabeceras de
  seguridad de `nginx.conf`, duplicadas con las de la aplicación. Si se añade
  una `add_header` dentro de un `location`, ese `location` deja de heredar el
  `Alt-Svc` del `server`.
- **`reuseport` una sola vez.** Solo puede aparecer una vez por dirección y
  puerto entre todos los vhosts, así que solo lo llevan las dos directivas
  `listen 443 quic` del vhost canónico.
- **Líneas `# managed by Certbot`.** Las rutas del certificado y los bloques
  `if ($host = …)` del puerto 80 se mantienen tal como los dejó certbot, para
  que las renovaciones y una futura ejecución de `certbot --nginx` encuentren
  lo que esperan y no los dupliquen. Esos `if` mandan primero a HTTPS en el
  mismo dominio (`http://ivan.wupp.dev` → `https://ivan.wupp.dev` →
  `https://isalidocobo.page`): son dos saltos, pero el resultado es el mismo.

### `logrotate-nginx-isalidocobo`

Rotación diaria, 13 copias más el archivo actual y `maxage 13`: cada línea se
conserva como máximo 14 días, como indica el aviso legal. Rota también los
registros vacíos (`ifempty`), así que las copias antiguas siempre caducan:
logrotate solo descarta copias (`rotate` y `maxage`) cuando rota, y con
`notifempty` un registro de errores sin líneas nuevas conservaría sus últimas
copias sin límite de tiempo. Viven en su propio directorio porque los patrones
de logrotate no entran en subdirectorios: la regla global
`/var/log/nginx/*.log` (52 días) no los alcanza.

### `apply.sh`

Instala todo lo anterior en el VPS:

1. Copia los archivos que va a sustituir en `/root/nginx-backup-<fecha>`.
2. Crea `/var/log/nginx/isalidocobo/` (propietario `nginx:adm`, `750`) y sus
   dos registros (`640`).
3. Instala los tres `.conf` en `/etc/nginx/conf.d/` y la regla de logrotate en
   `/etc/logrotate.d/nginx-isalidocobo`.
4. Ejecuta `nginx -t`. Si falla, restaura la copia y termina sin recargar.
5. Comprueba la regla con `logrotate -d`, recarga nginx y muestra las
   comprobaciones: cada cabecera de seguridad una sola vez, las redirecciones,
   `/.well-known/ard.json` accesible, `/.env` con 404 y la última línea del
   registro de acceso, que debe terminar en `.0` o `::`.

Supone el usuario `nginx` y `/run/nginx.pid`, que son los del nginx del VPS.

## Aplicar los cambios

Desde la raíz del repositorio, en tu equipo (cambia `usuario@vps` por el
`VPS_HOST` de `.env.deploy`):

```sh
ssh usuario@vps 'mkdir -p ~/nginx-staging'
scp -r deploy/nginx/* usuario@vps:~/nginx-staging/
```

En el VPS:

```sh
sudo bash ~/nginx-staging/apply.sh
```

`apply.sh` se puede repetir: hace otra copia de seguridad, conserva los
registros que ya existen y vuelve a instalar los archivos.

Si se edita uno de estos archivos directamente en el servidor, hay que
llevar el cambio también a `deploy/nginx/`: la siguiente ejecución de
`apply.sh` lo sobrescribiría.

### Borrar los registros de la configuración anterior

Solo hace falta una vez, tras la primera instalación. La configuración
anterior escribía en `/var/log/nginx/isalidocobo.page.access.log` y
`isalidocobo.page.error.log` con el formato `main`: IP completa, cadena de
consulta, `Referer` y `X-Forwarded-For`. Cuando nginx deja de escribir en
ellos y quedan vacíos, la regla global de logrotate (`notifempty`) deja de
rotarlos y sus copias se quedarían en el disco sin límite de tiempo. Cuando
`sudo tail /var/log/nginx/isalidocobo/access.log` muestre direcciones
anonimizadas (terminadas en `.0` o `::`), bórralos:

```sh
sudo rm /var/log/nginx/isalidocobo.page.access.log* /var/log/nginx/isalidocobo.page.error.log*
```

Las peticiones a `www.isalidocobo.page` y al puerto 80 que la configuración
anterior registraba en `/var/log/nginx/access.log` y `error.log` siguen la
regla global (52 copias diarias), pero esa regla también usa `notifempty`:
solo caducan mientras otros sitios del servidor sigan escribiendo en esos
archivos. Para comprobarlo, las copias deben tener fechas de días seguidos:

```sh
sudo ls -l --time-style=long-iso /var/log/nginx/access.log* /var/log/nginx/error.log*
```

## Comprobación

`apply.sh` ya hace estas comprobaciones; para repetirlas a mano:

```sh
# Each security header must appear exactly once (every line ends in 1).
for h in content-security-policy strict-transport-security x-frame-options \
  x-content-type-options referrer-policy permissions-policy; do
  printf '%s %s\n' "$h" "$(curl -sSI https://isalidocobo.page/ | grep -ci "^$h:")"
done

# Also on an API error, which nginx used to answer with conflicting values.
curl -sSI https://isalidocobo.page/api/no-existe | grep -i '^x-frame-options:'

# The secondary domains and plain HTTP redirect to the same path on the
# canonical domain: expect 301 and location: https://isalidocobo.page/galeria
curl -sSI https://ivan.wupp.dev/galeria | grep -iE '^(HTTP|location)'
curl -sSI https://www.isalidocobo.page/galeria | grep -iE '^(HTTP|location)'
curl -sSI http://isalidocobo.page/galeria | grep -iE '^(HTTP|location)'

# Anonymised access log: the addresses end in .0 or ::
sudo tail -n 5 /var/log/nginx/isalidocobo/access.log

# The 14-day rotation rule parses.
sudo logrotate -d /etc/logrotate.d/nginx-isalidocobo
```

Para revisar las `add_header` que llegan a cada bloque, incluidas las de
`nginx.conf` y las de fragmentos incluidos:

```sh
sudo nginx -T | grep -n add_header
```

`http2 on;` requiere nginx 1.25.1 o posterior, y `http3`/`quic`, un nginx
compilado con soporte de QUIC.
