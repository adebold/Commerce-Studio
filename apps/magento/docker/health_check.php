<?php
header('Content-Type: application/json');

try {
    // Check MySQL connection
    $db = new PDO(
        "mysql:host=" . getenv('MAGENTO_DATABASE_HOST') . ";dbname=" . getenv('MAGENTO_DATABASE_NAME'),
        getenv('MAGENTO_DATABASE_USER'),
        getenv('MAGENTO_DATABASE_PASSWORD')
    );
    
    // Check Redis connection
    $redis = new Redis();
    $redis->connect(getenv('REDIS_HOST'));
    
    // Check OpenSearch connection
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://" . getenv('ELASTICSEARCH_HOST'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("OpenSearch health check failed");
    }
    
    // Check Magento installation
    if (!file_exists('/var/www/html/app/etc/env.php')) {
        throw new Exception("Magento not installed");
    }
    
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('c'),
        'checks' => [
            'mysql' => 'connected',
            'redis' => 'connected',
            'opensearch' => 'connected',
            'magento' => 'installed'
        ]
    ]);
    
    exit(0);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'unhealthy',
        'timestamp' => date('c'),
        'error' => $e->getMessage()
    ]);
    exit(1);
}
