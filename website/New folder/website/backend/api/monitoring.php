<?php
// backend/api/monitoring.php
require_once '../config/security.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize security
$security = new UltimateSecurity();

// Check authentication
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$auth_header = $_SERVER['HTTP_AUTHORIZATION'];
$token = str_replace('Bearer ', '', $auth_header);

// Validate token
if (!$security->validateCSRFToken($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit();
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Route requests
switch ($method) {
    case 'GET':
        handleGetRequest($path_parts);
        break;
    case 'POST':
        handlePostRequest($path_parts);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGetRequest($path_parts) {
    if (count($path_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    $action = $path_parts[2];
    
    switch ($action) {
        case 'status':
            getSystemStatus();
            break;
        case 'metrics':
            getSystemMetrics();
            break;
        case 'logs':
            getMonitoringLogs();
            break;
        case 'alerts':
            getAlerts();
            break;
        case 'health':
            getHealthCheck();
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
}

function handlePostRequest($path_parts) {
    if (count($path_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    $action = $path_parts[2];
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'alert':
            createAlert($input);
            break;
        case 'log':
            logEvent($input);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
}

function getSystemStatus() {
    try {
        $status = [
            'uptime' => getUptime(),
            'cpu_usage' => getCpuUsage(),
            'memory_usage' => getMemoryUsage(),
            'disk_usage' => getDiskUsage(),
            'network_status' => getNetworkStatus(),
            'database_status' => getDatabaseStatus(),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $status
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Status error']);
    }
}

function getSystemMetrics() {
    try {
        $metrics = [
            'response_time' => getResponseTime(),
            'throughput' => getThroughput(),
            'error_rate' => getErrorRate(),
            'active_connections' => getActiveConnections(),
            'cache_hit_rate' => getCacheHitRate(),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $metrics
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Metrics error']);
    }
}

function getMonitoringLogs() {
    try {
        $log_files = [
            '/app/logs/security.log',
            '/app/logs/access.log',
            '/app/logs/error.log',
            '/app/logs/monitoring.log'
        ];
        
        $logs = [];
        foreach ($log_files as $log_file) {
            if (file_exists($log_file)) {
                $lines = file($log_file, FILE_IGNORE_NEW_LINES);
                $recent_lines = array_slice($lines, -50); // Last 50 lines
                
                foreach ($recent_lines as $line) {
                    $log_data = json_decode($line, true);
                    if ($log_data) {
                        $logs[] = $log_data;
                    }
                }
            }
        }
        
        // Sort by timestamp
        usort($logs, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        echo json_encode([
            'success' => true,
            'data' => array_slice($logs, 0, 100) // Limit to 100 entries
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Logs error']);
    }
}

function getAlerts() {
    try {
        $db = new Database();
        $alerts = $db->query("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50");
        
        echo json_encode([
            'success' => true,
            'data' => $alerts
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Alerts error']);
    }
}

function getHealthCheck() {
    try {
        $health = [
            'database' => checkDatabaseHealth(),
            'redis' => checkRedisHealth(),
            'nginx' => checkNginxHealth(),
            'php' => checkPhpHealth(),
            'disk_space' => checkDiskSpace(),
            'overall' => 'healthy'
        ];
        
        // Determine overall health
        $unhealthy_services = array_filter($health, function($status) {
            return $status !== 'healthy';
        });
        
        if (!empty($unhealthy_services)) {
            $health['overall'] = 'degraded';
        }
        
        echo json_encode([
            'success' => true,
            'data' => $health
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Health check error']);
    }
}

function createAlert($input) {
    try {
        $db = new Database();
        
        $alert_data = [
            'type' => $input['type'] ?? 'info',
            'severity' => $input['severity'] ?? 'medium',
            'message' => $input['message'] ?? '',
            'source' => $input['source'] ?? 'system',
            'data' => json_encode($input['data'] ?? [])
        ];
        
        $db->query("INSERT INTO alerts (type, severity, message, source, data, created_at) VALUES (?, ?, ?, ?, ?, NOW())", 
            array_values($alert_data));
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Alert creation error']);
    }
}

function logEvent($input) {
    try {
        $log_data = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $input['event'] ?? 'unknown',
            'severity' => $input['severity'] ?? 'info',
            'source' => $input['source'] ?? 'api',
            'data' => $input['data'] ?? []
        ];
        
        $log_file = '/app/logs/monitoring.log';
        file_put_contents($log_file, json_encode($log_data) . "\n", FILE_APPEND | LOCK_EX);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Logging error']);
    }
}

// Helper functions
function getUptime() {
    $uptime = shell_exec('uptime -p');
    return trim($uptime);
}

function getCpuUsage() {
    $load = sys_getloadavg();
    return [
        '1min' => $load[0],
        '5min' => $load[1],
        '15min' => $load[2]
    ];
}

function getMemoryUsage() {
    $meminfo = file_get_contents('/proc/meminfo');
    preg_match('/MemTotal:\s+(\d+)/', $meminfo, $total);
    preg_match('/MemAvailable:\s+(\d+)/', $meminfo, $available);
    
    $total_kb = intval($total[1]);
    $available_kb = intval($available[1]);
    $used_kb = $total_kb - $available_kb;
    
    return [
        'total' => $total_kb * 1024,
        'used' => $used_kb * 1024,
        'available' => $available_kb * 1024,
        'percentage' => round(($used_kb / $total_kb) * 100, 2)
    ];
}

function getDiskUsage() {
    $bytes = disk_free_space('/');
    $total_bytes = disk_total_space('/');
    $used_bytes = $total_bytes - $bytes;
    
    return [
        'total' => $total_bytes,
        'used' => $used_bytes,
        'free' => $bytes,
        'percentage' => round(($used_bytes / $total_bytes) * 100, 2)
    ];
}

function getNetworkStatus() {
    $interfaces = ['eth0', 'wlan0'];
    $status = [];
    
    foreach ($interfaces as $interface) {
        $status[$interface] = [
            'up' => file_exists("/sys/class/net/$interface/operstate") && 
                   trim(file_get_contents("/sys/class/net/$interface/operstate")) === 'up'
        ];
    }
    
    return $status;
}

function getDatabaseStatus() {
    try {
        $db = new Database();
        $result = $db->query("SELECT 1");
        return 'connected';
    } catch (Exception $e) {
        return 'disconnected';
    }
}

function getResponseTime() {
    // This would typically be calculated from actual request logs
    return rand(50, 200); // Mock data
}

function getThroughput() {
    // This would typically be calculated from actual request logs
    return rand(100, 1000); // Mock data
}

function getErrorRate() {
    // This would typically be calculated from actual request logs
    return rand(0, 5); // Mock data
}

function getActiveConnections() {
    $connections = shell_exec('netstat -an | grep :80 | wc -l');
    return intval(trim($connections));
}

function getCacheHitRate() {
    // This would typically be calculated from Redis or other cache metrics
    return rand(80, 95); // Mock data
}

function checkDatabaseHealth() {
    try {
        $db = new Database();
        $db->query("SELECT 1");
        return 'healthy';
    } catch (Exception $e) {
        return 'unhealthy';
    }
}

function checkRedisHealth() {
    try {
        $redis = new Redis();
        $redis->connect('redis', 6379);
        $redis->ping();
        return 'healthy';
    } catch (Exception $e) {
        return 'unhealthy';
    }
}

function checkNginxHealth() {
    $status = shell_exec('systemctl is-active nginx');
    return trim($status) === 'active' ? 'healthy' : 'unhealthy';
}

function checkPhpHealth() {
    $status = shell_exec('systemctl is-active php8.2-fpm');
    return trim($status) === 'active' ? 'healthy' : 'unhealthy';
}

function checkDiskSpace() {
    $free_space = disk_free_space('/');
    $total_space = disk_total_space('/');
    $used_percentage = (($total_space - $free_space) / $total_space) * 100;
    
    return $used_percentage < 90 ? 'healthy' : 'unhealthy';
}
?>




