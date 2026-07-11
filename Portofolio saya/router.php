<?php
/**
 * Local Router for Vercel Simulation
 * Simulates Vercel routing configuration for php built-in server.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static files directly if they exist in the root folder
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Route to APIs and main page
if ($uri === '/send-message') {
    include __DIR__ . '/api/send-message.php';
} else {
    include __DIR__ . '/api/index.php';
}
