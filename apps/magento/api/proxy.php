<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$magentoUrl = getenv('MAGENTO_URL');
$accessToken = getenv('MAGENTO_ACCESS_TOKEN');

if (!$magentoUrl || !$accessToken) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing configuration']);
    exit;
}

// Get the requested endpoint from the URL
$endpoint = $_SERVER['PATH_INFO'] ?? '';
$url = rtrim($magentoUrl, '/') . '/rest/V1' . $endpoint;

// Forward the request to Magento
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
        'Accept: application/json'
    ]
]);

// Forward request body for POST/PUT requests
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => $error]);
    exit;
}

http_response_code($httpCode);
echo $response;
