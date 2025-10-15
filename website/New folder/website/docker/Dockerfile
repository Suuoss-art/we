# Dockerfile for KOPMA UNNES Website
# Multi-stage build for production optimization

# Stage 1: Frontend Builder
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY astro.config.mjs ./
COPY tailwind.config.mjs ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

# Stage 2: Backend Builder
FROM php:8.2-fpm-alpine AS backend-builder

# Install system dependencies
RUN apk add --no-cache \
    mysql-client \
    redis \
    curl \
    zip \
    unzip \
    git \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mysqli \
    opcache \
    bcmath \
    intl \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY backend/ ./backend/

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Stage 3: Production Image
FROM nginx:alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    php82 \
    php82-fpm \
    php82-mysqli \
    php82-pdo \
    php82-pdo_mysql \
    php82-opcache \
    php82-bcmath \
    php82-intl \
    php82-zip \
    php82-curl \
    php82-json \
    php82-mbstring \
    php82-xml \
    php82-dom \
    php82-simplexml \
    php82-xmlreader \
    php82-xmlwriter \
    php82-tokenizer \
    php82-ctype \
    php82-filter \
    php82-hash \
    php82-openssl \
    php82-pcre \
    php82-session \
    php82-spl \
    php82-standard \
    php82-sysvmsg \
    php82-sysvsem \
    php82-sysvshm \
    php82-zlib \
    php82-redis \
    php82-igbinary \
    php82-msgpack \
    php82-memcached \
    php82-apcu \
    php82-mcrypt \
    php82-gd \
    php82-imagick \
    php82-exif \
    php82-fileinfo \
    php82-posix \
    php82-shmop \
    php82-sockets \
    php82-sysvmsg \
    php82-sysvsem \
    php82-sysvshm \
    php82-tidy \
    php82-wddx \
    php82-xmlrpc \
    php82-xsl \
    php82-yaml \
    php82-zip \
    php82-zlib \
    php82-bz2 \
    php82-calendar \
    php82-ctype \
    php82-curl \
    php82-date \
    php82-dba \
    php82-dom \
    php82-enchant \
    php82-exif \
    php82-ffi \
    php82-fileinfo \
    php82-filter \
    php82-ftp \
    php82-gd \
    php82-gettext \
    php82-gmp \
    php82-hash \
    php82-iconv \
    php82-imap \
    php82-intl \
    php82-json \
    php82-ldap \
    php82-libxml \
    php82-mbstring \
    php82-mysqli \
    php82-oci8 \
    php82-odbc \
    php82-opcache \
    php82-openssl \
    php82-pcntl \
    php82-pcre \
    php82-pdo \
    php82-pdo_dblib \
    php82-pdo_firebird \
    php82-pdo_ibm \
    php82-pdo_informix \
    php82-pdo_mysql \
    php82-pdo_oci \
    php82-pdo_odbc \
    php82-pdo_pgsql \
    php82-pdo_sqlite \
    php82-pgsql \
    php82-phar \
    php82-posix \
    php82-pspell \
    php82-readline \
    php82-reflection \
    php82-session \
    php82-shmop \
    php82-simplexml \
    php82-snmp \
    php82-soap \
    php82-sockets \
    php82-sodium \
    php82-spl \
    php82-sqlite3 \
    php82-sysvmsg \
    php82-sysvsem \
    php82-sysvshm \
    php82-tidy \
    php82-tokenizer \
    php82-xml \
    php82-xmlreader \
    php82-xmlrpc \
    php82-xmlwriter \
    php82-xsl \
    php82-yaml \
    php82-zip \
    php82-zlib \
    redis \
    supervisor \
    curl \
    wget \
    unzip \
    git

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy backend from backend-builder
COPY --from=backend-builder /var/www/html /var/www/html

# Copy monitoring system
COPY monitoring/ /app/monitoring/

# Copy Docker configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php.ini /usr/local/etc/php/php.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories
RUN mkdir -p /app/logs /app/backups /app/ssl /var/log/nginx /var/log/php

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chown -R www-data:www-data /usr/share/nginx/html
RUN chmod -R 755 /var/www/html
RUN chmod -R 755 /usr/share/nginx/html
RUN chmod -R 755 /app

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates (if available)
COPY docker/ssl/ /etc/nginx/ssl/

# Set environment variables
ENV NODE_ENV=production
ENV PHP_ENV=production
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]




