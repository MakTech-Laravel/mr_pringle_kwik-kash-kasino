#!/bin/sh
set -eu
cd /var/www
: "${APP_KEY:?APP_KEY must be configured in Coolify}"
# Avoid recursive chown on every boot: persistent volumes should already have correct ownership.
mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
# The vendor build bypasses composer scripts so run Laravel's discovery when needed.
if [ ! -f bootstrap/cache/packages.php ]; then
    su -s /bin/sh www-data -c 'php artisan package:discover --no-interaction'
fi
su -s /bin/sh www-data -c 'php artisan optimize --no-interaction'
exec "$@"
