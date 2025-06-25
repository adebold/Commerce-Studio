#!/bin/bash
set -e

# Wait for MySQL
until nc -z -v -w30 $MAGENTO_DATABASE_HOST 3306; do
  echo "Waiting for MySQL..."
  sleep 5
done

# Wait for Redis
until nc -z -v -w30 $REDIS_HOST 6379; do
  echo "Waiting for Redis..."
  sleep 5
done

# Wait for OpenSearch
until curl -s "http://$ELASTICSEARCH_HOST" > /dev/null; do
  echo "Waiting for OpenSearch..."
  sleep 5
done

# Configure Magento
cd /var/www/html

# Update env.php if it doesn't exist
if [ ! -f app/etc/env.php ]; then
  bin/magento setup:install \
    --base-url=$MAGENTO_URL \
    --db-host=$MAGENTO_DATABASE_HOST \
    --db-name=$MAGENTO_DATABASE_NAME \
    --db-user=$MAGENTO_DATABASE_USER \
    --db-password=$MAGENTO_DATABASE_PASSWORD \
    --admin-firstname=Admin \
    --admin-lastname=User \
    --admin-email=$MAGENTO_ADMIN_EMAIL \
    --admin-user=admin \
    --admin-password=$MAGENTO_ADMIN_PASSWORD \
    --language=en_US \
    --currency=USD \
    --timezone=America/New_York \
    --use-rewrites=1 \
    --search-engine=elasticsearch7 \
    --elasticsearch-host=$ELASTICSEARCH_HOST \
    --elasticsearch-port=9200 \
    --cache-backend=redis \
    --cache-backend-redis-server=$REDIS_HOST \
    --cache-backend-redis-db=0 \
    --page-cache=redis \
    --page-cache-redis-server=$REDIS_HOST \
    --page-cache-redis-db=1 \
    --session-save=redis \
    --session-save-redis-host=$REDIS_HOST \
    --session-save-redis-db=2
fi

# Update base URLs
bin/magento config:set web/unsecure/base_url $MAGENTO_URL/
bin/magento config:set web/secure/base_url $MAGENTO_URL/

# Enable production mode if not already
if [ "$MAGENTO_RUN_MODE" = "production" ]; then
  bin/magento deploy:mode:set production -s
  bin/magento setup:di:compile
  bin/magento setup:static-content:deploy -f
fi

# Clear cache
bin/magento cache:clean
bin/magento cache:flush

# Update permissions
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
chown -R www-data:www-data .

# Start Apache
apache2-foreground
