# Deploying to Digital Ocean Magento Instance

## Prerequisites

1. SSH access to Digital Ocean droplet
2. Magento admin credentials
3. Database backup capability

## Deployment Steps

1. Create a backup:
```bash
# SSH into Digital Ocean
ssh user@your-magento-droplet

# Create database backup
mysqldump -u magento -p magento_db > backup_$(date +%Y%m%d).sql

# Backup code
tar -czf code_backup_$(date +%Y%m%d).tar.gz /var/www/html/
```

2. Deploy the module:
```bash
# From your local machine, package the module
cd apps/magento
zip -r eyewearml_module.zip *

# Upload to Digital Ocean
scp eyewearml_module.zip user@your-magento-droplet:/tmp/

# SSH into Digital Ocean
ssh user@your-magento-droplet

# Deploy
cd /var/www/html/app/code
mkdir -p EyewearML/Core
cd EyewearML/Core
unzip /tmp/eyewearml_module.zip
rm /tmp/eyewearml_module.zip

# Update Magento
cd /var/www/html
php bin/magento module:enable EyewearML_Core
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento setup:static-content:deploy -f
php bin/magento cache:clean
php bin/magento cache:flush
```

3. Configure the module:
- Log into Magento Admin
- Navigate to Stores > Configuration > EyewearML > Settings
- Enter your API credentials
- Configure virtual try-on and recommendations settings
- Save configuration

## Testing After Deployment

1. Virtual Try-On:
- Visit a product page
- Verify the try-on button appears
- Test the 3D model viewer
- Check analytics events

2. Product Recommendations:
- Visit a product page
- Verify recommendations appear
- Test clicking recommendations
- Verify tracking works

3. Admin Settings:
- Verify all configuration options work
- Test enabling/disabling features
- Check API connection

## Rollback Procedure

If issues occur, you can rollback:

```bash
# SSH into Digital Ocean
ssh user@your-magento-droplet

# Restore database
mysql -u magento -p magento_db < backup_YYYYMMDD.sql

# Restore code
cd /var/www/html
tar -xzf code_backup_YYYYMMDD.tar.gz

# Clear cache
php bin/magento cache:clean
php bin/magento cache:flush
```

## Monitoring

Monitor these after deployment:

1. Error Logs:
```bash
tail -f /var/www/html/var/log/system.log
tail -f /var/www/html/var/log/exception.log
```

2. Performance:
- Use New Relic if installed
- Monitor server resources
- Check Magento Admin > System > Tools > Support

3. Analytics:
- Monitor GA4 dashboard
- Check EyewearML dashboard
- Verify events are tracking

## Troubleshooting

1. If module doesn't appear:
```bash
php bin/magento module:status
php bin/magento setup:upgrade
```

2. If static content is missing:
```bash
php bin/magento setup:static-content:deploy -f
```

3. If cache issues occur:
```bash
php bin/magento cache:clean
php bin/magento cache:flush
redis-cli flushall
```

4. Permission issues:
```bash
cd /var/www/html
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
chown -R :www-data .
chmod u+x bin/magento
```

## Performance Optimization

After deployment, optimize:

1. Enable production mode:
```bash
php bin/magento deploy:mode:set production
```

2. Enable caching:
```bash
php bin/magento cache:enable
```

3. Compile code:
```bash
php bin/magento setup:di:compile
```

4. Configure Redis:
- Verify Redis is used for cache
- Check session storage
- Monitor Redis memory usage

5. Configure Varnish:
- Update VCL if needed
- Purge cache after deployment
- Test cache hit rates
