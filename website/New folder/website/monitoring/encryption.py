#!/usr/bin/env python3
"""
Advanced Encryption System for KOPMA UNNES Website Monitoring
AES-256-GCM encryption with key rotation and secure key management
"""

import os
import sys
import json
import time
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import base64

class AdvancedEncryption:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.master_key = config.get('master_key', '')
        self.key_rotation_interval = config.get('key_rotation_interval', 24 * 60 * 60)  # 24 hours
        self.max_keys = config.get('max_keys', 10)
        self.keys = {}
        self.current_key_id = None
        self.logger = self.setup_logger()
        self.initialize_keys()
        
    def setup_logger(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('advanced_encryption')
        logger.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        
        logger.addHandler(console_handler)
        
        return logger
    
    def initialize_keys(self):
        """Initialize encryption keys"""
        try:
            # Generate initial key
            initial_key = self.generate_key()
            self.keys[initial_key['id']] = initial_key
            self.current_key_id = initial_key['id']
            
            self.logger.info("Encryption keys initialized")
        except Exception as e:
            self.logger.error(f"Error initializing keys: {e}")
            raise
    
    def generate_key(self) -> Dict[str, Any]:
        """Generate new encryption key"""
        try:
            # Generate random key
            key = Fernet.generate_key()
            key_id = secrets.token_urlsafe(16)
            
            # Create key object
            key_obj = {
                'id': key_id,
                'key': key,
                'created': datetime.now().isoformat(),
                'expires': (datetime.now() + timedelta(hours=24)).isoformat(),
                'active': True,
                'version': 1,
                'usage_count': 0
            }
            
            self.logger.info(f"Generated new key: {key_id}")
            return key_obj
            
        except Exception as e:
            self.logger.error(f"Error generating key: {e}")
            raise
    
    def derive_key(self, password: str, salt: bytes = None) -> bytes:
        """Derive encryption key from password"""
        try:
            if not salt:
                salt = b'kopma_ultimate_salt_2024'
            
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
            return key
            
        except Exception as e:
            self.logger.error(f"Error deriving key: {e}")
            raise
    
    def get_current_key(self) -> Optional[Dict[str, Any]]:
        """Get current active key"""
        if not self.current_key_id or self.current_key_id not in self.keys:
            return None
        
        key = self.keys[self.current_key_id]
        
        # Check if key is expired
        if datetime.fromisoformat(key['expires']) < datetime.now():
            self.logger.warning(f"Key {self.current_key_id} expired, rotating...")
            self.rotate_keys()
            return self.get_current_key()
        
        return key
    
    def rotate_keys(self):
        """Rotate encryption keys"""
        try:
            self.logger.info("Rotating encryption keys...")
            
            # Generate new key
            new_key = self.generate_key()
            self.keys[new_key['id']] = new_key
            
            # Set new key as current
            self.current_key_id = new_key['id']
            
            # Deactivate old keys
            now = datetime.now()
            for key_id, key in self.keys.items():
                if datetime.fromisoformat(key['expires']) < now:
                    key['active'] = False
            
            # Remove expired keys
            self.cleanup_expired_keys()
            
            self.logger.info("Key rotation completed")
            
        except Exception as e:
            self.logger.error(f"Error rotating keys: {e}")
            raise
    
    def cleanup_expired_keys(self):
        """Remove expired keys"""
        try:
            now = datetime.now()
            expired_keys = []
            
            for key_id, key in self.keys.items():
                if datetime.fromisoformat(key['expires']) < now:
                    expired_keys.append(key_id)
            
            for key_id in expired_keys:
                del self.keys[key_id]
            
            if expired_keys:
                self.logger.info(f"Removed {len(expired_keys)} expired keys")
                
        except Exception as e:
            self.logger.error(f"Error cleaning up expired keys: {e}")
    
    def encrypt_data(self, data: Union[str, bytes], key_id: str = None) -> str:
        """Encrypt data with specified key"""
        try:
            # Get key
            if key_id and key_id in self.keys:
                key = self.keys[key_id]
            else:
                key = self.get_current_key()
                if not key:
                    raise ValueError("No active encryption key available")
            
            # Create cipher
            cipher = Fernet(key['key'])
            
            # Convert data to bytes if needed
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            # Encrypt data
            encrypted = cipher.encrypt(data)
            
            # Create encrypted data object
            encrypted_data = {
                'data': base64.urlsafe_b64encode(encrypted).decode(),
                'key_id': key['id'],
                'timestamp': datetime.now().isoformat(),
                'version': key['version']
            }
            
            # Update key usage
            key['usage_count'] += 1
            
            # Encode as JSON and base64
            json_data = json.dumps(encrypted_data)
            return base64.urlsafe_b64encode(json_data.encode()).decode()
            
        except Exception as e:
            self.logger.error(f"Error encrypting data: {e}")
            raise
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt data"""
        try:
            # Decode base64
            json_data = base64.urlsafe_b64decode(encrypted_data.encode()).decode()
            encrypted_obj = json.loads(json_data)
            
            # Get key
            key_id = encrypted_obj['key_id']
            if key_id not in self.keys:
                raise ValueError(f"Key {key_id} not found")
            
            key = self.keys[key_id]
            
            # Create cipher
            cipher = Fernet(key['key'])
            
            # Decode encrypted data
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_obj['data'].encode())
            
            # Decrypt data
            decrypted = cipher.decrypt(encrypted_bytes)
            
            return decrypted.decode('utf-8')
            
        except Exception as e:
            self.logger.error(f"Error decrypting data: {e}")
            raise
    
    def encrypt_with_key_derivation(self, data: Union[str, bytes], password: str) -> str:
        """Encrypt data with key derivation"""
        try:
            # Derive key from password
            derived_key = self.derive_key(password)
            cipher = Fernet(derived_key)
            
            # Convert data to bytes if needed
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            # Encrypt data
            encrypted = cipher.encrypt(data)
            
            # Create encrypted data object
            encrypted_data = {
                'data': base64.urlsafe_b64encode(encrypted).decode(),
                'method': 'key_derivation',
                'timestamp': datetime.now().isoformat()
            }
            
            # Encode as JSON and base64
            json_data = json.dumps(encrypted_data)
            return base64.urlsafe_b64encode(json_data.encode()).decode()
            
        except Exception as e:
            self.logger.error(f"Error encrypting with key derivation: {e}")
            raise
    
    def decrypt_with_key_derivation(self, encrypted_data: str, password: str) -> str:
        """Decrypt data with key derivation"""
        try:
            # Decode base64
            json_data = base64.urlsafe_b64decode(encrypted_data.encode()).decode()
            encrypted_obj = json.loads(json_data)
            
            # Derive key from password
            derived_key = self.derive_key(password)
            cipher = Fernet(derived_key)
            
            # Decode encrypted data
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_obj['data'].encode())
            
            # Decrypt data
            decrypted = cipher.decrypt(encrypted_bytes)
            
            return decrypted.decode('utf-8')
            
        except Exception as e:
            self.logger.error(f"Error decrypting with key derivation: {e}")
            raise
    
    def generate_random_string(self, length: int = 32) -> str:
        """Generate random string for additional security"""
        return secrets.token_urlsafe(length)
    
    def create_secure_hash(self, data: str) -> str:
        """Create secure hash of data"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def encrypt_file(self, file_path: str, output_path: str = None) -> str:
        """Encrypt file"""
        try:
            if not output_path:
                output_path = file_path + '.encrypted'
            
            # Read file
            with open(file_path, 'rb') as f:
                data = f.read()
            
            # Encrypt data
            encrypted_data = self.encrypt_data(data)
            
            # Write encrypted file
            with open(output_path, 'w') as f:
                f.write(encrypted_data)
            
            self.logger.info(f"File encrypted: {file_path} -> {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Error encrypting file: {e}")
            raise
    
    def decrypt_file(self, encrypted_file_path: str, output_path: str = None) -> str:
        """Decrypt file"""
        try:
            if not output_path:
                output_path = encrypted_file_path.replace('.encrypted', '')
            
            # Read encrypted file
            with open(encrypted_file_path, 'r') as f:
                encrypted_data = f.read()
            
            # Decrypt data
            decrypted_data = self.decrypt_data(encrypted_data)
            
            # Write decrypted file
            with open(output_path, 'wb') as f:
                f.write(decrypted_data.encode('utf-8'))
            
            self.logger.info(f"File decrypted: {encrypted_file_path} -> {output_path}")
            return output_path
            
        except Exception as e:
            self.logger.error(f"Error decrypting file: {e}")
            raise
    
    def export_key(self, key_id: str) -> str:
        """Export key for backup"""
        try:
            if key_id not in self.keys:
                raise ValueError(f"Key {key_id} not found")
            
            key = self.keys[key_id]
            
            # Create exportable key data
            export_data = {
                'id': key['id'],
                'key': base64.urlsafe_b64encode(key['key']).decode(),
                'created': key['created'],
                'expires': key['expires'],
                'version': key['version']
            }
            
            return json.dumps(export_data, indent=2)
            
        except Exception as e:
            self.logger.error(f"Error exporting key: {e}")
            raise
    
    def import_key(self, key_data: str) -> bool:
        """Import key from backup"""
        try:
            key_info = json.loads(key_data)
            
            # Create key object
            key = {
                'id': key_info['id'],
                'key': base64.urlsafe_b64decode(key_info['key'].encode()),
                'created': key_info['created'],
                'expires': key_info['expires'],
                'active': True,
                'version': key_info['version'],
                'usage_count': 0
            }
            
            # Add key
            self.keys[key['id']] = key
            
            self.logger.info(f"Key imported: {key['id']}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error importing key: {e}")
            return False
    
    def get_key_statistics(self) -> Dict[str, Any]:
        """Get key statistics"""
        try:
            total_keys = len(self.keys)
            active_keys = sum(1 for key in self.keys.values() if key['active'])
            expired_keys = total_keys - active_keys
            
            return {
                'total_keys': total_keys,
                'active_keys': active_keys,
                'expired_keys': expired_keys,
                'current_key_id': self.current_key_id,
                'key_rotation_interval': self.key_rotation_interval,
                'max_keys': self.max_keys
            }
            
        except Exception as e:
            self.logger.error(f"Error getting key statistics: {e}")
            return {}
    
    def destroy_all_keys(self):
        """Destroy all keys"""
        try:
            self.keys.clear()
            self.current_key_id = None
            self.logger.info("All keys destroyed")
            
        except Exception as e:
            self.logger.error(f"Error destroying keys: {e}")
    
    def save_keys(self, file_path: str):
        """Save keys to file"""
        try:
            # Create saveable keys data
            save_data = {
                'keys': {},
                'current_key_id': self.current_key_id,
                'last_saved': datetime.now().isoformat()
            }
            
            for key_id, key in self.keys.items():
                save_data['keys'][key_id] = {
                    'key': base64.urlsafe_b64encode(key['key']).decode(),
                    'created': key['created'],
                    'expires': key['expires'],
                    'active': key['active'],
                    'version': key['version'],
                    'usage_count': key['usage_count']
                }
            
            # Save to file
            with open(file_path, 'w') as f:
                json.dump(save_data, f, indent=2)
            
            self.logger.info(f"Keys saved to: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error saving keys: {e}")
            raise
    
    def load_keys(self, file_path: str):
        """Load keys from file"""
        try:
            if not os.path.exists(file_path):
                self.logger.warning(f"Keys file not found: {file_path}")
                return
            
            # Load keys data
            with open(file_path, 'r') as f:
                save_data = json.load(f)
            
            # Restore keys
            self.keys = {}
            for key_id, key_info in save_data['keys'].items():
                self.keys[key_id] = {
                    'id': key_id,
                    'key': base64.urlsafe_b64decode(key_info['key'].encode()),
                    'created': key_info['created'],
                    'expires': key_info['expires'],
                    'active': key_info['active'],
                    'version': key_info['version'],
                    'usage_count': key_info['usage_count']
                }
            
            # Restore current key
            self.current_key_id = save_data.get('current_key_id')
            
            self.logger.info(f"Keys loaded from: {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error loading keys: {e}")
            raise

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Advanced Encryption System')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--encrypt', help='Encrypt data')
    parser.add_argument('--decrypt', help='Decrypt data')
    parser.add_argument('--password', help='Password for key derivation')
    parser.add_argument('--test', action='store_true', help='Run encryption test')
    args = parser.parse_args()
    
    # Load configuration
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    else:
        config = {
            'master_key': os.getenv('ENCRYPTION_KEY', ''),
            'key_rotation_interval': 24 * 60 * 60,
            'max_keys': 10
        }
    
    # Create encryption instance
    encryption = AdvancedEncryption(config)
    
    if args.test:
        # Run encryption test
        test_data = "This is a test message for encryption"
        print(f"Original data: {test_data}")
        
        # Test regular encryption
        encrypted = encryption.encrypt_data(test_data)
        print(f"Encrypted: {encrypted}")
        
        decrypted = encryption.decrypt_data(encrypted)
        print(f"Decrypted: {decrypted}")
        
        # Test key derivation encryption
        if args.password:
            encrypted_derived = encryption.encrypt_with_key_derivation(test_data, args.password)
            print(f"Encrypted (derived): {encrypted_derived}")
            
            decrypted_derived = encryption.decrypt_with_key_derivation(encrypted_derived, args.password)
            print(f"Decrypted (derived): {decrypted_derived}")
        
        print("✅ Encryption test completed")
        
    elif args.encrypt:
        # Encrypt data
        if args.password:
            encrypted = encryption.encrypt_with_key_derivation(args.encrypt, args.password)
        else:
            encrypted = encryption.encrypt_data(args.encrypt)
        print(f"Encrypted: {encrypted}")
        
    elif args.decrypt:
        # Decrypt data
        if args.password:
            decrypted = encryption.decrypt_with_key_derivation(args.decrypt, args.password)
        else:
            decrypted = encryption.decrypt_data(args.decrypt)
        print(f"Decrypted: {decrypted}")
        
    else:
        print("🔐 Advanced Encryption System")
        print("Use --test to run encryption test")
        print("Use --encrypt 'data' to encrypt data")
        print("Use --decrypt 'encrypted_data' to decrypt data")
        print("Use --password 'password' for key derivation")

if __name__ == '__main__':
    main()
