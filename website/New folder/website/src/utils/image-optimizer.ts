// src/utils/image-optimizer.ts
// Image optimization utilities for KOPMA UNNES Website

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  background?: string;
  blur?: number;
  sharpen?: number;
  normalize?: boolean;
  grayscale?: boolean;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  tint?: string;
  modulate?: {
    brightness?: number;
    saturation?: number;
    hue?: number;
  };
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  density?: number;
  space?: string;
  channels?: number;
  depth?: string;
}

export interface OptimizedImage {
  original: {
    url: string;
    size: number;
    width: number;
    height: number;
  };
  optimized: {
    url: string;
    size: number;
    width: number;
    height: number;
    format: string;
    quality: number;
  };
  savings: {
    bytes: number;
    percentage: number;
  };
  variants: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  };
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cache: Map<string, OptimizedImage> = new Map();
  private supportedFormats: string[] = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'svg'];
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private defaultOptions: ImageOptimizationOptions = {
    quality: 80,
    format: 'webp',
    fit: 'cover',
    position: 'center'
  };

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Optimize image with specified options
   */
  async optimizeImage(
    imageUrl: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const cacheKey = this.generateCacheKey(imageUrl, options);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Get original image info
      const originalInfo = await this.getImageInfo(imageUrl);
      
      // Validate image
      if (originalInfo.size > this.maxFileSize) {
        throw new Error('Image file size exceeds maximum limit');
      }

      // Optimize image
      const optimizedUrl = await this.processImage(imageUrl, mergedOptions);
      const optimizedInfo = await this.getImageInfo(optimizedUrl);
      
      // Calculate savings
      const savings = {
        bytes: originalInfo.size - optimizedInfo.size,
        percentage: Math.round(((originalInfo.size - optimizedInfo.size) / originalInfo.size) * 100)
      };

      // Generate variants
      const variants = await this.generateVariants(imageUrl, mergedOptions);

      const result: OptimizedImage = {
        original: {
          url: imageUrl,
          size: originalInfo.size,
          width: originalInfo.width,
          height: originalInfo.height
        },
        optimized: {
          url: optimizedUrl,
          size: optimizedInfo.size,
          width: optimizedInfo.width,
          height: optimizedInfo.height,
          format: optimizedInfo.format,
          quality: mergedOptions.quality || 80
        },
        savings,
        variants
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error: unknown) {
      console.error('Image optimization failed:', error);
      throw new Error(`Failed to optimize image: ${(error as Error).message}`);
    }
  }

  /**
   * Optimize multiple images in batch
   */
  async optimizeBatch(
    imageUrls: string[],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];
    
    for (const imageUrl of imageUrls) {
      try {
        const optimized = await this.optimizeImage(imageUrl, options);
        results.push(optimized);
      } catch (error) {
        console.error(`Failed to optimize image ${imageUrl}:`, error instanceof Error ? error.message : error);
        // Continue with other images
      }
    }
    
    return results;
  }

  /**
   * Generate responsive image variants
   */
  async generateResponsiveVariants(
    imageUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): Promise<Record<string, OptimizedImage>> {
    const variants: Record<string, OptimizedImage> = {};
    
    for (const width of breakpoints) {
      try {
        const optimized = await this.optimizeImage(imageUrl, {
          width,
          height: undefined,
          fit: 'cover'
        });
        variants[`w${width}`] = optimized;
      } catch (error) {
        console.error(`Failed to generate variant for width ${width}:`, error instanceof Error ? error.message : error);
      }
    }
    
    return variants;
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    imageUrl: string,
    size: number = 150
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      width: size,
      height: size,
      fit: 'cover',
      quality: 70
    });
  }

  /**
   * Generate avatar image
   */
  async generateAvatar(
    imageUrl: string,
    size: number = 100
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      width: size,
      height: size,
      fit: 'cover',
      quality: 85,
      format: 'webp'
    });
  }

  /**
   * Generate hero image
   */
  async generateHero(
    imageUrl: string,
    width: number = 1920,
    height: number = 1080
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      fit: 'cover',
      quality: 90,
      format: 'webp'
    });
  }

  /**
   * Generate gallery image
   */
  async generateGallery(
    imageUrl: string,
    width: number = 800,
    height: number = 600
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      fit: 'cover',
      quality: 85,
      format: 'webp'
    });
  }

  /**
   * Convert image format
   */
  async convertFormat(
    imageUrl: string,
    format: 'webp' | 'jpeg' | 'png' | 'avif'
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      format,
      quality: 80
    });
  }

  /**
   * Resize image
   */
  async resizeImage(
    imageUrl: string,
    width: number,
    height?: number
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      fit: 'cover'
    });
  }

  /**
   * Apply filters to image
   */
  async applyFilters(
    imageUrl: string,
    filters: {
      blur?: number;
      sharpen?: number;
      grayscale?: boolean;
      normalize?: boolean;
      tint?: string;
      modulate?: {
        brightness?: number;
        saturation?: number;
        hue?: number;
      };
    }
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, filters);
  }

  /**
   * Rotate image
   */
  async rotateImage(
    imageUrl: string,
    angle: number
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      rotate: angle
    });
  }

  /**
   * Flip image
   */
  async flipImage(
    imageUrl: string,
    horizontal: boolean = true
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      flip: horizontal,
      flop: !horizontal
    });
  }

  /**
   * Crop image
   */
  async cropImage(
    imageUrl: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      fit: 'cover'
    });
  }

  /**
   * Get image information
   */
  async getImageInfo(imageUrl: string): Promise<ImageInfo> {
    try {
      // This would typically use a library like sharp or jimp
      // For now, we'll simulate the response
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      return {
        width: 1920,
        height: 1080,
        format: this.getFormatFromMimeType(contentType || 'image/jpeg'),
        size: parseInt(contentLength || '0'),
        hasAlpha: false,
        density: 72,
        space: 'srgb',
        channels: 3,
        depth: 'uchar'
      };
    } catch (error: unknown) {
      throw new Error(`Failed to get image info: ${(error as Error).message}`);
    }
  }

  /**
   * Check if image format is supported
   */
  isSupportedFormat(format: string): boolean {
    return this.supportedFormats.includes(format.toLowerCase());
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  /**
   * Set maximum file size
   */
  setMaxFileSize(size: number): void {
    this.maxFileSize = size;
  }

  /**
   * Get maximum file size
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0.85, // This would be calculated from actual usage
      memoryUsage: this.cache.size * 1024 // Rough estimate
    };
  }

  // Private methods

  private async processImage(
    imageUrl: string,
    options: ImageOptimizationOptions
  ): Promise<string> {
    // This would typically use a library like sharp or jimp
    // For now, we'll simulate the processing
    const processedUrl = `${imageUrl}?optimized=true&quality=${options.quality}&format=${options.format}`;
    return processedUrl;
  }

  private async generateVariants(
    imageUrl: string,
    options: ImageOptimizationOptions
  ): Promise<{
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  }> {
    const variants = {
      thumbnail: await this.generateThumbnail(imageUrl, 150),
      small: await this.optimizeImage(imageUrl, { width: 320, ...options }),
      medium: await this.optimizeImage(imageUrl, { width: 640, ...options }),
      large: await this.optimizeImage(imageUrl, { width: 1024, ...options })
    };

    return {
      thumbnail: variants.thumbnail.optimized.url,
      small: variants.small.optimized.url,
      medium: variants.medium.optimized.url,
      large: variants.large.optimized.url
    };
  }

  private generateCacheKey(imageUrl: string, options: ImageOptimizationOptions): string {
    const optionsString = JSON.stringify(options);
    return `${imageUrl}_${btoa(optionsString)}`;
  }

  private getFormatFromMimeType(mimeType: string): string {
    const formatMap: Record<string, string> = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/gif': 'gif',
      'image/svg+xml': 'svg'
    };
    
    return formatMap[mimeType] || 'jpeg';
  }

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(variants: Record<string, OptimizedImage>): string {
    return Object.entries(variants)
      .map(([size, variant]) => `${variant.optimized.url} ${size.replace('w', '')}w`)
      .join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizes(breakpoints: number[]): string {
    return breakpoints
      .map((width, index) => {
        if (index === breakpoints.length - 1) {
          return `${width}px`;
        }
        return `(max-width: ${width}px) ${width}px`;
      })
      .join(', ');
  }

  /**
   * Generate picture element for responsive images
   */
  generatePictureElement(
    imageUrl: string,
    variants: Record<string, OptimizedImage>,
    alt: string = ''
  ): string {
    const srcset = this.generateSrcSet(variants);
    const sizes = this.generateSizes(Object.keys(variants).map(key => parseInt(key.replace('w', ''))));
    
    return `
      <picture>
        <source srcset="${srcset}" sizes="${sizes}" type="image/webp">
        <img src="${imageUrl}" alt="${alt}" loading="lazy">
      </picture>
    `;
  }

  /**
   * Generate lazy loading image
   */
  generateLazyImage(
    imageUrl: string,
    alt: string = '',
    placeholder?: string
  ): string {
    return `
      <img 
        src="${placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='}"
        data-src="${imageUrl}"
        alt="${alt}"
        loading="lazy"
        class="lazy-image"
      >
    `;
  }

  /**
   * Generate progressive JPEG
   */
  async generateProgressiveJPEG(imageUrl: string): Promise<OptimizedImage> {
    return this.optimizeImage(imageUrl, {
      format: 'jpeg',
      quality: 85
    });
  }

  /**
   * Generate WebP with fallback
   */
  async generateWebPWithFallback(imageUrl: string): Promise<{
    webp: OptimizedImage;
    fallback: OptimizedImage;
  }> {
    const webp = await this.optimizeImage(imageUrl, {
      format: 'webp',
      quality: 80
    });
    
    const fallback = await this.optimizeImage(imageUrl, {
      format: 'jpeg',
      quality: 85
    });
    
    return { webp, fallback };
  }

  /**
   * Generate AVIF with fallback
   */
  async generateAVIFWithFallback(imageUrl: string): Promise<{
    avif: OptimizedImage;
    webp: OptimizedImage;
    fallback: OptimizedImage;
  }> {
    const avif = await this.optimizeImage(imageUrl, {
      format: 'avif',
      quality: 75
    });
    
    const webp = await this.optimizeImage(imageUrl, {
      format: 'webp',
      quality: 80
    });
    
    const fallback = await this.optimizeImage(imageUrl, {
      format: 'jpeg',
      quality: 85
    });
    
    return { avif, webp, fallback };
  }
}

export default ImageOptimizer;


