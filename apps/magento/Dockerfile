FROM alexcheng/magento2:2.4.6

# Install additional PHP extensions
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    && docker-php-ext-install zip

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy Magento files
COPY . /var/www/html/app/code/EyewearML/Core/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Install dependencies and deploy
RUN cd /var/www/html && \
    composer require aws/aws-sdk-php && \
    bin/magento module:enable EyewearML_Core && \
    bin/magento setup:upgrade && \
    bin/magento setup:di:compile && \
    bin/magento setup:static-content:deploy -f && \
    bin/magento cache:clean && \
    bin/magento cache:flush

# Health check script
COPY docker/health_check.php /var/www/html/pub/health_check.php

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Set environment variables
ENV MAGENTO_RUN_MODE=production \
    PHP_MEMORY_LIMIT=2G \
    PHP_OPCACHE_ENABLE=1 \
    UPLOAD_MAX_FILESIZE=64M

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost/health_check.php || exit 1

CMD ["/usr/local/bin/startup.sh"]
