<?php
// backend/includes/security.php

/**
 * Advanced Security Functions for KOPMA Website
 */

class AdvancedSecurity {
    private $encryption_key;
    private $session_timeout = 3600; // 1 hour
    private $max_login_attempts = 5;
    private $lockout_duration = 900; // 15 minutes
    
    public function __construct() {
        $this->encryption_key = $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_me';
        $this->initSecurity();
    }
    
    /**
     * Initialize security settings
     */
    private function initSecurity() {
        // Disable dangerous functions
        ini_set('disable_functions', 'exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source');
        
        // Set secure session parameters
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', 1);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.gc_maxlifetime', $this->session_timeout);
        
        // Set secure headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
        
        // Start secure session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Validate input data
     */
    public function validateInput($input, $type, $options = []) {
        switch ($type) {
            case 'email':
                return filter_var($input, FILTER_VALIDATE_EMAIL);
            case 'phone':
                return preg_match('/^[0-9+\-\s()]+$/', $input);
            case 'text':
                $max_length = $options['max_length'] ?? 1000;
                $min_length = $options['min_length'] ?? 1;
                $length = strlen($input);
                return $length >= $min_length && $length <= $max_length;
            case 'url':
                return filter_var($input, FILTER_VALIDATE_URL);
            case 'int':
                $min = $options['min'] ?? PHP_INT_MIN;
                $max = $options['max'] ?? PHP_INT_MAX;
                $value = filter_var($input, FILTER_VALIDATE_INT, [
                    'options' => ['min_range' => $min, 'max_range' => $max]
                ]);
                return $value !== false;
            case 'float':
                $min = $options['min'] ?? PHP_FLOAT_MIN;
                $max = $options['max'] ?? PHP_FLOAT_MAX;
                $value = filter_var($input, FILTER_VALIDATE_FLOAT, [
                    'options' => ['min_range' => $min, 'max_range' => $max]
                ]);
                return $value !== false;
            case 'alphanumeric':
                return preg_match('/^[a-zA-Z0-9]+$/', $input);
            case 'slug':
                return preg_match('/^[a-z0-9-]+$/', $input);
            default:
                return false;
        }
    }
    
    /**
     * Sanitize input data
     */
    public function sanitizeInput($data, $type = 'text') {
        if (is_array($data)) {
            return array_map(function($item) use ($type) {
                return $this->sanitizeInput($item, $type);
            }, $data);
        }
        
        switch ($type) {
            case 'html':
                return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
            case 'text':
                return strip_tags($data);
            case 'email':
                return filter_var($data, FILTER_SANITIZE_EMAIL);
            case 'url':
                return filter_var($data, FILTER_SANITIZE_URL);
            case 'int':
                return filter_var($data, FILTER_SANITIZE_NUMBER_INT);
            case 'float':
                return filter_var($data, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            default:
                return htmlspecialchars(strip_tags($data), ENT_QUOTES, 'UTF-8');
        }
    }
    
    /**
     * Generate CSRF token
     */
    public function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Verify CSRF token
     */
    public function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Encrypt data
     */
    public function encryptData($data) {
        $cipher = "AES-256-GCM";
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $ciphertext = openssl_encrypt($data, $cipher, $this->encryption_key, 0, $iv, $tag);
        return base64_encode($iv . $tag . $ciphertext);
    }
    
    /**
     * Decrypt data
     */
    public function decryptData($encrypted_data) {
        $data = base64_decode($encrypted_data);
        $cipher = "AES-256-GCM";
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = substr($data, 0, $ivlen);
        $tag = substr($data, $ivlen, 16);
        $ciphertext = substr($data, $ivlen + 16);
        return openssl_decrypt($ciphertext, $cipher, $this->encryption_key, 0, $iv, $tag);
    }
    
    /**
     * Hash password
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
    }
    
    /**
     * Verify password
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Check login attempts
     */
    public function checkLoginAttempts($identifier) {
        $redis = new Redis();
        try {
            $redis->connect('redis', 6379);
            $key = "login_attempts:$identifier";
            $attempts = $redis->get($key) ?: 0;
            return $attempts < $this->max_login_attempts;
        } catch (Exception $e) {
            return true; // Allow if Redis is down
        }
    }
    
    /**
     * Record login attempt
     */
    public function recordLoginAttempt($identifier, $success = false) {
        $redis = new Redis();
        try {
            $redis->connect('redis', 6379);
            $key = "login_attempts:$identifier";
            
            if ($success) {
                $redis->del($key);
            } else {
                $attempts = $redis->incr($key);
                if ($attempts === 1) {
                    $redis->expire($key, $this->lockout_duration);
                }
            }
        } catch (Exception $e) {
            // Log error but don't block
        }
    }
    
    /**
     * Check if IP is blocked
     */
    public function isIPBlocked($ip) {
        $redis = new Redis();
        try {
            $redis->connect('redis', 6379);
            $key = "blocked_ip:$ip";
            return $redis->exists($key);
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Block IP address
     */
    public function blockIP($ip, $duration = 3600) {
        $redis = new Redis();
        try {
            $redis->connect('redis', 6379);
            $key = "blocked_ip:$ip";
            $redis->setex($key, $duration, time());
        } catch (Exception $e) {
            // Log error
        }
    }
    
    /**
     * Check for suspicious patterns
     */
    public function detectSuspiciousPatterns($input) {
        $patterns = [
            // SQL Injection
            '/(\bunion\b.*\bselect\b)/i',
            '/(\bselect\b.*\bfrom\b)/i',
            '/(\binsert\b.*\binto\b)/i',
            '/(\bupdate\b.*\bset\b)/i',
            '/(\bdelete\b.*\bfrom\b)/i',
            '/(\bdrop\b.*\btable\b)/i',
            '/(\balter\b.*\btable\b)/i',
            '/(\bcreate\b.*\btable\b)/i',
            '/(\bexec\b.*\b\()/i',
            '/(\bexecute\b.*\b\()/i',
            
            // XSS
            '/<script[^>]*>.*?<\/script>/i',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/<iframe[^>]*>.*?<\/iframe>/i',
            '/<object[^>]*>.*?<\/object>/i',
            '/<embed[^>]*>.*?<\/embed>/i',
            
            // Command Injection
            '/[;&|`$]/',
            '/\b(exec|system|shell_exec|passthru|proc_open|popen)\s*\(/i',
            '/\b(eval|assert|create_function)\s*\(/i',
            
            // Path Traversal
            '/\.\.\//',
            '/\.\.\\\\/',
            '/%2e%2e%2f/i',
            '/%2e%2e%5c/i',
            
            // File Inclusion
            '/\b(include|require|include_once|require_once)\s*\(/i',
            '/\b(file_get_contents|fopen|fread|fwrite)\s*\(/i',
            
            // LDAP Injection
            '/[()=*!]/',
            '/\b(ldap_|ldap_search|ldap_bind)\s*\(/i',
            
            // NoSQL Injection
            '/\b(mongo|mongodb|nosql)\s*\(/i',
            '/\b(find|findOne|findAndModify|update|remove|delete)\s*\(/i'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Log security event
     */
    public function logSecurityEvent($event, $severity = 'info', $data = []) {
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'severity' => $severity,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'data' => $data
        ];
        
        $log_file = '/app/logs/security.log';
        file_put_contents($log_file, json_encode($log_entry) . "\n", FILE_APPEND | LOCK_EX);
        
        // Send critical alerts to Telegram
        if ($severity === 'critical') {
            $this->sendTelegramAlert($log_entry);
        }
    }
    
    /**
     * Send Telegram alert
     */
    private function sendTelegramAlert($log_entry) {
        $bot_token = $_ENV['TELEGRAM_BOT_TOKEN'] ?? null;
        $chat_id = $_ENV['TELEGRAM_CHAT_ID'] ?? null;
        
        if (!$bot_token || !$chat_id) {
            return;
        }
        
        $message = "🚨 CRITICAL SECURITY ALERT\n\n";
        $message .= "Event: " . $log_entry['event'] . "\n";
        $message .= "IP: " . $log_entry['ip'] . "\n";
        $message .= "Time: " . $log_entry['timestamp'] . "\n";
        $message .= "URI: " . $log_entry['request_uri'] . "\n";
        
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
        file_get_contents($url, false, $context);
    }
    
    /**
     * Validate file upload
     */
    public function validateFileUpload($file, $allowed_types = [], $max_size = 10485760) {
        $errors = [];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = 'Upload error: ' . $file['error'];
            return $errors;
        }
        
        if ($file['size'] > $max_size) {
            $errors[] = 'File too large. Maximum size: ' . $this->formatFileSize($max_size);
        }
        
        if (!empty($allowed_types)) {
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($extension, $allowed_types)) {
                $errors[] = 'File type not allowed. Allowed types: ' . implode(', ', $allowed_types);
            }
        }
        
        // Check file content for malicious patterns
        $content = file_get_contents($file['tmp_name']);
        if ($this->detectSuspiciousPatterns($content)) {
            $errors[] = 'File contains suspicious content';
        }
        
        return $errors;
    }
    
    /**
     * Format file size
     */
    private function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    /**
     * Generate secure random string
     */
    public function generateRandomString($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * Check if request is from trusted source
     */
    public function isTrustedSource($ip = null) {
        $ip = $ip ?: $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // Check if IP is in trusted ranges
        $trusted_ranges = [
            '127.0.0.1',
            '::1',
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16'
        ];
        
        foreach ($trusted_ranges as $range) {
            if ($this->ipInRange($ip, $range)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if IP is in range
     */
    private function ipInRange($ip, $range) {
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
     * Rate limiting
     */
    public function checkRateLimit($identifier, $limit = 100, $window = 3600) {
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
     * Clean old security logs
     */
    public function cleanOldLogs($days = 30) {
        $log_dir = '/app/logs';
        $cutoff_time = time() - ($days * 24 * 60 * 60);
        
        if (!is_dir($log_dir)) {
            return;
        }
        
        $files = glob($log_dir . '/security*.log');
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff_time) {
                unlink($file);
            }
        }
    }
    
    /**
     * Get security statistics
     */
    public function getSecurityStats() {
        $log_file = '/app/logs/security.log';
        $stats = [
            'total_events' => 0,
            'critical_events' => 0,
            'high_events' => 0,
            'medium_events' => 0,
            'low_events' => 0,
            'blocked_ips' => 0,
            'failed_logins' => 0
        ];
        
        if (!file_exists($log_file)) {
            return $stats;
        }
        
        $lines = file($log_file, FILE_IGNORE_NEW_LINES);
        foreach ($lines as $line) {
            $entry = json_decode($line, true);
            if ($entry) {
                $stats['total_events']++;
                $stats[$entry['severity'] . '_events']++;
                
                if ($entry['event'] === 'failed_login') {
                    $stats['failed_logins']++;
                }
            }
        }
        
        return $stats;
    }
}
?>




