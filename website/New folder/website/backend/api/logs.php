<?php
/**
 * Logs API
 * Manages system logs viewing and management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

header('Content-Type: application/json');

// Authentication check
session_start();
if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Log file locations
$log_files = [
    'website' => __DIR__ . '/../../logs/website.log',
    'backend' => __DIR__ . '/../../logs/backend.log',
    'security' => __DIR__ . '/../../logs/security.log',
    'database' => __DIR__ . '/../../logs/database.log',
    'monitoring' => __DIR__ . '/../../logs/monitoring.log'
];

// Parse log entry
function parse_log_line($line) {
    // Expected format: [2024-10-11 12:00:00] [LEVEL] [SOURCE] Message
    $pattern = '/^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)$/';
    
    if (preg_match($pattern, $line, $matches)) {
        return [
            'timestamp' => $matches[1],
            'level' => strtolower($matches[2]),
            'source' => $matches[3],
            'message' => $matches[4]
        ];
    }
    
    // Fallback for non-standard format
    return [
        'timestamp' => date('Y-m-d H:i:s'),
        'level' => 'info',
        'source' => 'unknown',
        'message' => $line
    ];
}

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'read';
        
        if ($action === 'read') {
            // Read logs
            $limit = intval($_GET['limit'] ?? 1000);
            $source = $_GET['source'] ?? 'all';
            
            $all_logs = [];
            
            // Read from specified source or all sources
            $sources_to_read = $source === 'all' ? array_keys($log_files) : [$source];
            
            foreach ($sources_to_read as $src) {
                if (!isset($log_files[$src])) continue;
                
                $log_file = $log_files[$src];
                
                if (file_exists($log_file)) {
                    $lines = file($log_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    
                    // Get last N lines
                    $lines = array_slice($lines, -$limit);
                    
                    foreach ($lines as $line) {
                        $all_logs[] = parse_log_line($line);
                    }
                }
            }
            
            // Sort by timestamp (newest first)
            usort($all_logs, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            
            // Limit results
            $all_logs = array_slice($all_logs, 0, $limit);
            
            echo json_encode([
                'logs' => $all_logs,
                'count' => count($all_logs)
            ]);
            
        } elseif ($action === 'download') {
            // Download log file
            $source = $_GET['source'] ?? 'website';
            
            if (!isset($log_files[$source])) {
                http_response_code(404);
                echo json_encode(['error' => 'Log source not found']);
                exit;
            }
            
            $log_file = $log_files[$source];
            
            if (!file_exists($log_file)) {
                http_response_code(404);
                echo json_encode(['error' => 'Log file not found']);
                exit;
            }
            
            header('Content-Type: text/plain');
            header('Content-Disposition: attachment; filename="' . $source . '_' . date('Ymd_His') . '.log"');
            readfile($log_file);
            exit;
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['action'] ?? $input['action'] ?? '';
        
        if ($action === 'clear') {
            // Clear all logs
            $cleared = [];
            
            foreach ($log_files as $name => $file) {
                if (file_exists($file)) {
                    // Backup before clearing
                    $backup_file = $file . '.backup.' . date('Ymd_His');
                    copy($file, $backup_file);
                    
                    // Clear the log file
                    file_put_contents($file, '');
                    $cleared[] = $name;
                }
            }
            
            echo json_encode([
                'success' => true,
                'cleared' => $cleared,
                'message' => 'Logs cleared successfully. Backups created.'
            ]);
            
        } elseif ($action === 'write') {
            // Write a log entry
            $level = $input['level'] ?? 'info';
            $source = $input['source'] ?? 'website';
            $message = $input['message'] ?? '';
            
            if (!isset($log_files[$source])) {
                $source = 'website';
            }
            
            $log_file = $log_files[$source];
            $log_dir = dirname($log_file);
            
            if (!is_dir($log_dir)) {
                mkdir($log_dir, 0755, true);
            }
            
            $log_entry = sprintf(
                "[%s] [%s] [%s] %s\n",
                date('Y-m-d H:i:s'),
                strtoupper($level),
                $source,
                $message
            );
            
            file_put_contents($log_file, $log_entry, FILE_APPEND);
            
            echo json_encode([
                'success' => true,
                'message' => 'Log entry written'
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
