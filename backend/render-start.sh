#!/usr/bin/env sh
set -eu

mkdir -p \
  bootstrap/cache \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/testing \
  storage/framework/views \
  storage/logs

chmod -R ug+rw bootstrap/cache storage || true

php artisan optimize:clear
php artisan storage:link || true
php artisan migrate --force

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
