<?php
/**
 * File Management API
 * Handles file operations: list, read, write, delete, upload
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
$path = $_GET['path'] ?? '/';

// Base directory (restrict to website directory for security)
$base_dir = realpath(__DIR__ . '/../../src');

// Security: Prevent directory traversal
function sanitize_path($path, $base_dir) {
    $real_path = realpath($base_dir . '/' . $path);
    if ($real_path === false || strpos($real_path, $base_dir) !== 0) {
        return false;
    }
    return $real_path;
}

switch ($method) {
    case 'GET':
        // List files or read file content
        if (isset($_GET['action']) && $_GET['action'] === 'read') {
            // Read file content
            $file_path = sanitize_path($path, $base_dir);
            if ($file_path === false || !file_exists($file_path) || !is_file($file_path)) {
                http_response_code(404);
                echo json_encode(['error' => 'File not found']);
                exit;
            }
            
            $content = file_get_contents($file_path);
            echo json_encode([
                'content' => $content,
                'path' => $path,
                'size' => filesize($file_path),
                'modified' => date('Y-m-d H:i:s', filemtime($file_path))
            ]);
        } else {
            // List directory contents
            $dir_path = sanitize_path($path, $base_dir);
            if ($dir_path === false || !file_exists($dir_path) || !is_dir($dir_path)) {
                http_response_code(404);
                echo json_encode(['error' => 'Directory not found']);
                exit;
            }
            
            $files = [];
            $items = scandir($dir_path);
            
            foreach ($items as $item) {
                if ($item === '.' || $item === '..') continue;
                
                $item_path = $dir_path . '/' . $item;
                $relative_path = str_replace($base_dir, '', $item_path);
                
                $files[] = [
                    'name' => $item,
                    'path' => $relative_path,
                    'type' => is_dir($item_path) ? 'directory' : 'file',
                    'size' => is_file($item_path) ? filesize($item_path) : 0,
                    'modified' => date('Y-m-d H:i:s', filemtime($item_path)),
                    'permissions' => substr(sprintf('%o', fileperms($item_path)), -4)
                ];
            }
            
            echo json_encode(['files' => $files]);
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['action']) && $input['action'] === 'write') {
            // Write file content
            $file_path = sanitize_path($input['path'], $base_dir);
            if ($file_path === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid path']);
                exit;
            }
            
            // Create backup before writing
            if (file_exists($file_path)) {
                $backup_path = $file_path . '.backup.' . time();
                copy($file_path, $backup_path);
            }
            
            $result = file_put_contents($file_path, $input['content']);
            
            if ($result !== false) {
                echo json_encode([
                    'success' => true,
                    'message' => 'File saved successfully',
                    'size' => $result
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to write file']);
            }
        } elseif (isset($input['action']) && $input['action'] === 'create-folder') {
            // Create new folder
            $folder_path = sanitize_path($input['path'] . '/' . $input['name'], $base_dir);
            if ($folder_path === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid path']);
                exit;
            }
            
            if (mkdir($folder_path, 0755, true)) {
                echo json_encode(['success' => true, 'message' => 'Folder created']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create folder']);
            }
        } elseif (isset($_FILES['files'])) {
            // Handle file upload
            $upload_path = sanitize_path($input['path'] ?? $path, $base_dir);
            if ($upload_path === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid path']);
                exit;
            }
            
            $uploaded = [];
            foreach ($_FILES['files']['tmp_name'] as $key => $tmp_name) {
                $file_name = $_FILES['files']['name'][$key];
                $target = $upload_path . '/' . basename($file_name);
                
                if (move_uploaded_file($tmp_name, $target)) {
                    $uploaded[] = $file_name;
                }
            }
            
            echo json_encode([
                'success' => true,
                'uploaded' => $uploaded,
                'count' => count($uploaded)
            ]);
        }
        break;
        
    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $file_path = sanitize_path($input['path'], $base_dir);
        
        if ($file_path === false || !file_exists($file_path)) {
            http_response_code(404);
            echo json_encode(['error' => 'File not found']);
            exit;
        }
        
        if (is_dir($file_path)) {
            $result = rmdir($file_path);
        } else {
            $result = unlink($file_path);
        }
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
