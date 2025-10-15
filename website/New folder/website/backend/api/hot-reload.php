<?php
/**
 * Hot Reload API
 * Manages hot reload functionality for updating website without restart
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

// Get hot reload configuration
function get_hot_reload_config() {
    $config_file = __DIR__ . '/../../.hot-reload.json';
    if (file_exists($config_file)) {
        return json_decode(file_get_contents($config_file), true);
    }
    return [
        'enabled' => true,
        'history' => []
    ];
}

// Save hot reload configuration
function save_hot_reload_config($config) {
    $config_file = __DIR__ . '/../../.hot-reload.json';
    file_put_contents($config_file, json_encode($config, JSON_PRETTY_PRINT));
}

// Execute hot reload
function execute_hot_reload($scope = 'all', $file = null) {
    $start_time = microtime(true);
    $status = 'success';
    $message = '';
    
    try {
        switch ($scope) {
            case 'frontend':
                // Rebuild frontend assets
                exec('cd ' . __DIR__ . '/../../ && npm run build:client 2>&1', $output, $return_code);
                if ($return_code !== 0) {
                    throw new Exception('Frontend build failed: ' . implode("\n", $output));
                }
                $message = 'Frontend reloaded successfully';
                break;
                
            case 'backend':
                // Reload PHP opcache
                if (function_exists('opcache_reset')) {
                    opcache_reset();
                }
                $message = 'Backend reloaded successfully';
                break;
                
            case 'all':
            default:
                // Full reload
                if (function_exists('opcache_reset')) {
                    opcache_reset();
                }
                exec('cd ' . __DIR__ . '/../../ && npm run build:client 2>&1', $output, $return_code);
                if ($return_code !== 0) {
                    throw new Exception('Build failed: ' . implode("\n", $output));
                }
                $message = 'Full reload completed successfully';
                break;
        }
    } catch (Exception $e) {
        $status = 'failed';
        $message = $e->getMessage();
    }
    
    $duration = round((microtime(true) - $start_time) * 1000);
    
    // Save to history
    $config = get_hot_reload_config();
    array_unshift($config['history'], [
        'timestamp' => date('Y-m-d H:i:s'),
        'file' => $file,
        'status' => $status,
        'duration' => $duration,
        'message' => $message
    ]);
    
    // Keep only last 100 entries
    $config['history'] = array_slice($config['history'], 0, 100);
    save_hot_reload_config($config);
    
    return [
        'status' => $status,
        'message' => $message,
        'duration' => $duration
    ];
}

switch ($method) {
    case 'GET':
        // Get reload history
        $config = get_hot_reload_config();
        echo json_encode([
            'enabled' => $config['enabled'],
            'history' => $config['history']
        ]);
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['action'] ?? $input['action'] ?? 'trigger';
        
        if ($action === 'trigger') {
            // Trigger hot reload
            $scope = $input['scope'] ?? 'all';
            $file = $input['file'] ?? null;
            
            $result = execute_hot_reload($scope, $file);
            echo json_encode($result);
            
        } elseif ($action === 'toggle') {
            // Toggle auto-reload
            $config = get_hot_reload_config();
            $config['enabled'] = $input['enabled'] ?? !$config['enabled'];
            save_hot_reload_config($config);
            
            echo json_encode([
                'success' => true,
                'enabled' => $config['enabled']
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
