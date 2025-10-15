aaaaa<?php
// backend/config/encryption.php
class AdvancedEncryption {
    private $encryption_key;
    private $algorithm = 'AES-256-GCM';
    
    public function __construct($key = null) {
        $this->encryption_key = $key ?: $_ENV['ENCRYPTION_KEY'] ?: 'default_key_change_this';
    }
    
    /**
     * Encrypt data with AES-256-GCM
     */
    public function encrypt($data) {
        $iv = random_bytes(12); // 96-bit IV for GCM
        $tag = '';
        
        $ciphertext = openssl_encrypt(
            $data,
            $this->algorithm,
            $this->encryption_key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        if ($ciphertext === false) {
            throw new Exception('Encryption failed');
        }
        
        return base64_encode($iv . $tag . $ciphertext);
    }
    
    /**
     * Decrypt data with AES-256-GCM
     */
    public function decrypt($encrypted_data) {
        $data = base64_decode($encrypted_data);
        
        if ($data === false) {
            throw new Exception('Invalid encrypted data');
        }
        
        $iv = substr($data, 0, 12);
        $tag = substr($data, 12, 16);
        $ciphertext = substr($data, 28);
        
        $plaintext = openssl_decrypt(
            $ciphertext,
            $this->algorithm,
            $this->encryption_key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        if ($plaintext === false) {
            throw new Exception('Decryption failed');
        }
        
        return $plaintext;
    }
    
    /**
     * Generate a secure random key
     */
    public static function generateKey() {
        return bin2hex(random_bytes(32)); // 256-bit key
    }
    
    /**
     * Hash data with PBKDF2
     */
    public function hash($data, $salt = null) {
        if ($salt === null) {
            $salt = random_bytes(16);
        }
        
        $hash = hash_pbkdf2('sha256', $data, $salt, 10000, 32, true);
        return base64_encode($salt . $hash);
    }
    
    /**
     * Verify hash
     */
    public function verifyHash($data, $hash) {
        $decoded = base64_decode($hash);
        $salt = substr($decoded, 0, 16);
        $stored_hash = substr($decoded, 16);
        
        $computed_hash = hash_pbkdf2('sha256', $data, $salt, 10000, 32, true);
        
        return hash_equals($stored_hash, $computed_hash);
    }
    
    /**
     * Encrypt file
     */
    public function encryptFile($file_path, $output_path = null) {
        if (!file_exists($file_path)) {
            throw new Exception('File not found');
        }
        
        $data = file_get_contents($file_path);
        $encrypted = $this->encrypt($data);
        
        if ($output_path === null) {
            $output_path = $file_path . '.enc';
        }
        
        file_put_contents($output_path, $encrypted);
        return $output_path;
    }
    
    /**
     * Decrypt file
     */
    public function decryptFile($encrypted_file_path, $output_path = null) {
        if (!file_exists($encrypted_file_path)) {
            throw new Exception('Encrypted file not found');
        }
        
        $encrypted_data = file_get_contents($encrypted_file_path);
        $decrypted = $this->decrypt($encrypted_data);
        
        if ($output_path === null) {
            $output_path = str_replace('.enc', '', $encrypted_file_path);
        }
        
        file_put_contents($output_path, $decrypted);
        return $output_path;
    }
    
    /**
     * Generate secure random string
     */
    public static function generateRandomString($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * Generate secure password
     */
    public static function generatePassword($length = 16) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        return $password;
    }
    
    /**
     * Encrypt sensitive data for database storage
     */
    public function encryptForDatabase($data) {
        return $this->encrypt(json_encode($data));
    }
    
    /**
     * Decrypt sensitive data from database
     */
    public function decryptFromDatabase($encrypted_data) {
        $decrypted = $this->decrypt($encrypted_data);
        return json_decode($decrypted, true);
    }
    
    /**
     * Create secure hash for passwords
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536, // 64 MB
            'time_cost' => 4,      // 4 iterations
            'threads' => 3         // 3 threads
        ]);
    }
    
    /**
     * Verify password hash
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Generate secure token
     */
    public function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    /**
     * Create HMAC signature
     */
    public function createSignature($data) {
        return hash_hmac('sha256', $data, $this->encryption_key);
    }
    
    /**
     * Verify HMAC signature
     */
    public function verifySignature($data, $signature) {
        $expected = $this->createSignature($data);
        return hash_equals($expected, $signature);
    }
    
    /**
     * Encrypt with additional authentication data
     */
    public function encryptWithAAD($data, $aad) {
        $iv = random_bytes(12);
        $tag = '';
        
        $ciphertext = openssl_encrypt(
            $data,
            $this->algorithm,
            $this->encryption_key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $aad
        );
        
        if ($ciphertext === false) {
            throw new Exception('Encryption with AAD failed');
        }
        
        return base64_encode($iv . $tag . $ciphertext);
    }
    
    /**
     * Decrypt with additional authentication data
     */
    public function decryptWithAAD($encrypted_data, $aad) {
        $data = base64_decode($encrypted_data);
        
        if ($data === false) {
            throw new Exception('Invalid encrypted data');
        }
        
        $iv = substr($data, 0, 12);
        $tag = substr($data, 12, 16);
        $ciphertext = substr($data, 28);
        
        $plaintext = openssl_decrypt(
            $ciphertext,
            $this->algorithm,
            $this->encryption_key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $aad
        );
        
        if ($plaintext === false) {
            throw new Exception('Decryption with AAD failed');
        }
        
        return $plaintext;
    }
}
?>




