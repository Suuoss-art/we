<?php
// backend/api/content.php
require_once '../config/database.php';
require_once '../config/security.php';
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

$security = getSecurity();
$db = getDB();

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'pages':
            if ($method === 'GET') {
                handleGetPages();
            } elseif ($method === 'POST') {
                handleCreatePage();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'page':
            if ($method === 'GET') {
                handleGetPage();
            } elseif ($method === 'PUT') {
                handleUpdatePage();
            } elseif ($method === 'DELETE') {
                handleDeletePage();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'posts':
            if ($method === 'GET') {
                handleGetPosts();
            } elseif ($method === 'POST') {
                handleCreatePost();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'post':
            if ($method === 'GET') {
                handleGetPost();
            } elseif ($method === 'PUT') {
                handleUpdatePost();
            } elseif ($method === 'DELETE') {
                handleDeletePost();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'media':
            if ($method === 'GET') {
                handleGetMedia();
            } elseif ($method === 'POST') {
                handleUploadMedia();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'media-item':
            if ($method === 'GET') {
                handleGetMediaItem();
            } elseif ($method === 'PUT') {
                handleUpdateMediaItem();
            } elseif ($method === 'DELETE') {
                handleDeleteMediaItem();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'settings':
            if ($method === 'GET') {
                handleGetSettings();
            } elseif ($method === 'PUT') {
                handleUpdateSettings();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function handleGetPages() {
    global $security, $db;
    
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(1, intval($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    
    $search = $security->validateInput($_GET['search'] ?? '', 'text');
    $status = $security->validateInput($_GET['status'] ?? '', 'text');
    
    $whereConditions = ['1=1'];
    $params = [];
    
    if ($search) {
        $whereConditions[] = "(title LIKE ? OR content LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }
    
    if ($status) {
        $whereConditions[] = "status = ?";
        $params[] = $status;
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    // Get total count
    $totalCount = $db->fetch("SELECT COUNT(*) as count FROM pages WHERE {$whereClause}", $params)['count'];
    
    // Get pages
    $pages = $db->fetchAll(
        "SELECT id, title, slug, content, status, created_at, updated_at, author_id FROM pages WHERE {$whereClause} ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}",
        $params
    );
    
    echo json_encode([
        'success' => true,
        'data' => [
            'pages' => $pages,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'pages' => ceil($totalCount / $limit)
            ]
        ]
    ]);
}

function handleCreatePage() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    $title = $security->validateInput($input['title'] ?? '', 'text');
    $content = $security->validateHtml($input['content'] ?? '', ['allowed_tags' => '<p><br><strong><em><u><a><ul><ol><li><h1><h2><h3><h4><h5><h6>']);
    $slug = $security->validateInput($input['slug'] ?? '', 'text');
    $status = $security->validateInput($input['status'] ?? 'draft', 'text');
    
    if (!$title) {
        throw new Exception('Title is required');
    }
    
    if (!$content) {
        throw new Exception('Content is required');
    }
    
    // Generate slug if not provided
    if (!$slug) {
        $slug = generateSlug($title);
    }
    
    // Check if slug already exists
    $existingPage = $db->fetch("SELECT id FROM pages WHERE slug = ?", [$slug]);
    if ($existingPage) {
        $slug = $slug . '-' . time();
    }
    
    // Insert page
    $pageId = $db->insert('pages', [
        'title' => $title,
        'slug' => $slug,
        'content' => $content,
        'status' => $status,
        'author_id' => $_SESSION['user_id'],
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    
    $security->logSecurityEvent('PAGE_CREATED', [
        'user_id' => $_SESSION['user_id'],
        'page_id' => $pageId,
        'title' => $title
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Page created successfully',
        'data' => [
            'page_id' => $pageId,
            'slug' => $slug
        ]
    ]);
}

function handleGetPage() {
    global $security, $db;
    
    $pageId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$pageId) {
        throw new Exception('Page ID is required');
    }
    
    $page = $db->fetch(
        "SELECT p.*, u.first_name, u.last_name FROM pages p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?",
        [$pageId]
    );
    
    if (!$page) {
        throw new Exception('Page not found');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $page
    ]);
}

function handleUpdatePage() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $pageId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$pageId) {
        throw new Exception('Page ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Check if page exists and user has permission
    $page = $db->fetch("SELECT * FROM pages WHERE id = ?", [$pageId]);
    if (!$page) {
        throw new Exception('Page not found');
    }
    
    // Check if user is author or admin
    if ($page['author_id'] != $_SESSION['user_id'] && $_SESSION['user_role'] !== 'admin') {
        throw new Exception('Permission denied');
    }
    
    $title = $security->validateInput($input['title'] ?? '', 'text');
    $content = $security->validateHtml($input['content'] ?? '', ['allowed_tags' => '<p><br><strong><em><u><a><ul><ol><li><h1><h2><h3><h4><h5><h6>']);
    $slug = $security->validateInput($input['slug'] ?? '', 'text');
    $status = $security->validateInput($input['status'] ?? '', 'text');
    
    if (!$title) {
        throw new Exception('Title is required');
    }
    
    if (!$content) {
        throw new Exception('Content is required');
    }
    
    // Generate slug if not provided
    if (!$slug) {
        $slug = generateSlug($title);
    }
    
    // Check if slug already exists (excluding current page)
    $existingPage = $db->fetch("SELECT id FROM pages WHERE slug = ? AND id != ?", [$slug, $pageId]);
    if ($existingPage) {
        $slug = $slug . '-' . time();
    }
    
    // Update page
    $updateData = [
        'title' => $title,
        'content' => $content,
        'slug' => $slug,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    if ($status) {
        $updateData['status'] = $status;
    }
    
    $db->update('pages', $updateData, 'id = ?', [$pageId]);
    
    $security->logSecurityEvent('PAGE_UPDATED', [
        'user_id' => $_SESSION['user_id'],
        'page_id' => $pageId,
        'title' => $title
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Page updated successfully'
    ]);
}

function handleDeletePage() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $pageId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$pageId) {
        throw new Exception('Page ID is required');
    }
    
    // Check if page exists and user has permission
    $page = $db->fetch("SELECT * FROM pages WHERE id = ?", [$pageId]);
    if (!$page) {
        throw new Exception('Page not found');
    }
    
    // Check if user is author or admin
    if ($page['author_id'] != $_SESSION['user_id'] && $_SESSION['user_role'] !== 'admin') {
        throw new Exception('Permission denied');
    }
    
    // Delete page
    $db->delete('pages', 'id = ?', [$pageId]);
    
    $security->logSecurityEvent('PAGE_DELETED', [
        'user_id' => $_SESSION['user_id'],
        'page_id' => $pageId,
        'title' => $page['title']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Page deleted successfully'
    ]);
}

function handleGetPosts() {
    global $security, $db;
    
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(1, intval($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    
    $search = $security->validateInput($_GET['search'] ?? '', 'text');
    $status = $security->validateInput($_GET['status'] ?? '', 'text');
    $category = $security->validateInput($_GET['category'] ?? '', 'text');
    
    $whereConditions = ['1=1'];
    $params = [];
    
    if ($search) {
        $whereConditions[] = "(title LIKE ? OR content LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }
    
    if ($status) {
        $whereConditions[] = "status = ?";
        $params[] = $status;
    }
    
    if ($category) {
        $whereConditions[] = "category = ?";
        $params[] = $category;
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    // Get total count
    $totalCount = $db->fetch("SELECT COUNT(*) as count FROM posts WHERE {$whereClause}", $params)['count'];
    
    // Get posts
    $posts = $db->fetchAll(
        "SELECT p.*, u.first_name, u.last_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE {$whereClause} ORDER BY p.created_at DESC LIMIT {$limit} OFFSET {$offset}",
        $params
    );
    
    echo json_encode([
        'success' => true,
        'data' => [
            'posts' => $posts,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'pages' => ceil($totalCount / $limit)
            ]
        ]
    ]);
}

function handleCreatePost() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    $title = $security->validateInput($input['title'] ?? '', 'text');
    $content = $security->validateHtml($input['content'] ?? '', ['allowed_tags' => '<p><br><strong><em><u><a><ul><ol><li><h1><h2><h3><h4><h5><h6>']);
    $excerpt = $security->validateInput($input['excerpt'] ?? '', 'text');
    $category = $security->validateInput($input['category'] ?? '', 'text');
    $tags = $security->validateInput($input['tags'] ?? '', 'text');
    $status = $security->validateInput($input['status'] ?? 'draft', 'text');
    
    if (!$title) {
        throw new Exception('Title is required');
    }
    
    if (!$content) {
        throw new Exception('Content is required');
    }
    
    // Generate slug
    $slug = generateSlug($title);
    
    // Check if slug already exists
    $existingPost = $db->fetch("SELECT id FROM posts WHERE slug = ?", [$slug]);
    if ($existingPost) {
        $slug = $slug . '-' . time();
    }
    
    // Insert post
    $postId = $db->insert('posts', [
        'title' => $title,
        'slug' => $slug,
        'content' => $content,
        'excerpt' => $excerpt,
        'category' => $category,
        'tags' => $tags,
        'status' => $status,
        'author_id' => $_SESSION['user_id'],
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);
    
    $security->logSecurityEvent('POST_CREATED', [
        'user_id' => $_SESSION['user_id'],
        'post_id' => $postId,
        'title' => $title
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'data' => [
            'post_id' => $postId,
            'slug' => $slug
        ]
    ]);
}

function handleGetPost() {
    global $security, $db;
    
    $postId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$postId) {
        throw new Exception('Post ID is required');
    }
    
    $post = $db->fetch(
        "SELECT p.*, u.first_name, u.last_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?",
        [$postId]
    );
    
    if (!$post) {
        throw new Exception('Post not found');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $post
    ]);
}

function handleUpdatePost() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $postId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$postId) {
        throw new Exception('Post ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Check if post exists and user has permission
    $post = $db->fetch("SELECT * FROM posts WHERE id = ?", [$postId]);
    if (!$post) {
        throw new Exception('Post not found');
    }
    
    // Check if user is author or admin
    if ($post['author_id'] != $_SESSION['user_id'] && $_SESSION['user_role'] !== 'admin') {
        throw new Exception('Permission denied');
    }
    
    $title = $security->validateInput($input['title'] ?? '', 'text');
    $content = $security->validateHtml($input['content'] ?? '', ['allowed_tags' => '<p><br><strong><em><u><a><ul><ol><li><h1><h2><h3><h4><h5><h6>']);
    $excerpt = $security->validateInput($input['excerpt'] ?? '', 'text');
    $category = $security->validateInput($input['category'] ?? '', 'text');
    $tags = $security->validateInput($input['tags'] ?? '', 'text');
    $status = $security->validateInput($input['status'] ?? '', 'text');
    
    if (!$title) {
        throw new Exception('Title is required');
    }
    
    if (!$content) {
        throw new Exception('Content is required');
    }
    
    // Generate slug
    $slug = generateSlug($title);
    
    // Check if slug already exists (excluding current post)
    $existingPost = $db->fetch("SELECT id FROM posts WHERE slug = ? AND id != ?", [$slug, $postId]);
    if ($existingPost) {
        $slug = $slug . '-' . time();
    }
    
    // Update post
    $updateData = [
        'title' => $title,
        'content' => $content,
        'excerpt' => $excerpt,
        'category' => $category,
        'tags' => $tags,
        'slug' => $slug,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    if ($status) {
        $updateData['status'] = $status;
    }
    
    $db->update('posts', $updateData, 'id = ?', [$postId]);
    
    $security->logSecurityEvent('POST_UPDATED', [
        'user_id' => $_SESSION['user_id'],
        'post_id' => $postId,
        'title' => $title
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post updated successfully'
    ]);
}

function handleDeletePost() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $postId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$postId) {
        throw new Exception('Post ID is required');
    }
    
    // Check if post exists and user has permission
    $post = $db->fetch("SELECT * FROM posts WHERE id = ?", [$postId]);
    if (!$post) {
        throw new Exception('Post not found');
    }
    
    // Check if user is author or admin
    if ($post['author_id'] != $_SESSION['user_id'] && $_SESSION['user_role'] !== 'admin') {
        throw new Exception('Permission denied');
    }
    
    // Delete post
    $db->delete('posts', 'id = ?', [$postId]);
    
    $security->logSecurityEvent('POST_DELETED', [
        'user_id' => $_SESSION['user_id'],
        'post_id' => $postId,
        'title' => $post['title']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post deleted successfully'
    ]);
}

function handleGetMedia() {
    global $security, $db;
    
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    $search = $security->validateInput($_GET['search'] ?? '', 'text');
    $type = $security->validateInput($_GET['type'] ?? '', 'text');
    
    $whereConditions = ['1=1'];
    $params = [];
    
    if ($search) {
        $whereConditions[] = "(filename LIKE ? OR alt_text LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }
    
    if ($type) {
        $whereConditions[] = "type = ?";
        $params[] = $type;
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    // Get total count
    $totalCount = $db->fetch("SELECT COUNT(*) as count FROM media WHERE {$whereClause}", $params)['count'];
    
    // Get media
    $media = $db->fetchAll(
        "SELECT * FROM media WHERE {$whereClause} ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}",
        $params
    );
    
    echo json_encode([
        'success' => true,
        'data' => [
            'media' => $media,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'pages' => ceil($totalCount / $limit)
            ]
        ]
    ]);
}

function handleUploadMedia() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }
    
    $file = $_FILES['file'];
    
    // Validate file upload
    $validation = $security->validateFileUpload($file);
    if (!$validation['valid']) {
        throw new Exception($validation['error']);
    }
    
    // Generate unique filename
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = uniqid() . '.' . $extension;
    $uploadPath = '../uploads/' . $filename;
    
    // Create uploads directory if it doesn't exist
    if (!is_dir('../uploads')) {
        mkdir('../uploads', 0755, true);
    }
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to upload file');
    }
    
    // Get file info
    $fileSize = filesize($uploadPath);
    $mimeType = mime_content_type($uploadPath);
    
    // Determine media type
    $mediaType = 'other';
    if (strpos($mimeType, 'image/') === 0) {
        $mediaType = 'image';
    } elseif (strpos($mimeType, 'video/') === 0) {
        $mediaType = 'video';
    } elseif (strpos($mimeType, 'audio/') === 0) {
        $mediaType = 'audio';
    } elseif (strpos($mimeType, 'application/pdf') === 0) {
        $mediaType = 'document';
    }
    
    // Insert media record
    $mediaId = $db->insert('media', [
        'filename' => $filename,
        'original_name' => $file['name'],
        'type' => $mediaType,
        'mime_type' => $mimeType,
        'size' => $fileSize,
        'alt_text' => '',
        'uploaded_by' => $_SESSION['user_id'],
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    $security->logSecurityEvent('MEDIA_UPLOADED', [
        'user_id' => $_SESSION['user_id'],
        'media_id' => $mediaId,
        'filename' => $filename,
        'size' => $fileSize
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'data' => [
            'media_id' => $mediaId,
            'filename' => $filename,
            'url' => '/uploads/' . $filename,
            'type' => $mediaType,
            'size' => $fileSize
        ]
    ]);
}

function handleGetMediaItem() {
    global $security, $db;
    
    $mediaId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$mediaId) {
        throw new Exception('Media ID is required');
    }
    
    $media = $db->fetch("SELECT * FROM media WHERE id = ?", [$mediaId]);
    
    if (!$media) {
        throw new Exception('Media not found');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $media
    ]);
}

function handleUpdateMediaItem() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $mediaId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$mediaId) {
        throw new Exception('Media ID is required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    $altText = $security->validateInput($input['alt_text'] ?? '', 'text');
    
    // Update media
    $db->update('media', [
        'alt_text' => $altText,
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = ?', [$mediaId]);
    
    $security->logSecurityEvent('MEDIA_UPDATED', [
        'user_id' => $_SESSION['user_id'],
        'media_id' => $mediaId
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Media updated successfully'
    ]);
}

function handleDeleteMediaItem() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $mediaId = $security->validateInput($_GET['id'] ?? '', 'integer');
    
    if (!$mediaId) {
        throw new Exception('Media ID is required');
    }
    
    // Get media info
    $media = $db->fetch("SELECT * FROM media WHERE id = ?", [$mediaId]);
    if (!$media) {
        throw new Exception('Media not found');
    }
    
    // Delete file
    $filePath = '../uploads/' . $media['filename'];
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    
    // Delete media record
    $db->delete('media', 'id = ?', [$mediaId]);
    
    $security->logSecurityEvent('MEDIA_DELETED', [
        'user_id' => $_SESSION['user_id'],
        'media_id' => $mediaId,
        'filename' => $media['filename']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Media deleted successfully'
    ]);
}

function handleGetSettings() {
    global $security, $db;
    
    $settings = $db->fetchAll("SELECT * FROM settings ORDER BY category, name");
    
    $groupedSettings = [];
    foreach ($settings as $setting) {
        $groupedSettings[$setting['category']][] = $setting;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $groupedSettings
    ]);
}

function handleUpdateSettings() {
    global $security, $db;
    
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    // Check if user is admin
    if ($_SESSION['user_role'] !== 'admin') {
        throw new Exception('Permission denied');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    $settings = $input['settings'] ?? [];
    
    foreach ($settings as $setting) {
        $id = $security->validateInput($setting['id'] ?? '', 'integer');
        $value = $security->validateInput($setting['value'] ?? '', 'text');
        
        if ($id) {
            $db->update('settings', [
                'value' => $value,
                'updated_at' => date('Y-m-d H:i:s')
            ], 'id = ?', [$id]);
        }
    }
    
    $security->logSecurityEvent('SETTINGS_UPDATED', [
        'user_id' => $_SESSION['user_id']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Settings updated successfully'
    ]);
}

function generateSlug($title) {
    // Convert to lowercase
    $slug = strtolower($title);
    
    // Replace spaces with hyphens
    $slug = str_replace(' ', '-', $slug);
    
    // Remove special characters
    $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
    
    // Remove multiple hyphens
    $slug = preg_replace('/-+/', '-', $slug);
    
    // Trim hyphens from ends
    $slug = trim($slug, '-');
    
    return $slug;
}
?>
