#!/usr/bin/env bash
# Installs the isalidocobo.page nginx configuration (privacy-friendly logs,
# no duplicated security headers, ivan.wupp.dev -> canonical redirect).
# Run on the VPS:  sudo bash ~/nginx-staging/apply.sh
# It backs up what it replaces, and restores it if `nginx -t` fails.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run it with sudo: sudo bash $0" >&2; exit 1; }

here="$(cd "$(dirname "$0")" && pwd)"
backup="/root/nginx-backup-$(date +%Y%m%d-%H%M%S)"
conf_d=/etc/nginx/conf.d
log_dir=/var/log/nginx/isalidocobo
managed=(isalidocobo.page.conf www.isalidocobo.page.conf)

echo "== Backup to $backup"
mkdir -p "$backup/conf.d"
for f in "${managed[@]}" 00-isalidocobo-http.conf; do
  [ -e "$conf_d/$f" ] && cp -a "$conf_d/$f" "$backup/conf.d/"
done
[ -e /etc/logrotate.d/nginx-isalidocobo ] && cp -a /etc/logrotate.d/nginx-isalidocobo "$backup/"

restore() {
  echo "== Restoring the previous configuration"
  rm -f "$conf_d/00-isalidocobo-http.conf" /etc/logrotate.d/nginx-isalidocobo
  cp -a "$backup/conf.d/." "$conf_d/"
  [ -e "$backup/nginx-isalidocobo" ] && cp -a "$backup/nginx-isalidocobo" /etc/logrotate.d/
  nginx -t
}

echo "== Log directory (owner-only files, 14-day rotation)"
install -d -o nginx -g adm -m 750 "$log_dir"
for f in access.log error.log; do
  [ -e "$log_dir/$f" ] || install -o nginx -g adm -m 640 /dev/null "$log_dir/$f"
done

echo "== Installing"
install -o root -g root -m 644 "$here/conf.d/00-isalidocobo-http.conf" "$conf_d/"
for f in "${managed[@]}"; do
  install -o root -g root -m 644 "$here/conf.d/$f" "$conf_d/"
done
install -o root -g root -m 644 "$here/logrotate-nginx-isalidocobo" /etc/logrotate.d/nginx-isalidocobo

echo "== nginx -t"
if ! nginx -t; then
  restore
  echo "The new configuration was rejected and the previous one is back." >&2
  exit 1
fi

logrotate -d /etc/logrotate.d/nginx-isalidocobo >/dev/null 2>&1 \
  && echo "logrotate rule: OK" \
  || echo "logrotate rule: check 'logrotate -d /etc/logrotate.d/nginx-isalidocobo'" >&2

echo "== Reloading nginx"
systemctl reload nginx
sleep 1

echo "== Checks"
echo "Each security header must appear exactly once (1):"
for h in content-security-policy strict-transport-security x-frame-options \
  x-content-type-options referrer-policy permissions-policy; do
  printf '  %-26s %s\n' "$h" "$(curl -sSI https://isalidocobo.page/ | grep -ci "^$h:")"
done
printf 'ivan.wupp.dev      -> %s\n' "$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' https://ivan.wupp.dev/galeria)"
printf 'www                -> %s\n' "$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' https://www.isalidocobo.page/galeria)"
printf 'http               -> %s\n' "$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' http://isalidocobo.page/galeria)"
printf '/.well-known/ard   -> %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' https://isalidocobo.page/.well-known/ard.json)"
printf '/.env              -> %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' https://isalidocobo.page/.env)"
echo "Last access log line (the address must end in .0 or ::):"
tail -n 1 "$log_dir/access.log" || true

echo "Done. Backup kept in $backup"
