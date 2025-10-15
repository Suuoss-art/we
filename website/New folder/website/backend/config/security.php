<?php
// backend/config/security.php
class SecurityConfig {
    private static $instance = null;
    private $config = [];
    
    // Security configuration
    private $securityConfig = [
        'encryption' => [
            'algorithm' => 'AES-256-GCM',
            'key_size' => 256,
            'iv_size' => 128,
            'tag_size' => 128,
            'key_derivation' => 'PBKDF2',
            'iterations' => 100000
        ],
        'session' => [
            'timeout' => 3600, // 1 hour
            'regenerate_id' => true,
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ],
        'rate_limiting' => [
            'enabled' => true,
            'max_attempts' => 5,
            'time_window' => 300, // 5 minutes
            'ban_duration' => 3600 // 1 hour
        ],
        'csrf' => [
            'enabled' => true,
            'token_length' => 32,
            'expire_time' => 3600
        ],
        'headers' => [
            'X-Frame-Options' => 'SAMEORIGIN',
            'X-Content-Type-Options' => 'nosniff',
            'X-XSS-Protection' => '1; mode=block',
            'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.kopmaukmunnes.com; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
        ],
        'input_validation' => [
            'max_length' => 1000,
            'allowed_tags' => '<p><br><strong><em><u><a><ul><ol><li>',
            'sanitize_html' => true,
            'validate_email' => true,
            'validate_phone' => true,
            'validate_url' => true
        ],
        'file_upload' => [
            'max_size' => 10485760, // 10MB
            'allowed_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
            'scan_malware' => true,
            'quarantine_suspicious' => true
        ],
        'logging' => [
            'enabled' => true,
            'log_level' => 'INFO',
            'log_file' => '/app/logs/security.log',
            'max_file_size' => 10485760, // 10MB
            'max_files' => 5
        ]
    ];
    
    private function __construct() {
        $this->loadEnvironmentVariables();
        $this->initializeSecurity();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function loadEnvironmentVariables() {
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $_ENV[trim($key)] = trim($value);
                }
            }
        }
    }
    
    private function initializeSecurity() {
        // Set security headers
        $this->setSecurityHeaders();
        
        // Configure session security
        $this->configureSessionSecurity();
        
        // Initialize encryption
        $this->initializeEncryption();
        
        // Setup rate limiting
        $this->setupRateLimiting();
        
        // Initialize logging
        $this->initializeLogging();
    }
    
    private function setSecurityHeaders() {
        foreach ($this->securityConfig['headers'] as $header => $value) {
            header("{$header}: {$value}");
        }
    }
    
    private function configureSessionSecurity() {
        $sessionConfig = $this->securityConfig['session'];
        
        ini_set('session.cookie_httponly', $sessionConfig['httponly'] ? 1 : 0);
        ini_set('session.cookie_secure', $sessionConfig['secure'] ? 1 : 0);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_samesite', $sessionConfig['samesite']);
        ini_set('session.gc_maxlifetime', $sessionConfig['timeout']);
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerate session ID periodically
        if ($sessionConfig['regenerate_id'] && !isset($_SESSION['last_regeneration'])) {
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
    
    private function initializeEncryption() {
        if (!defined('ENCRYPTION_KEY')) {
            define('ENCRYPTION_KEY', $_ENV['ENCRYPTION_KEY'] ?? 'default-key-change-in-production');
        }
    }
    
    private function setupRateLimiting() {
        if ($this->securityConfig['rate_limiting']['enabled']) {
            $this->checkRateLimit();
        }
    }
    
    private function initializeLogging() {
        if ($this->securityConfig['logging']['enabled']) {
            $this->setupLogging();
        }
    }
    
    private function setupLogging() {
        $logFile = $this->securityConfig['logging']['log_file'];
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Rotate logs if needed
        $this->rotateLogs($logFile);
    }
    
    private function rotateLogs($logFile) {
        if (file_exists($logFile) && filesize($logFile) > $this->securityConfig['logging']['max_file_size']) {
            $maxFiles = $this->securityConfig['logging']['max_files'];
            
            // Rotate existing logs
            for ($i = $maxFiles - 1; $i > 0; $i--) {
                $oldFile = $logFile . '.' . $i;
                $newFile = $logFile . '.' . ($i + 1);
                
                if (file_exists($oldFile)) {
                    if ($i === $maxFiles - 1) {
                        unlink($oldFile);
                    } else {
                        rename($oldFile, $newFile);
                    }
                }
            }
            
            // Move current log
            rename($logFile, $logFile . '.1');
        }
    }
    
    // Rate limiting methods
    private function checkRateLimit() {
        $ip = $this->getClientIP();
        $key = "rate_limit_{$ip}";
        
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [
                'attempts' => 0,
                'first_attempt' => time(),
                'banned_until' => 0
            ];
        }
        
        $rateData = $_SESSION[$key];
        $now = time();
        
        // Check if currently banned
        if ($rateData['banned_until'] > $now) {
            $this->logSecurityEvent('RATE_LIMIT_BANNED', [
                'ip' => $ip,
                'banned_until' => $rateData['banned_until']
            ]);
            $this->sendSecurityAlert('Rate limit exceeded - IP banned', $ip);
            http_response_code(429);
            die('Too many requests. Please try again later.');
        }
        
        // Reset if time window has passed
        if ($now - $rateData['first_attempt'] > $this->securityConfig['rate_limiting']['time_window']) {
            $_SESSION[$key] = [
                'attempts' => 0,
                'first_attempt' => $now,
                'banned_until' => 0
            ];
            $rateData = $_SESSION[$key];
        }
        
        // Increment attempts
        $rateData['attempts']++;
        $_SESSION[$key] = $rateData;
        
        // Check if limit exceeded
        if ($rateData['attempts'] > $this->securityConfig['rate_limiting']['max_attempts']) {
            $banDuration = $this->securityConfig['rate_limiting']['ban_duration'];
            $_SESSION[$key]['banned_until'] = $now + $banDuration;
            
            $this->logSecurityEvent('RATE_LIMIT_EXCEEDED', [
                'ip' => $ip,
                'attempts' => $rateData['attempts'],
                'banned_until' => $now + $banDuration
            ]);
            
            $this->sendSecurityAlert('Rate limit exceeded - IP banned', $ip);
            http_response_code(429);
            die('Too many requests. IP banned for ' . $banDuration . ' seconds.');
        }
    }
    
    // CSRF Protection
    public function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes($this->securityConfig['csrf']['token_length']));
            $_SESSION['csrf_token_time'] = time();
        }
        return $_SESSION['csrf_token'];
    }
    
    public function validateCSRFToken($token) {
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Check token expiration
        if (time() - $_SESSION['csrf_token_time'] > $this->securityConfig['csrf']['expire_time']) {
            unset($_SESSION['csrf_token'], $_SESSION['csrf_token_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    // Input validation
    public function validateInput($input, $type, $options = []) {
        switch ($type) {
            case 'email':
                return $this->validateEmail($input);
            case 'phone':
                return $this->validatePhone($input);
            case 'url':
                return $this->validateUrl($input);
            case 'integer':
                return $this->validateInteger($input);
            case 'float':
                return $this->validateFloat($input);
            case 'text':
                return $this->validateText($input, $options);
            case 'html':
                return $this->validateHtml($input, $options);
            default:
                return false;
        }
    }
    
    private function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    private function validatePhone($phone) {
        return preg_match('/^[0-9+\-\s()]+$/', $phone);
    }
    
    private function validateUrl($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }
    
    private function validateInteger($value) {
        return filter_var($value, FILTER_VALIDATE_INT) !== false;
    }
    
    private function validateFloat($value) {
        return filter_var($value, FILTER_VALIDATE_FLOAT) !== false;
    }
    
    private function validateText($text, $options = []) {
        $maxLength = $options['max_length'] ?? $this->securityConfig['input_validation']['max_length'];
        
        if (strlen($text) > $maxLength) {
            return false;
        }
        
        // Check for suspicious patterns
        $suspiciousPatterns = [
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
            '/onclick=/i'
        ];
        
        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return false;
            }
        }
        
        return true;
    }
    
    private function validateHtml($html, $options = []) {
        $allowedTags = $options['allowed_tags'] ?? $this->securityConfig['input_validation']['allowed_tags'];
        
        // Strip disallowed tags
        $cleanHtml = strip_tags($html, $allowedTags);
        
        // Check for script tags
        if (preg_match('/<script/i', $cleanHtml)) {
            return false;
        }
        
        return $cleanHtml;
    }
    
    // Encryption methods
    public function encrypt($data) {
        $key = $this->deriveKey();
        $iv = random_bytes($this->securityConfig['encryption']['iv_size'] / 8);
        $encrypted = openssl_encrypt($data, $this->securityConfig['encryption']['algorithm'], $key, 0, $iv, $tag);
        
        return base64_encode($iv . $tag . $encrypted);
    }
    
    public function decrypt($encryptedData) {
        $key = $this->deriveKey();
        $data = base64_decode($encryptedData);
        
        $ivLength = $this->securityConfig['encryption']['iv_size'] / 8;
        $tagLength = $this->securityConfig['encryption']['tag_size'] / 8;
        
        $iv = substr($data, 0, $ivLength);
        $tag = substr($data, $ivLength, $tagLength);
        $encrypted = substr($data, $ivLength + $tagLength);
        
        return openssl_decrypt($encrypted, $this->securityConfig['encryption']['algorithm'], $key, 0, $iv, $tag);
    }
    
    private function deriveKey() {
        $masterKey = ENCRYPTION_KEY;
        $salt = 'kopma_security_salt_2024';
        
        return hash_pbkdf2(
            'sha256',
            $masterKey,
            $salt,
            $this->securityConfig['encryption']['iterations'],
            $this->securityConfig['encryption']['key_size'] / 8,
            true
        );
    }
    
    // Logging methods
    public function logSecurityEvent($event, $context = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'context' => $context,
            'ip' => $this->getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'user_id' => $_SESSION['user_id'] ?? null
        ];
        
        $logFile = $this->securityConfig['logging']['log_file'];
        file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    private function sendSecurityAlert($message, $ip) {
        // This would integrate with the monitoring system
        // For now, just log the alert
        $this->logSecurityEvent('SECURITY_ALERT', [
            'message' => $message,
            'ip' => $ip
        ]);
    }
    
    // Utility methods
    private function getClientIP() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    // File upload security
    public function validateFileUpload($file) {
        $maxSize = $this->securityConfig['file_upload']['max_size'];
        $allowedTypes = $this->securityConfig['file_upload']['allowed_types'];
        
        if ($file['size'] > $maxSize) {
            return ['valid' => false, 'error' => 'File too large'];
        }
        
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedTypes)) {
            return ['valid' => false, 'error' => 'File type not allowed'];
        }
        
        // Check MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!isset($allowedMimes[$extension]) || $mimeType !== $allowedMimes[$extension]) {
            return ['valid' => false, 'error' => 'Invalid file type'];
        }
        
        // Scan for malware if enabled
        if ($this->securityConfig['file_upload']['scan_malware']) {
            if ($this->scanForMalware($file['tmp_name'])) {
                return ['valid' => false, 'error' => 'Malware detected'];
            }
        }
        
        return ['valid' => true];
    }
    
    private function scanForMalware($filePath) {
        // Basic malware scanning
        $content = file_get_contents($filePath);
        
        $malwarePatterns = [
            '/eval\s*\(/i',
            '/base64_decode\s*\(/i',
            '/shell_exec\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/passthru\s*\(/i',
            '/popen\s*\(/i',
            '/proc_open\s*\(/i',
            '/assert\s*\(/i',
            '/create_function\s*\(/i'
        ];
        
        foreach ($malwarePatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Get configuration
    public function getConfig($key = null) {
        if ($key === null) {
            return $this->securityConfig;
        }
        
        return $this->securityConfig[$key] ?? null;
    }
}

// Global security instance
function getSecurity() {
    return SecurityConfig::getInstance();
}
?>
