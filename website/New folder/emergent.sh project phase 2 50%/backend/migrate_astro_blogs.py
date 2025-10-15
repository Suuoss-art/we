#!/usr/bin/env python3
"""
KOPMA UNNES - Astro Blog Pages Migration
Extracts content from pre-built Astro blog pages
"""

import os
import re
from pathlib import Path
from datetime import datetime
from pymongo import MongoClient
from typing import Dict, List

# Configuration
MONGO_URL = "mongodb://localhost:27017/"
DB_NAME = "kopma_unnes"
ASTRO_BLOG_DIR = "/app/we/website/New folder/website/src/pages/blog"

# Connect to MongoDB
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
blog_posts_collection = db["blog_posts"]

def extract_frontmatter(content: str) -> Dict:
    """Extract frontmatter from Astro file"""
    frontmatter_match = re.search(r'---\n(.*?)\n---', content, re.DOTALL)
    if frontmatter_match:
        fm = frontmatter_match.group(1)
        # Extract title
        title_match = re.search(r'const pageTitle = "(.+?)";', fm)
        slug_match = re.search(r'const pageSlug = "(.+?)";', fm)
        
        return {
            'title': title_match.group(1) if title_match else '',
            'slug': slug_match.group(1) if slug_match else ''
        }
    return {'title': '', 'slug': ''}

def extract_article_content(content: str) -> str:
    """Extract article content from Astro file"""
    # Find content between <div class="article-content"> and </div>
    content_match = re.search(r'<div class="article-content.*?>(.*?)</div>', content, re.DOTALL)
    if content_match:
        return content_match.group(1).strip()
    return ''

def extract_images(content: str) -> List[str]:
    """Extract image URLs from content"""
    images = []
    # Find all img src
    img_matches = re.findall(r'<img\s+src="([^"]+)"', content)
    images.extend(img_matches)
    return list(set(images))

def extract_year(content: str) -> str:
    """Extract year from content"""
    year_match = re.search(r'<time>(\d{4})</time>', content)
    if year_match:
        return year_match.group(1)
    return '2024'

def migrate_astro_blog(file_path: Path) -> Dict:
    """Migrate a single Astro blog file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract data
        frontmatter = extract_frontmatter(content)
        article_content = extract_article_content(content)
        images = extract_images(article_content)
        year = extract_year(content)
        
        # Clean filename for slug if not in frontmatter
        if not frontmatter['slug']:
            frontmatter['slug'] = file_path.stem
        
        # Create blog document
        blog_doc = {
            'slug': frontmatter['slug'],
            'url': f"/blog/{frontmatter['slug']}",
            'type': 'blog_post',
            'title': frontmatter['title'],
            'content': article_content,
            'year': year,
            'images': images,
            'source': 'astro_blog',
            'migrated_at': datetime.utcnow().isoformat(),
            'source_file': file_path.name
        }
        
        return blog_doc
        
    except Exception as e:
        print(f"Error migrating {file_path.name}: {e}")
        return None

def migrate_all_astro_blogs():
    """Migrate all Astro blog pages"""
    print(f"\n{'='*80}")
    print("MIGRATING ASTRO BLOG PAGES")
    print(f"{'='*80}\n")
    
    # Get all Astro blog files
    blog_dir = Path(ASTRO_BLOG_DIR)
    astro_files = list(blog_dir.glob('*.astro'))
    # Filter out backup files
    astro_files = [f for f in astro_files if not f.name.endswith('.bak')]
    
    print(f"Found {len(astro_files)} Astro blog files to migrate\n")
    
    # Statistics
    stats = {
        'total': len(astro_files),
        'success': 0,
        'failed': 0,
        'duplicates': 0,
        'new': 0
    }
    
    # Migrate each file
    for idx, astro_file in enumerate(astro_files, 1):
        print(f"[{idx}/{stats['total']}] Processing: {astro_file.name[:60]}...", end=' ')
        
        blog_doc = migrate_astro_blog(astro_file)
        
        if blog_doc:
            # Check if already exists
            existing = blog_posts_collection.find_one({"slug": blog_doc['slug']})
            
            if existing:
                # Update if Astro version has more content
                if len(blog_doc['content']) > len(existing.get('content', '')):
                    blog_posts_collection.update_one(
                        {"slug": blog_doc['slug']},
                        {"$set": blog_doc}
                    )
                    print("✓ (updated)")
                else:
                    print("→ (duplicate)")
                stats['duplicates'] += 1
            else:
                blog_posts_collection.insert_one(blog_doc)
                stats['new'] += 1
                print("✓ (new)")
            
            stats['success'] += 1
        else:
            stats['failed'] += 1
            print("✗")
    
    # Print statistics
    print(f"\n{'='*80}")
    print("ASTRO BLOG MIGRATION COMPLETE")
    print(f"{'='*80}\n")
    print(f"Total files:        {stats['total']}")
    print(f"Successfully migrated: {stats['success']} ✓")
    print(f"  - New posts:      {stats['new']}")
    print(f"  - Duplicates:     {stats['duplicates']}")
    print(f"Failed:             {stats['failed']} ✗")
    print(f"\n{'='*80}\n")
    
    return stats

def verify_migration():
    """Verify the migration"""
    print("Verifying migration...")
    
    total_blogs = blog_posts_collection.count_documents({})
    crawled_blogs = blog_posts_collection.count_documents({"source": {"$ne": "astro_blog"}})
    astro_blogs = blog_posts_collection.count_documents({"source": "astro_blog"})
    
    print(f"  - Total blog posts:   {total_blogs} documents")
    print(f"  - From crawl data:    {crawled_blogs} documents")
    print(f"  - From Astro files:   {astro_blogs} documents")
    print()

if __name__ == "__main__":
    try:
        # Run migration
        stats = migrate_all_astro_blogs()
        
        # Verify
        verify_migration()
        
        print("✅ Astro blog migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
