#!/usr/bin/env python3
"""
KOPMA UNNES Database Migration Script
Migrates all crawled data (226 pages) to MongoDB
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from pymongo import MongoClient
from typing import Dict, List
import re

# Configuration
MONGO_URL = "mongodb://localhost:27017/"
DB_NAME = "kopma_unnes"
CRAWL_JSON_DIR = "/app/we/website/New folder/extracted_crawl_json/3a3927b2-1ed3-4bda-a25e-4c590f421bda"
CRAWL_MD_DIR = "/app/we/website/New folder/extracted_crawl_md/3a3927b2-1ed3-4bda-a25e-4c590f421bda"
IMAGES_DIR = "/app/we/website/New folder/sebagian_kecil_dari_kopmaukamunnes.com"

# Connect to MongoDB
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
pages_collection = db["pages"]
blog_posts_collection = db["blog_posts"]
members_collection = db["members"]
categories_collection = db["categories"]
tags_collection = db["tags"]

def clean_url(url: str) -> str:
    """Clean and normalize URLs"""
    url = url.replace('https://kopmaukmunnes.com', '')
    url = url.replace('http://kopmaukmunnes.com', '')
    if not url.startswith('/'):
        url = '/' + url
    if url.endswith('/') and len(url) > 1:
        url = url[:-1]
    return url

def extract_slug_from_filename(filename: str) -> str:
    """Extract slug from filename"""
    # Remove 'kopmaukmunnes.com_' prefix and '.json' suffix
    slug = filename.replace('kopmaukmunnes.com_', '').replace('.json', '').replace('.md', '')
    slug = slug.replace('_', '-')
    return slug

def determine_page_type(url: str, metadata: Dict) -> str:
    """Determine the type of page based on URL and content"""
    url_lower = url.lower()
    
    if url == '/' or url == '':
        return 'homepage'
    elif '/blog/' in url_lower or 'blog_' in url_lower:
        return 'blog_post'
    elif '/category/' in url_lower:
        return 'category'
    elif '/tag/' in url_lower:
        return 'tag'
    elif '/author/' in url_lower:
        return 'author'
    elif url_lower in ['/tentang-kami', '/profil', '/struktur-organisasi', '/kontak', 
                       '/keanggotaan', '/inventaris', '/usaha-kopma-unnes']:
        return 'main_page'
    else:
        return 'general_page'

def extract_images_from_markdown(markdown: str) -> List[str]:
    """Extract image URLs from markdown"""
    # Pattern: ![alt](url) or <img src="url">
    patterns = [
        r'!\[.*?\]\((.*?)\)',  # Markdown images
        r'src=["\']([^"\']*?)["\']',  # HTML img tags
    ]
    
    images = []
    for pattern in patterns:
        matches = re.findall(pattern, markdown)
        images.extend(matches)
    
    return list(set(images))  # Remove duplicates

def migrate_single_page(json_path: Path) -> Dict:
    """Migrate a single page from JSON to MongoDB"""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        metadata = data.get('metadata', {})
        markdown = data.get('markdown', '')
        
        # Extract info
        url = clean_url(metadata.get('sourceURL', ''))
        page_type = determine_page_type(url, metadata)
        slug = extract_slug_from_filename(json_path.name)
        
        # Extract images
        images = extract_images_from_markdown(markdown)
        
        # Create page document
        page_doc = {
            'slug': slug,
            'url': url,
            'type': page_type,
            'title': metadata.get('title', ''),
            'content': markdown,
            'images': images,
            'metadata': {
                'language': metadata.get('language', 'id'),
                'favicon': metadata.get('favicon', ''),
                'viewport': metadata.get('viewport', ''),
                'robots': metadata.get('robots', ''),
                'generator': metadata.get('generator', []),
            },
            'status': metadata.get('statusCode', 200),
            'crawled_at': metadata.get('cachedAt', datetime.utcnow().isoformat()),
            'migrated_at': datetime.utcnow().isoformat(),
            'source_file': json_path.name
        }
        
        return page_doc
        
    except Exception as e:
        print(f"Error migrating {json_path.name}: {e}")
        return None

def migrate_all_pages():
    """Migrate all crawled pages"""
    print(f"\n{'='*80}")
    print("STARTING DATABASE MIGRATION")
    print(f"{'='*80}\n")
    
    # Clear existing collections
    print("Clearing existing collections...")
    pages_collection.delete_many({})
    blog_posts_collection.delete_many({})
    categories_collection.delete_many({})
    tags_collection.delete_many({})
    
    # Get all JSON files
    json_dir = Path(CRAWL_JSON_DIR)
    json_files = list(json_dir.glob('*.json'))
    
    print(f"Found {len(json_files)} JSON files to migrate\n")
    
    # Statistics
    stats = {
        'total': len(json_files),
        'success': 0,
        'failed': 0,
        'homepage': 0,
        'blog_posts': 0,
        'main_pages': 0,
        'categories': 0,
        'tags': 0,
        'general': 0
    }
    
    # Migrate each file
    for idx, json_file in enumerate(json_files, 1):
        print(f"[{idx}/{stats['total']}] Processing: {json_file.name[:60]}...", end=' ')
        
        page_doc = migrate_single_page(json_file)
        
        if page_doc:
            # Insert into appropriate collection
            if page_doc['type'] == 'blog_post':
                blog_posts_collection.insert_one(page_doc)
                stats['blog_posts'] += 1
            elif page_doc['type'] == 'category':
                categories_collection.insert_one(page_doc)
                stats['categories'] += 1
            elif page_doc['type'] == 'tag':
                tags_collection.insert_one(page_doc)
                stats['tags'] += 1
            elif page_doc['type'] == 'homepage':
                pages_collection.insert_one(page_doc)
                stats['homepage'] += 1
            elif page_doc['type'] == 'main_page':
                pages_collection.insert_one(page_doc)
                stats['main_pages'] += 1
            else:
                pages_collection.insert_one(page_doc)
                stats['general'] += 1
            
            stats['success'] += 1
            print("✓")
        else:
            stats['failed'] += 1
            print("✗")
    
    # Print statistics
    print(f"\n{'='*80}")
    print("MIGRATION COMPLETE")
    print(f"{'='*80}\n")
    print(f"Total files:        {stats['total']}")
    print(f"Successfully migrated: {stats['success']} ✓")
    print(f"Failed:             {stats['failed']} ✗")
    print(f"\nBreakdown by type:")
    print(f"  - Homepage:       {stats['homepage']}")
    print(f"  - Blog Posts:     {stats['blog_posts']}")
    print(f"  - Main Pages:     {stats['main_pages']}")
    print(f"  - Categories:     {stats['categories']}")
    print(f"  - Tags:           {stats['tags']}")
    print(f"  - General:        {stats['general']}")
    print(f"\n{'='*80}\n")
    
    return stats

def create_indexes():
    """Create indexes for better query performance"""
    print("Creating indexes...")
    
    # Pages indexes
    pages_collection.create_index("slug")
    pages_collection.create_index("url")
    pages_collection.create_index("type")
    
    # Blog posts indexes
    blog_posts_collection.create_index("slug")
    blog_posts_collection.create_index("url")
    blog_posts_collection.create_index("crawled_at")
    
    # Categories indexes
    categories_collection.create_index("slug")
    
    # Tags indexes
    tags_collection.create_index("slug")
    
    print("Indexes created ✓\n")

def verify_migration():
    """Verify the migration"""
    print("Verifying migration...")
    
    pages_count = pages_collection.count_documents({})
    blog_count = blog_posts_collection.count_documents({})
    cat_count = categories_collection.count_documents({})
    tag_count = tags_collection.count_documents({})
    
    print(f"  - Pages collection:      {pages_count} documents")
    print(f"  - Blog posts collection: {blog_count} documents")
    print(f"  - Categories collection: {cat_count} documents")
    print(f"  - Tags collection:       {tag_count} documents")
    print(f"  - Total:                 {pages_count + blog_count + cat_count + tag_count} documents")
    print()

if __name__ == "__main__":
    try:
        # Run migration
        stats = migrate_all_pages()
        
        # Create indexes
        create_indexes()
        
        # Verify
        verify_migration()
        
        print("✅ Database migration completed successfully!")
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
