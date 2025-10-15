<?php
// backend/config/database.php
class DatabaseConfig {
    private static $instance = null;
    private $connection = null;
    
    // Database configuration
    private $config = [
        'host' => 'mysql',
        'port' => 3306,
        'database' => 'kopma_db',
        'username' => 'kopma_user',
        'password' => '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]
    ];
    
    private function __construct() {
        $this->loadEnvironmentVariables();
        $this->connect();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function loadEnvironmentVariables() {
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $_ENV[trim($key)] = trim($value);
                }
            }
        }
        
        // Override with environment variables
        $this->config['host'] = $_ENV['DB_HOST'] ?? $this->config['host'];
        $this->config['port'] = $_ENV['DB_PORT'] ?? $this->config['port'];
        $this->config['database'] = $_ENV['DB_NAME'] ?? $this->config['database'];
        $this->config['username'] = $_ENV['DB_USER'] ?? $this->config['username'];
        $this->config['password'] = $_ENV['DB_PASS'] ?? $this->config['password'];
    }
    
    private function connect() {
        try {
            $dsn = "mysql:host={$this->config['host']};port={$this->config['port']};dbname={$this->config['database']};charset={$this->config['charset']}";
            
            $this->connection = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $this->config['options']
            );
            
            // Set timezone
            $this->connection->exec("SET time_zone = '+07:00'");
            
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    public function getConnection() {
        if ($this->connection === null) {
            $this->connect();
        }
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query failed: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }
    
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    public function insert($table, $data) {
        $columns = implode(',', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        
        $stmt = $this->query($sql, $data);
        return $this->connection->lastInsertId();
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        $setClause = [];
        foreach (array_keys($data) as $key) {
            $setClause[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setClause);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        
        $params = array_merge($data, $whereParams);
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollback() {
        return $this->connection->rollback();
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
    
    public function rowCount() {
        return $this->connection->rowCount();
    }
    
    // Security methods
    public function sanitizeInput($input) {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    
    public function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    public function validatePhone($phone) {
        return preg_match('/^[0-9+\-\s()]+$/', $phone);
    }
    
    public function validateUrl($url) {
        return filter_var($url, FILTER_VALIDATE_URL);
    }
    
    public function validateInteger($value) {
        return filter_var($value, FILTER_VALIDATE_INT);
    }
    
    public function validateFloat($value) {
        return filter_var($value, FILTER_VALIDATE_FLOAT);
    }
    
    // Logging methods
    public function logQuery($sql, $params = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'sql' => $sql,
            'params' => $params,
            'user_id' => $_SESSION['user_id'] ?? null,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
        ];
        
        error_log("Database Query: " . json_encode($logData));
    }
    
    public function logError($message, $context = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => 'ERROR',
            'message' => $message,
            'context' => $context,
            'user_id' => $_SESSION['user_id'] ?? null,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
        ];
        
        error_log("Database Error: " . json_encode($logData));
    }
    
    // Health check
    public function healthCheck() {
        try {
            $result = $this->query("SELECT 1 as health_check");
            return $result->fetch()['health_check'] === 1;
        } catch (Exception $e) {
            return false;
        }
    }
    
    // Get database info
    public function getDatabaseInfo() {
        try {
            $version = $this->fetch("SELECT VERSION() as version");
            $status = $this->fetch("SHOW STATUS LIKE 'Uptime'");
            $variables = $this->fetch("SHOW VARIABLES LIKE 'max_connections'");
            
            return [
                'version' => $version['version'],
                'uptime' => $status['Value'] ?? 0,
                'max_connections' => $variables['Value'] ?? 0,
                'current_connections' => $this->fetch("SHOW STATUS LIKE 'Threads_connected'")['Value'] ?? 0
            ];
        } catch (Exception $e) {
            return null;
        }
    }
    
    // Close connection
    public function close() {
        $this->connection = null;
    }
    
    // Destructor
    public function __destruct() {
        $this->close();
    }
}

// Global database instance
function getDB() {
    return DatabaseConfig::getInstance();
}
?>
