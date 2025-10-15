<?php
// backend/includes/functions.php

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(strip_tags($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number
 */
function validatePhone($phone) {
    return preg_match('/^[0-9+\-\s()]+$/', $phone);
}

/**
 * Validate URL
 */
function validateUrl($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Log security event
 */
function logSecurityEvent($event, $severity = 'info', $data = []) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => $event,
        'severity' => $severity,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'data' => $data
    ];
    
    $log_file = '/app/logs/security.log';
    file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Check if request is from Cloudflare
 */
function isCloudflareRequest() {
    $cloudflare_ips = [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22'
    ];
    
    $client_ip = getClientIP();
    
    foreach ($cloudflare_ips as $ip_range) {
        if (ipInRange($client_ip, $ip_range)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check if IP is in range
 */
function ipInRange($ip, $range) {
    if (strpos($range, '/') === false) {
        return $ip === $range;
    }
    
    list($subnet, $bits) = explode('/', $range);
    $ip_long = ip2long($ip);
    $subnet_long = ip2long($subnet);
    $mask = -1 << (32 - $bits);
    
    return ($ip_long & $mask) === ($subnet_long & $mask);
}

/**
 * Rate limiting check
 */
function checkRateLimit($identifier, $limit = 100, $window = 3600) {
    $redis = new Redis();
    try {
        $redis->connect('redis', 6379);
        
        $key = "rate_limit:$identifier";
        $current = $redis->incr($key);
        
        if ($current === 1) {
            $redis->expire($key, $window);
        }
        
        return $current <= $limit;
    } catch (Exception $e) {
        return true; // Allow if Redis is down
    }
}

/**
 * Generate secure random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Format file size
 */
function formatFileSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, 2) . ' ' . $units[$pow];
}

/**
 * Get file extension
 */
function getFileExtension($filename) {
    return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
}

/**
 * Check if file is image
 */
function isImageFile($filename) {
    $image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $extension = getFileExtension($filename);
    return in_array($extension, $image_extensions);
}

/**
 * Check if file is video
 */
function isVideoFile($filename) {
    $video_extensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    $extension = getFileExtension($filename);
    return in_array($extension, $video_extensions);
}

/**
 * Check if file is audio
 */
function isAudioFile($filename) {
    $audio_extensions = ['mp3', 'wav', 'ogg', 'm4a'];
    $extension = getFileExtension($filename);
    return in_array($extension, $audio_extensions);
}

/**
 * Generate slug from string
 */
function generateSlug($string) {
    $slug = strtolower(trim($string));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Truncate text
 */
function truncateText($text, $length = 100, $suffix = '...') {
    if (strlen($text) <= $length) {
        return $text;
    }
    
    return substr($text, 0, $length) . $suffix;
}

/**
 * Get time ago string
 */
function getTimeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) {
        return 'just now';
    } elseif ($time < 3600) {
        $minutes = floor($time / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
    } elseif ($time < 86400) {
        $hours = floor($time / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } elseif ($time < 2592000) {
        $days = floor($time / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    } else {
        return date('M j, Y', strtotime($datetime));
    }
}

/**
 * Send email
 */
function sendEmail($to, $subject, $message, $headers = []) {
    $default_headers = [
        'From: noreply@kopmaukmunnes.com',
        'Reply-To: noreply@kopmaukmunnes.com',
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    $all_headers = array_merge($default_headers, $headers);
    
    return mail($to, $subject, $message, implode("\r\n", $all_headers));
}

/**
 * Send Telegram notification
 */
function sendTelegramNotification($message, $bot_token = null, $chat_id = null) {
    $bot_token = $bot_token ?: $_ENV['TELEGRAM_BOT_TOKEN'];
    $chat_id = $chat_id ?: $_ENV['TELEGRAM_CHAT_ID'];
    
    if (!$bot_token || !$chat_id) {
        return false;
    }
    
    $url = "https://api.telegram.org/bot$bot_token/sendMessage";
    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    return $result !== false;
}

/**
 * Clean old logs
 */
function cleanOldLogs($days = 30) {
    $log_dir = '/app/logs';
    $cutoff_time = time() - ($days * 24 * 60 * 60);
    
    if (!is_dir($log_dir)) {
        return;
    }
    
    $files = glob($log_dir . '/*.log');
    foreach ($files as $file) {
        if (filemtime($file) < $cutoff_time) {
            unlink($file);
        }
    }
}

/**
 * Backup database
 */
function backupDatabase($output_path = null) {
    $db_host = $_ENV['DB_HOST'] ?? 'mysql';
    $db_name = $_ENV['DB_NAME'] ?? 'kopma_db';
    $db_user = $_ENV['DB_USER'] ?? 'kopma_user';
    $db_pass = $_ENV['DB_PASSWORD'] ?? '';
    
    if ($output_path === null) {
        $output_path = '/app/backups/db_backup_' . date('Y-m-d_H-i-s') . '.sql';
    }
    
    $command = "mysqldump -h $db_host -u $db_user -p$db_pass $db_name > $output_path";
    exec($command, $output, $return_code);
    
    return $return_code === 0;
}

/**
 * Get system information
 */
function getSystemInfo() {
    return [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'disk_free_space' => disk_free_space('/'),
        'disk_total_space' => disk_total_space('/')
    ];
}

/**
 * Check if maintenance mode is enabled
 */
function isMaintenanceMode() {
    return file_exists('/app/maintenance.flag');
}

/**
 * Enable maintenance mode
 */
function enableMaintenanceMode() {
    file_put_contents('/app/maintenance.flag', date('Y-m-d H:i:s'));
}

/**
 * Disable maintenance mode
 */
function disableMaintenanceMode() {
    if (file_exists('/app/maintenance.flag')) {
        unlink('/app/maintenance.flag');
    }
}

/**
 * Get maintenance message
 */
function getMaintenanceMessage() {
    if (file_exists('/app/maintenance.flag')) {
        return file_get_contents('/app/maintenance.flag');
    }
    return 'Website is under maintenance. Please try again later.';
}

/**
 * Validate file upload
 */
function validateFileUpload($file, $allowed_types = [], $max_size = 10485760) {
    $errors = [];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Upload error: ' . $file['error'];
        return $errors;
    }
    
    if ($file['size'] > $max_size) {
        $errors[] = 'File too large. Maximum size: ' . formatFileSize($max_size);
    }
    
    if (!empty($allowed_types)) {
        $extension = getFileExtension($file['name']);
        if (!in_array($extension, $allowed_types)) {
            $errors[] = 'File type not allowed. Allowed types: ' . implode(', ', $allowed_types);
        }
    }
    
    return $errors;
}

/**
 * Secure file upload
 */
function secureFileUpload($file, $upload_dir, $allowed_types = [], $max_size = 10485760) {
    $errors = validateFileUpload($file, $allowed_types, $max_size);
    
    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }
    
    $filename = uniqid() . '_' . sanitizeInput($file['name']);
    $filepath = $upload_dir . '/' . $filename;
    
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return [
            'success' => true,
            'filename' => $filename,
            'filepath' => $filepath,
            'size' => $file['size']
        ];
    } else {
        return ['success' => false, 'errors' => ['Failed to move uploaded file']];
    }
}
?>




