<?php
/**
 * Database Management API
 * Handles database operations: list, query, export, import
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

// Get database connection
function get_db_connection() {
    $host = getenv('DB_HOST') ?: 'mysql';
    $port = getenv('DB_PORT') ?: '3306';
    $dbname = getenv('DB_NAME') ?: 'kopma_db';
    $user = getenv('DB_USER') ?: 'kopma_user';
    $pass = getenv('DB_PASSWORD') ?: '';
    
    try {
        $pdo = new PDO(
            "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
            $user,
            $pass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        
        try {
            $pdo = get_db_connection();
            
            if ($action === 'list') {
                // List all databases
                $stmt = $pdo->query('SHOW DATABASES');
                $databases = [];
                
                while ($row = $stmt->fetch()) {
                    $dbname = $row['Database'];
                    
                    // Skip system databases
                    if (in_array($dbname, ['information_schema', 'mysql', 'performance_schema', 'sys'])) {
                        continue;
                    }
                    
                    // Get database size
                    $size_query = "SELECT 
                        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb 
                        FROM information_schema.TABLES 
                        WHERE table_schema = :dbname";
                    $size_stmt = $pdo->prepare($size_query);
                    $size_stmt->execute(['dbname' => $dbname]);
                    $size_row = $size_stmt->fetch();
                    
                    // Get tables in database
                    $pdo->query("USE `$dbname`");
                    $tables_stmt = $pdo->query('SHOW TABLES');
                    $tables = [];
                    
                    while ($table_row = $tables_stmt->fetch()) {
                        $table_name = array_values($table_row)[0];
                        
                        // Get table info
                        $table_info = $pdo->query("SHOW TABLE STATUS LIKE '$table_name'")->fetch();
                        
                        $tables[] = [
                            'name' => $table_name,
                            'rows' => $table_info['Rows'] ?? 0,
                            'size' => round(($table_info['Data_length'] + $table_info['Index_length']) / 1024, 2) . ' KB',
                            'engine' => $table_info['Engine'] ?? 'Unknown'
                        ];
                    }
                    
                    $databases[] = [
                        'name' => $dbname,
                        'size' => ($size_row['size_mb'] ?? 0) . ' MB',
                        'tables' => $tables
                    ];
                }
                
                echo json_encode(['databases' => $databases]);
                
            } elseif ($action === 'export') {
                // Export database
                $database = $_GET['database'] ?? '';
                
                if (empty($database)) {
                    throw new Exception('Database name required');
                }
                
                // Generate SQL dump
                $pdo->query("USE `$database`");
                $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
                
                $dump = "-- Database: $database\n";
                $dump .= "-- Export Date: " . date('Y-m-d H:i:s') . "\n\n";
                $dump .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
                
                foreach ($tables as $table) {
                    // Get CREATE TABLE statement
                    $create = $pdo->query("SHOW CREATE TABLE `$table`")->fetch();
                    $dump .= $create['Create Table'] . ";\n\n";
                    
                    // Get table data
                    $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll();
                    
                    if (!empty($rows)) {
                        $dump .= "INSERT INTO `$table` VALUES\n";
                        $values = [];
                        
                        foreach ($rows as $row) {
                            $escaped = array_map(function($val) use ($pdo) {
                                return $val === null ? 'NULL' : $pdo->quote($val);
                            }, array_values($row));
                            $values[] = '(' . implode(', ', $escaped) . ')';
                        }
                        
                        $dump .= implode(",\n", $values) . ";\n\n";
                    }
                }
                
                $dump .= "SET FOREIGN_KEY_CHECKS=1;\n";
                
                // Return as downloadable file
                header('Content-Type: application/sql');
                header('Content-Disposition: attachment; filename="' . $database . '_' . date('Ymd_His') . '.sql"');
                echo $dump;
                exit;
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['action'] ?? $input['action'] ?? 'execute';
        
        try {
            $pdo = get_db_connection();
            
            if ($action === 'execute') {
                // Execute SQL query
                $database = $input['database'] ?? '';
                $query = $input['query'] ?? '';
                
                if (empty($query)) {
                    throw new Exception('Query required');
                }
                
                // Security: Prevent dangerous operations
                $dangerous = ['DROP DATABASE', 'GRANT', 'REVOKE', 'CREATE USER', 'ALTER USER'];
                $query_upper = strtoupper($query);
                foreach ($dangerous as $cmd) {
                    if (strpos($query_upper, $cmd) !== false) {
                        throw new Exception("Dangerous operation not allowed: $cmd");
                    }
                }
                
                if (!empty($database)) {
                    $pdo->query("USE `$database`");
                }
                
                $stmt = $pdo->query($query);
                
                // Check if it's a SELECT query
                if (stripos(trim($query), 'SELECT') === 0) {
                    $rows = $stmt->fetchAll();
                    echo json_encode([
                        'success' => true,
                        'rows' => $rows,
                        'count' => count($rows)
                    ]);
                } else {
                    $affected = $stmt->rowCount();
                    echo json_encode([
                        'success' => true,
                        'affectedRows' => $affected
                    ]);
                }
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
