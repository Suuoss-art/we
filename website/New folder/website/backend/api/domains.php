<?php
/**
 * Domain Management API
 * Handles domain configuration and SSL certificates
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

// Domain configuration file
$domains_file = __DIR__ . '/../../config/domains.json';

// Load domains configuration
function load_domains() {
    global $domains_file;
    if (file_exists($domains_file)) {
        return json_decode(file_get_contents($domains_file), true) ?: ['domains' => []];
    }
    return ['domains' => []];
}

// Save domains configuration
function save_domains($config) {
    global $domains_file;
    file_put_contents($domains_file, json_encode($config, JSON_PRETTY_PRINT));
}

switch ($method) {
    case 'GET':
        // List all domains
        $config = load_domains();
        echo json_encode($config);
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['action'] ?? 'add';
        
        if ($action === 'add') {
            // Add new domain
            $domain = $input['domain'] ?? '';
            
            if (empty($domain)) {
                http_response_code(400);
                echo json_encode(['error' => 'Domain name required']);
                exit;
            }
            
            // Validate domain format
            if (!preg_match('/^[a-z0-9\-\.]+$/i', $domain)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid domain format']);
                exit;
            }
            
            $config = load_domains();
            
            // Check if domain already exists
            foreach ($config['domains'] as $existing) {
                if ($existing['name'] === $domain) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Domain already exists']);
                    exit;
                }
            }
            
            // Add new domain
            $config['domains'][] = [
                'id' => uniqid('dom_'),
                'name' => $domain,
                'status' => 'pending',
                'sslEnabled' => false,
                'createdAt' => date('Y-m-d H:i:s')
            ];
            
            save_domains($config);
            
            echo json_encode([
                'success' => true,
                'message' => 'Domain added successfully'
            ]);
            
        } elseif ($action === 'enable-ssl') {
            // Enable SSL for domain
            $domain_id = $_GET['domain_id'] ?? $input['domain_id'] ?? '';
            
            if (empty($domain_id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Domain ID required']);
                exit;
            }
            
            $config = load_domains();
            $domain_found = false;
            
            foreach ($config['domains'] as &$domain) {
                if ($domain['id'] === $domain_id) {
                    $domain_found = true;
                    
                    // Request SSL certificate using Let's Encrypt
                    $domain_name = $domain['name'];
                    
                    // Execute certbot command
                    $command = "certbot certonly --webroot -w /var/www/html -d $domain_name --non-interactive --agree-tos --email admin@$domain_name 2>&1";
                    exec($command, $output, $return_code);
                    
                    if ($return_code === 0) {
                        $domain['sslEnabled'] = true;
                        $domain['sslExpiry'] = date('Y-m-d H:i:s', strtotime('+90 days'));
                        $domain['status'] = 'active';
                        
                        save_domains($config);
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'SSL enabled successfully'
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode([
                            'error' => 'Failed to enable SSL',
                            'details' => implode("\n", $output)
                        ]);
                    }
                    break;
                }
            }
            
            if (!$domain_found) {
                http_response_code(404);
                echo json_encode(['error' => 'Domain not found']);
            }
        }
        break;
        
    case 'DELETE':
        // Remove domain
        $domain_id = $_GET['domain_id'] ?? '';
        
        if (empty($domain_id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Domain ID required']);
            exit;
        }
        
        $config = load_domains();
        $new_domains = [];
        
        foreach ($config['domains'] as $domain) {
            if ($domain['id'] !== $domain_id) {
                $new_domains[] = $domain;
            }
        }
        
        $config['domains'] = $new_domains;
        save_domains($config);
        
        echo json_encode([
            'success' => true,
            'message' => 'Domain removed successfully'
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
