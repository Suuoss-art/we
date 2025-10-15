<?php
// backend/includes/monitoring.php

/**
 * Advanced Monitoring System for KOPMA Website
 */

class AdvancedMonitoring {
    private $encryption_key;
    private $telegram_bot_token;
    private $telegram_chat_id;
    private $redis;
    
    public function __construct() {
        $this->encryption_key = $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_me';
        $this->telegram_bot_token = $_ENV['TELEGRAM_BOT_TOKEN'] ?? null;
        $this->telegram_chat_id = $_ENV['TELEGRAM_CHAT_ID'] ?? null;
        $this->initRedis();
    }
    
    /**
     * Initialize Redis connection
     */
    private function initRedis() {
        try {
            $this->redis = new Redis();
            $this->redis->connect('redis', 6379);
        } catch (Exception $e) {
            $this->redis = null;
        }
    }
    
    /**
     * Monitor file changes
     */
    public function monitorFileChanges($directory = '/usr/share/nginx/html') {
        $changes = [];
        $current_time = time();
        
        if (!is_dir($directory)) {
            return $changes;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $file_path = $file->getPathname();
                $mtime = $file->getMTime();
                
                // Check if file was modified in the last hour
                if ($current_time - $mtime < 3600) {
                    $changes[] = [
                        'file' => $file_path,
                        'modified' => date('Y-m-d H:i:s', $mtime),
                        'size' => $file->getSize(),
                        'type' => $this->getFileType($file_path)
                    ];
                }
                
                // Check for suspicious files
                if ($this->isSuspiciousFile($file_path)) {
                    $changes[] = [
                        'file' => $file_path,
                        'type' => 'suspicious',
                        'severity' => 'high',
                        'detected' => date('Y-m-d H:i:s')
                    ];
                }
            }
        }
        
        return $changes;
    }
    
    /**
     * Monitor network anomalies
     */
    public function monitorNetworkAnomalies() {
        $anomalies = [];
        $log_file = '/var/log/nginx/access.log';
        
        if (!file_exists($log_file)) {
            return $anomalies;
        }
        
        $lines = file($log_file, FILE_IGNORE_NEW_LINES);
        $recent_lines = array_slice($lines, -1000); // Last 1000 lines
        
        // Analyze IP patterns
        $ip_counts = [];
        $suspicious_requests = [];
        
        foreach ($recent_lines as $line) {
            $parts = explode(' ', $line);
            if (count($parts) >= 7) {
                $ip = $parts[0];
                $method = $parts[5];
                $uri = $parts[6];
                $status = $parts[8];
                
                // Count requests per IP
                $ip_counts[$ip] = ($ip_counts[$ip] ?? 0) + 1;
                
                // Check for suspicious requests
                if ($this->isSuspiciousRequest($uri, $method, $status)) {
                    $suspicious_requests[] = [
                        'ip' => $ip,
                        'uri' => $uri,
                        'method' => $method,
                        'status' => $status,
                        'timestamp' => date('Y-m-d H:i:s')
                    ];
                }
            }
        }
        
        // Detect high-frequency IPs
        foreach ($ip_counts as $ip => $count) {
            if ($count > 100) { // More than 100 requests
                $anomalies[] = [
                    'type' => 'high_frequency_ip',
                    'ip' => $ip,
                    'request_count' => $count,
                    'severity' => 'medium'
                ];
            }
        }
        
        // Add suspicious requests
        foreach ($suspicious_requests as $request) {
            $anomalies[] = [
                'type' => 'suspicious_request',
                'ip' => $request['ip'],
                'uri' => $request['uri'],
                'method' => $request['method'],
                'status' => $request['status'],
                'severity' => 'high'
            ];
        }
        
        return $anomalies;
    }
    
    /**
     * Monitor security threats
     */
    public function monitorSecurityThreats() {
        $threats = [];
        $log_file = '/var/log/nginx/access.log';
        
        if (!file_exists($log_file)) {
            return $threats;
        }
        
        $lines = file($log_file, FILE_IGNORE_NEW_LINES);
        $recent_lines = array_slice($lines, -500); // Last 500 lines
        
        $attack_patterns = [
            'sql_injection' => [
                '/(\bunion\b.*\bselect\b)/i',
                '/(\bselect\b.*\bfrom\b)/i',
                '/(\binsert\b.*\binto\b)/i',
                '/(\bupdate\b.*\bset\b)/i',
                '/(\bdelete\b.*\bfrom\b)/i'
            ],
            'xss' => [
                '/<script[^>]*>/i',
                '/javascript:/i',
                '/on\w+\s*=/i'
            ],
            'path_traversal' => [
                '/\.\.\//',
                '/\.\.\\\\/',
                '/%2e%2e%2f/i'
            ],
            'command_injection' => [
                '/[;&|`$]/',
                '/\b(exec|system|shell_exec)\s*\(/i'
            ],
            'file_inclusion' => [
                '/\b(include|require)\s*\(/i',
                '/\b(file_get_contents|fopen)\s*\(/i'
            ]
        ];
        
        foreach ($recent_lines as $line) {
            $parts = explode(' ', $line);
            if (count($parts) >= 7) {
                $ip = $parts[0];
                $uri = $parts[6];
                $user_agent = $parts[11] ?? '';
                
                foreach ($attack_patterns as $attack_type => $patterns) {
                    foreach ($patterns as $pattern) {
                        if (preg_match($pattern, $uri) || preg_match($pattern, $user_agent)) {
                            $threats[] = [
                                'type' => $attack_type,
                                'ip' => $ip,
                                'uri' => $uri,
                                'user_agent' => $user_agent,
                                'pattern' => $pattern,
                                'severity' => 'critical',
                                'timestamp' => date('Y-m-d H:i:s')
                            ];
                        }
                    }
                }
            }
        }
        
        return $threats;
    }
    
    /**
     * Monitor performance metrics
     */
    public function monitorPerformance() {
        $metrics = [];
        
        // CPU usage
        $cpu_usage = sys_getloadavg();
        $metrics['cpu'] = [
            '1min' => $cpu_usage[0],
            '5min' => $cpu_usage[1],
            '15min' => $cpu_usage[2]
        ];
        
        // Memory usage
        $memory = memory_get_usage(true);
        $memory_peak = memory_get_peak_usage(true);
        $metrics['memory'] = [
            'current' => $memory,
            'peak' => $memory_peak,
            'current_mb' => round($memory / 1024 / 1024, 2),
            'peak_mb' => round($memory_peak / 1024 / 1024, 2)
        ];
        
        // Disk usage
        $disk_free = disk_free_space('/');
        $disk_total = disk_total_space('/');
        $metrics['disk'] = [
            'free' => $disk_free,
            'total' => $disk_total,
            'used' => $disk_total - $disk_free,
            'free_percent' => round(($disk_free / $disk_total) * 100, 2)
        ];
        
        // Database performance
        if ($this->redis) {
            try {
                $redis_info = $this->redis->info();
                $metrics['redis'] = [
                    'connected_clients' => $redis_info['connected_clients'] ?? 0,
                    'used_memory' => $redis_info['used_memory'] ?? 0,
                    'used_memory_human' => $redis_info['used_memory_human'] ?? '0B'
                ];
            } catch (Exception $e) {
                $metrics['redis'] = ['error' => 'Connection failed'];
            }
        }
        
        return $metrics;
    }
    
    /**
     * Monitor system health
     */
    public function monitorSystemHealth() {
        $health = [
            'status' => 'healthy',
            'issues' => [],
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Check disk space
        $disk_free = disk_free_space('/');
        $disk_total = disk_total_space('/');
        $disk_percent = (($disk_total - $disk_free) / $disk_total) * 100;
        
        if ($disk_percent > 90) {
            $health['status'] = 'critical';
            $health['issues'][] = 'Disk space critical: ' . round($disk_percent, 2) . '% used';
        } elseif ($disk_percent > 80) {
            $health['status'] = 'warning';
            $health['issues'][] = 'Disk space warning: ' . round($disk_percent, 2) . '% used';
        }
        
        // Check memory usage
        $memory_usage = memory_get_usage(true);
        $memory_limit = ini_get('memory_limit');
        $memory_limit_bytes = $this->parseMemoryLimit($memory_limit);
        
        if ($memory_usage > ($memory_limit_bytes * 0.9)) {
            $health['status'] = 'critical';
            $health['issues'][] = 'Memory usage critical: ' . round(($memory_usage / $memory_limit_bytes) * 100, 2) . '% used';
        }
        
        // Check CPU load
        $load_avg = sys_getloadavg();
        if ($load_avg[0] > 2.0) {
            $health['status'] = 'warning';
            $health['issues'][] = 'High CPU load: ' . $load_avg[0];
        }
        
        // Check Redis connection
        if ($this->redis) {
            try {
                $this->redis->ping();
            } catch (Exception $e) {
                $health['status'] = 'warning';
                $health['issues'][] = 'Redis connection failed';
            }
        }
        
        return $health;
    }
    
    /**
     * Send monitoring alert
     */
    public function sendAlert($alert_data) {
        if (!$this->telegram_bot_token || !$this->telegram_chat_id) {
            return false;
        }
        
        $message = $this->formatAlertMessage($alert_data);
        $encrypted_message = $this->encryptMessage($message);
        
        $url = "https://api.telegram.org/bot{$this->telegram_bot_token}/sendMessage";
        $data = [
            'chat_id' => $this->telegram_chat_id,
            'text' => "🔒 ENCRYPTED MONITORING ALERT\n\n{$encrypted_message}",
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
     * Format alert message
     */
    private function formatAlertMessage($alert_data) {
        $message = "🚨 KOPMA WEBSITE MONITORING ALERT\n\n";
        $message .= "Type: " . ($alert_data['type'] ?? 'Unknown') . "\n";
        $message .= "Severity: " . ($alert_data['severity'] ?? 'Unknown') . "\n";
        $message .= "Time: " . ($alert_data['timestamp'] ?? date('Y-m-d H:i:s')) . "\n";
        
        if (isset($alert_data['ip'])) {
            $message .= "IP: " . $alert_data['ip'] . "\n";
        }
        
        if (isset($alert_data['file'])) {
            $message .= "File: " . $alert_data['file'] . "\n";
        }
        
        if (isset($alert_data['details'])) {
            $message .= "Details: " . $alert_data['details'] . "\n";
        }
        
        return $message;
    }
    
    /**
     * Encrypt message
     */
    private function encryptMessage($message) {
        $cipher = "AES-256-GCM";
        $ivlen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $ciphertext = openssl_encrypt($message, $cipher, $this->encryption_key, 0, $iv, $tag);
        return base64_encode($iv . $tag . $ciphertext);
    }
    
    /**
     * Get file type
     */
    private function getFileType($file_path) {
        $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
        
        $types = [
            'php' => 'PHP',
            'html' => 'HTML',
            'css' => 'CSS',
            'js' => 'JavaScript',
            'json' => 'JSON',
            'xml' => 'XML',
            'txt' => 'Text',
            'log' => 'Log',
            'sql' => 'SQL',
            'jpg' => 'Image',
            'jpeg' => 'Image',
            'png' => 'Image',
            'gif' => 'Image',
            'webp' => 'Image',
            'svg' => 'Image',
            'mp4' => 'Video',
            'webm' => 'Video',
            'ogg' => 'Video',
            'mp3' => 'Audio',
            'wav' => 'Audio'
        ];
        
        return $types[$extension] ?? 'Unknown';
    }
    
    /**
     * Check if file is suspicious
     */
    private function isSuspiciousFile($file_path) {
        $suspicious_patterns = [
            '/\.php\.suspected$/',
            '/\.bak$/',
            '/\.old$/',
            '/\.backup$/',
            '/wp-[a-z0-9]+\.php$/',
            '/eval/',
            '/shell/',
            '/backdoor/',
            '/hack/',
            '/exploit/'
        ];
        
        $filename = basename($file_path);
        
        foreach ($suspicious_patterns as $pattern) {
            if (preg_match($pattern, $filename)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if request is suspicious
     */
    private function isSuspiciousRequest($uri, $method, $status) {
        $suspicious_patterns = [
            '/wp-admin/',
            '/wp-login/',
            '/xmlrpc/',
            '/admin/',
            '/administrator/',
            '/phpmyadmin/',
            '/cpanel/',
            '/\.env/',
            '/config/',
            '/backup/',
            '/\.git/',
            '/\.svn/',
            '/\.htaccess/',
            '/\.htpasswd/',
            '/\.DS_Store/',
            '/Thumbs\.db/'
        ];
        
        foreach ($suspicious_patterns as $pattern) {
            if (preg_match($pattern, $uri)) {
                return true;
            }
        }
        
        // Check for suspicious status codes
        if (in_array($status, [403, 404, 500, 502, 503])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Parse memory limit
     */
    private function parseMemoryLimit($memory_limit) {
        $memory_limit = trim($memory_limit);
        $last = strtolower($memory_limit[strlen($memory_limit) - 1]);
        $memory_limit = (int) $memory_limit;
        
        switch ($last) {
            case 'g':
                $memory_limit *= 1024;
            case 'm':
                $memory_limit *= 1024;
            case 'k':
                $memory_limit *= 1024;
        }
        
        return $memory_limit;
    }
    
    /**
     * Store monitoring data
     */
    public function storeMonitoringData($data) {
        if (!$this->redis) {
            return false;
        }
        
        try {
            $key = 'monitoring:' . date('Y-m-d-H');
            $this->redis->hset($key, time(), json_encode($data));
            $this->redis->expire($key, 86400 * 7); // Keep for 7 days
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get monitoring data
     */
    public function getMonitoringData($hours = 24) {
        if (!$this->redis) {
            return [];
        }
        
        $data = [];
        $current_hour = date('Y-m-d-H');
        
        for ($i = 0; $i < $hours; $i++) {
            $hour = date('Y-m-d-H', strtotime("-{$i} hours"));
            $key = "monitoring:{$hour}";
            
            try {
                $hour_data = $this->redis->hgetall($key);
                if ($hour_data) {
                    $data[$hour] = $hour_data;
                }
            } catch (Exception $e) {
                // Skip this hour
            }
        }
        
        return $data;
    }
    
    /**
     * Clean old monitoring data
     */
    public function cleanOldData($days = 7) {
        if (!$this->redis) {
            return false;
        }
        
        try {
            $keys = $this->redis->keys('monitoring:*');
            $cutoff_time = time() - ($days * 24 * 60 * 60);
            
            foreach ($keys as $key) {
                $key_time = strtotime(str_replace('monitoring:', '', $key));
                if ($key_time < $cutoff_time) {
                    $this->redis->del($key);
                }
            }
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>




