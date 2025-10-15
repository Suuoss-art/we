<?php
// backend/api/admin.php
require_once '../config/security.php';
require_once '../config/database.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
    case 'PUT':
        handlePutRequest($path_parts);
        break;
    case 'DELETE':
        handleDeleteRequest($path_parts);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGetRequest($path_parts) {
    global $security;
    
    if (count($path_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    $action = $path_parts[2];
    
    switch ($action) {
        case 'users':
            getUsers();
            break;
        case 'settings':
            getSettings();
            break;
        case 'analytics':
            getAnalytics();
            break;
        case 'logs':
            getLogs();
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
}

function handlePostRequest($path_parts) {
    global $security;
    
    if (count($path_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    $action = $path_parts[2];
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!$security->validateInput($input, 'json')) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        return;
    }
    
    switch ($action) {
        case 'login':
            handleLogin($input);
            break;
        case 'logout':
            handleLogout();
            break;
        case 'update-content':
            updateContent($input);
            break;
        case 'upload-media':
            uploadMedia($input);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
}

function handlePutRequest($path_parts) {
    global $security;
    
    if (count($path_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    $action = $path_parts[2];
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'settings':
            updateSettings($input);
            break;
        case 'user':
            updateUser($input);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
}

function handleDeleteRequest($path_parts) {
    if (count($path_parts) < 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    $action = $path_parts[2];
    
    switch ($action) {
        case 'user':
            deleteUser($path_parts[3] ?? null);
            break;
        case 'media':
            deleteMedia($path_parts[3] ?? null);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            break;
    }
}

function getUsers() {
    try {
        $db = new Database();
        $users = $db->query("SELECT id, username, email, role, created_at FROM users WHERE active = 1");
        
        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getSettings() {
    try {
        $db = new Database();
        $settings = $db->query("SELECT * FROM settings");
        
        echo json_encode([
            'success' => true,
            'data' => $settings
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getAnalytics() {
    try {
        $db = new Database();
        
        // Get basic analytics
        $stats = [
            'total_visits' => $db->query("SELECT COUNT(*) as count FROM visits")[0]['count'],
            'unique_visitors' => $db->query("SELECT COUNT(DISTINCT ip) as count FROM visits")[0]['count'],
            'page_views' => $db->query("SELECT COUNT(*) as count FROM page_views")[0]['count']
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getLogs() {
    try {
        $log_file = '/app/logs/security.log';
        if (!file_exists($log_file)) {
            echo json_encode([
                'success' => true,
                'data' => []
            ]);
            return;
        }
        
        $logs = [];
        $lines = file($log_file, FILE_IGNORE_NEW_LINES);
        $recent_lines = array_slice($lines, -100); // Last 100 lines
        
        foreach ($recent_lines as $line) {
            $log_data = json_decode($line, true);
            if ($log_data) {
                $logs[] = $log_data;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $logs
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Log error']);
    }
}

function handleLogin($input) {
    global $security;
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        return;
    }
    
    try {
        $db = new Database();
        $user = $db->query("SELECT * FROM users WHERE username = ? AND active = 1", [$username]);
        
        if (empty($user) || !password_verify($password, $user[0]['password'])) {
            $security->logSecurityEvent('Failed login attempt', 'warning');
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }
        
        // Generate session token
        $token = bin2hex(random_bytes(32));
        $session_data = [
            'user_id' => $user[0]['id'],
            'username' => $user[0]['username'],
            'role' => $user[0]['role'],
            'expires' => time() + 3600
        ];
        
        // Store session
        $db->query("INSERT INTO sessions (token, user_id, data, expires) VALUES (?, ?, ?, ?)", [
            $token,
            $user[0]['id'],
            json_encode($session_data),
            $session_data['expires']
        ]);
        
        $security->logSecurityEvent('Successful login', 'info');
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user[0]['id'],
                'username' => $user[0]['username'],
                'role' => $user[0]['role']
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login error']);
    }
}

function handleLogout() {
    global $security;
    
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    
    try {
        $db = new Database();
        $db->query("DELETE FROM sessions WHERE token = ?", [$token]);
        
        $security->logSecurityEvent('User logout', 'info');
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Logout error']);
    }
}

function updateContent($input) {
    try {
        $db = new Database();
        
        $page = $input['page'] ?? '';
        $content = $input['content'] ?? '';
        
        if (empty($page) || empty($content)) {
            http_response_code(400);
            echo json_encode(['error' => 'Page and content required']);
            return;
        }
        
        $db->query("UPDATE pages SET content = ?, updated_at = NOW() WHERE slug = ?", [$content, $page]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Update error']);
    }
}

function uploadMedia($input) {
    try {
        // Handle file upload
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            return;
        }
        
        $file = $_FILES['file'];
        $upload_dir = '/app/public/assets/uploads/';
        
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        $filename = uniqid() . '_' . $file['name'];
        $filepath = $upload_dir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $db = new Database();
            $db->query("INSERT INTO media (filename, original_name, path, size, type) VALUES (?, ?, ?, ?, ?)", [
                $filename,
                $file['name'],
                '/assets/uploads/' . $filename,
                $file['size'],
                $file['type']
            ]);
            
            echo json_encode([
                'success' => true,
                'filename' => $filename,
                'url' => '/assets/uploads/' . $filename
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Upload failed']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Upload error']);
    }
}

function updateSettings($input) {
    try {
        $db = new Database();
        
        foreach ($input as $key => $value) {
            $db->query("UPDATE settings SET value = ? WHERE setting_key = ?", [$value, $key]);
        }
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Update error']);
    }
}

function updateUser($input) {
    try {
        $db = new Database();
        
        $user_id = $input['id'] ?? null;
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            return;
        }
        
        $fields = ['username', 'email', 'role'];
        $updates = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $values[] = $input[$field];
            }
        }
        
        if (!empty($updates)) {
            $values[] = $user_id;
            $db->query("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?", $values);
        }
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Update error']);
    }
}

function deleteUser($user_id) {
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID required']);
        return;
    }
    
    try {
        $db = new Database();
        $db->query("UPDATE users SET active = 0 WHERE id = ?", [$user_id]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Delete error']);
    }
}

function deleteMedia($media_id) {
    if (!$media_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Media ID required']);
        return;
    }
    
    try {
        $db = new Database();
        $media = $db->query("SELECT path FROM media WHERE id = ?", [$media_id]);
        
        if (!empty($media)) {
            $filepath = '/app/public' . $media[0]['path'];
            if (file_exists($filepath)) {
                unlink($filepath);
            }
        }
        
        $db->query("DELETE FROM media WHERE id = ?", [$media_id]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Delete error']);
    }
}
?>




