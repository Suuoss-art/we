# Dockerfile for IP Masking System
# Advanced IP rotation and stealth DNS

FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    wget \
    bind-tools \
    dnsutils \
    netcat-openbsd \
    tcpdump \
    wireshark-common \
    tshark

# Install Python dependencies
RUN pip3 install \
    requests \
    cryptography \
    redis \
    mysql-connector-python

# Set working directory
WORKDIR /app

# Copy IP masking files
COPY . .

# Install Node.js dependencies
RUN npm install

# Set permissions
RUN chmod +x *.py *.ts

# Create logs directory
RUN mkdir -p /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app

# Expose ports
EXPOSE 53 5353

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python3 /app/health_check.py || exit 1

# Start IP masking system
CMD ["python3", "/app/rotation.py", "--loop"]




