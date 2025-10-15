<?php
// backend/api/auth.php
require_once '../config/database.php';
require_once '../config/security.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
        case 'login':
            if ($method === 'POST') {
                handleLogin();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'register':
            if ($method === 'POST') {
                handleRegister();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'logout':
            if ($method === 'POST') {
                handleLogout();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'verify':
            if ($method === 'POST') {
                handleVerify();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'reset-password':
            if ($method === 'POST') {
                handleResetPassword();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'change-password':
            if ($method === 'POST') {
                handleChangePassword();
            } else {
                throw new Exception('Method not allowed');
            }
            break;
            
        case 'profile':
            if ($method === 'GET') {
                handleGetProfile();
            } elseif ($method === 'PUT') {
                handleUpdateProfile();
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

function handleLogin() {
    global $security, $db;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Validate input
    $email = $security->validateInput($input['email'] ?? '', 'email');
    $password = $input['password'] ?? '';
    
    if (!$email) {
        throw new Exception('Invalid email address');
    }
    
    if (empty($password)) {
        throw new Exception('Password is required');
    }
    
    // Get user from database
    $user = $db->fetch(
        "SELECT id, email, password, first_name, last_name, role, status, last_login, failed_attempts, locked_until FROM users WHERE email = ? AND status = 'active'",
        [$email]
    );
    
    if (!$user) {
        $security->logSecurityEvent('LOGIN_FAILED', [
            'email' => $email,
            'reason' => 'User not found'
        ]);
        throw new Exception('Invalid credentials');
    }
    
    // Check if account is locked
    if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
        $security->logSecurityEvent('LOGIN_FAILED', [
            'email' => $email,
            'reason' => 'Account locked'
        ]);
        throw new Exception('Account is temporarily locked');
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        // Increment failed attempts
        $failedAttempts = $user['failed_attempts'] + 1;
        $lockedUntil = null;
        
        if ($failedAttempts >= 5) {
            $lockedUntil = date('Y-m-d H:i:s', time() + 3600); // Lock for 1 hour
        }
        
        $db->update('users', [
            'failed_attempts' => $failedAttempts,
            'locked_until' => $lockedUntil
        ], 'id = ?', [$user['id']]);
        
        $security->logSecurityEvent('LOGIN_FAILED', [
            'email' => $email,
            'reason' => 'Invalid password',
            'failed_attempts' => $failedAttempts
        ]);
        
        throw new Exception('Invalid credentials');
    }
    
    // Reset failed attempts on successful login
    $db->update('users', [
        'failed_attempts' => 0,
        'locked_until' => null,
        'last_login' => date('Y-m-d H:i:s')
    ], 'id = ?', [$user['id']]);
    
    // Generate session token
    $sessionToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour
    
    // Store session in database
    $db->insert('user_sessions', [
        'user_id' => $user['id'],
        'token' => $sessionToken,
        'expires_at' => $expiresAt,
        'ip_address' => $security->getClientIP(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['session_token'] = $sessionToken;
    
    $security->logSecurityEvent('LOGIN_SUCCESS', [
        'user_id' => $user['id'],
        'email' => $email
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role']
            ],
            'session_token' => $sessionToken,
            'expires_at' => $expiresAt
        ]
    ]);
}

function handleRegister() {
    global $security, $db;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Validate input
    $email = $security->validateInput($input['email'] ?? '', 'email');
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    $firstName = $security->validateInput($input['first_name'] ?? '', 'text');
    $lastName = $security->validateInput($input['last_name'] ?? '', 'text');
    $phone = $security->validateInput($input['phone'] ?? '', 'phone');
    
    if (!$email) {
        throw new Exception('Invalid email address');
    }
    
    if (strlen($password) < 8) {
        throw new Exception('Password must be at least 8 characters long');
    }
    
    if ($password !== $confirmPassword) {
        throw new Exception('Passwords do not match');
    }
    
    if (!$firstName || !$lastName) {
        throw new Exception('First name and last name are required');
    }
    
    // Check if user already exists
    $existingUser = $db->fetch("SELECT id FROM users WHERE email = ?", [$email]);
    if ($existingUser) {
        throw new Exception('Email already registered');
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate verification token
    $verificationToken = bin2hex(random_bytes(32));
    
    // Insert user
    $userId = $db->insert('users', [
        'email' => $email,
        'password' => $hashedPassword,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'phone' => $phone,
        'role' => 'member',
        'status' => 'pending',
        'verification_token' => $verificationToken,
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    // Send verification email
    sendVerificationEmail($email, $verificationToken);
    
    $security->logSecurityEvent('USER_REGISTERED', [
        'user_id' => $userId,
        'email' => $email
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful. Please check your email for verification.',
        'data' => [
            'user_id' => $userId,
            'email' => $email
        ]
    ]);
}

function handleLogout() {
    global $security, $db;
    
    if (isset($_SESSION['user_id']) && isset($_SESSION['session_token'])) {
        // Remove session from database
        $db->delete('user_sessions', 'user_id = ? AND token = ?', [
            $_SESSION['user_id'],
            $_SESSION['session_token']
        ]);
        
        $security->logSecurityEvent('LOGOUT', [
            'user_id' => $_SESSION['user_id']
        ]);
    }
    
    // Destroy session
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

function handleVerify() {
    global $security, $db;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $security->validateInput($input['token'] ?? '', 'text');
    
    if (!$token) {
        throw new Exception('Invalid verification token');
    }
    
    // Find user with this token
    $user = $db->fetch(
        "SELECT id, email, status FROM users WHERE verification_token = ? AND status = 'pending'",
        [$token]
    );
    
    if (!$user) {
        throw new Exception('Invalid or expired verification token');
    }
    
    // Update user status
    $db->update('users', [
        'status' => 'active',
        'verified_at' => date('Y-m-d H:i:s'),
        'verification_token' => null
    ], 'id = ?', [$user['id']]);
    
    $security->logSecurityEvent('USER_VERIFIED', [
        'user_id' => $user['id'],
        'email' => $user['email']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Email verified successfully'
    ]);
}

function handleResetPassword() {
    global $security, $db;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $security->validateInput($input['email'] ?? '', 'email');
    
    if (!$email) {
        throw new Exception('Invalid email address');
    }
    
    // Check if user exists
    $user = $db->fetch("SELECT id, email FROM users WHERE email = ? AND status = 'active'", [$email]);
    if (!$user) {
        // Don't reveal if user exists
        echo json_encode([
            'success' => true,
            'message' => 'If the email exists, a reset link has been sent'
        ]);
        return;
    }
    
    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour
    
    // Store reset token
    $db->insert('password_resets', [
        'user_id' => $user['id'],
        'token' => $resetToken,
        'expires_at' => $expiresAt,
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    // Send reset email
    sendPasswordResetEmail($email, $resetToken);
    
    $security->logSecurityEvent('PASSWORD_RESET_REQUESTED', [
        'user_id' => $user['id'],
        'email' => $email
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'If the email exists, a reset link has been sent'
    ]);
}

function handleChangePassword() {
    global $security, $db;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    
    if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        throw new Exception('All password fields are required');
    }
    
    if ($newPassword !== $confirmPassword) {
        throw new Exception('New passwords do not match');
    }
    
    if (strlen($newPassword) < 8) {
        throw new Exception('New password must be at least 8 characters long');
    }
    
    // Get current user
    $user = $db->fetch(
        "SELECT id, password FROM users WHERE id = ?",
        [$_SESSION['user_id']]
    );
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        throw new Exception('Current password is incorrect');
    }
    
    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $db->update('users', [
        'password' => $hashedPassword,
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = ?', [$user['id']]);
    
    $security->logSecurityEvent('PASSWORD_CHANGED', [
        'user_id' => $user['id']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);
}

function handleGetProfile() {
    global $security, $db;
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $user = $db->fetch(
        "SELECT id, email, first_name, last_name, phone, role, status, created_at, last_login FROM users WHERE id = ?",
        [$_SESSION['user_id']]
    );
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Remove sensitive data
    unset($user['password']);
    
    echo json_encode([
        'success' => true,
        'data' => $user
    ]);
}

function handleUpdateProfile() {
    global $security, $db;
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate CSRF token
    if (!$security->validateCSRFToken($input['csrf_token'] ?? '')) {
        throw new Exception('Invalid CSRF token');
    }
    
    $firstName = $security->validateInput($input['first_name'] ?? '', 'text');
    $lastName = $security->validateInput($input['last_name'] ?? '', 'text');
    $phone = $security->validateInput($input['phone'] ?? '', 'phone');
    
    if (!$firstName || !$lastName) {
        throw new Exception('First name and last name are required');
    }
    
    // Update user profile
    $db->update('users', [
        'first_name' => $firstName,
        'last_name' => $lastName,
        'phone' => $phone,
        'updated_at' => date('Y-m-d H:i:s')
    ], 'id = ?', [$_SESSION['user_id']]);
    
    $security->logSecurityEvent('PROFILE_UPDATED', [
        'user_id' => $_SESSION['user_id']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully'
    ]);
}

function sendVerificationEmail($email, $token) {
    // Implementation for sending verification email
    // This would integrate with email service
    error_log("Verification email sent to: {$email} with token: {$token}");
}

function sendPasswordResetEmail($email, $token) {
    // Implementation for sending password reset email
    // This would integrate with email service
    error_log("Password reset email sent to: {$email} with token: {$token}");
}
?>
