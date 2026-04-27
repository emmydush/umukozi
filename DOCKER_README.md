# Umukozi - Docker Deployment Guide

This guide explains how to deploy the Umukozi platform using Docker containers.

## Prerequisites

- Docker 20.10+ installed on your system
- Docker Compose 2.0+ (for multi-service deployment)
- At least 2GB of available RAM
- 2GB of free disk space

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/emmydush/umukozi.git
cd umukozi
```

### 2. Development Deployment
```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

The application will be available at:
- Frontend: http://localhost:3001
- API: http://localhost:3001/api

### 3. Production Deployment
```bash
# Use production profile with Nginx reverse proxy
docker-compose --profile production up --build -d
```

The application will be available at:
- Frontend: http://localhost (via Nginx)
- API: http://localhost/api

## Configuration

### Environment Variables
Copy the production environment file and customize it:
```bash
cp .env.production .env
```

Key environment variables to configure:
- `JWT_SECRET`: Change this to a secure random string
- `CORS_ORIGIN`: Update to your production domain
- `EMAIL_*`: Configure email settings for notifications
- `PAYMENT_*`: Configure payment provider settings

### Database Initialization
The SQLite database will be automatically created on first run. To initialize with sample data:

```bash
# Access the running container
docker-compose exec umukozi-app sh

# Initialize database
node database/init_db.js
```

## Services

### umukozi-app
- **Purpose**: Main Node.js application
- **Port**: 3001
- **Health Check**: Every 30 seconds
- **Volumes**: 
  - `./uploads:/app/uploads` (file uploads)
  - `./database:/app/database` (SQLite database)

### nginx (Production Only)
- **Purpose**: Reverse proxy and static file serving
- **Ports**: 80, 443
- **Features**:
  - GZIP compression
  - Rate limiting
  - SSL termination (when configured)
  - Static asset caching

## Management Commands

### View Logs
```bash
# View all logs
docker-compose logs

# View application logs only
docker-compose logs umukozi-app

# Follow logs in real-time
docker-compose logs -f umukozi-app
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up --build -d
```

### Backup Data
```bash
# Backup database
docker-compose exec umukozi-app cp /app/database/umukozi.db /app/database/backup_$(date +%Y%m%d_%H%M%S).db

# Backup uploads
docker run --rm -v umukozi_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Restore Data
```bash
# Restore database
docker cp backup_file.db umukozi-app:/app/database/umukozi.db

# Restore uploads
docker run --rm -v umukozi_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_backup.tar.gz -C /data
```

## Production Setup

### SSL Configuration
1. Place SSL certificates in the `ssl/` directory:
   - `ssl/cert.pem` - SSL certificate
   - `ssl/key.pem` - SSL private key

2. Uncomment the HTTPS server block in `nginx.conf`

3. Update the server_name in nginx.conf to your domain

### Performance Optimization
1. **Resource Limits**: Adjust container resource limits in docker-compose.yml
2. **Database**: Consider PostgreSQL for high-traffic deployments
3. **Caching**: Add Redis for session storage and caching
4. **CDN**: Use CDN for static assets in production

### Security Considerations
1. **Change Default Secrets**: Always change JWT_SECRET in production
2. **Network Security**: Use private networks in production
3. **Regular Updates**: Keep Docker images updated
4. **Monitoring**: Set up monitoring and alerting
5. **Backups**: Implement automated backup strategy

## Troubleshooting

### Common Issues

**Application won't start**
```bash
# Check logs
docker-compose logs umukozi-app

# Check if port is available
netstat -tulpn | grep 3001
```

**Database connection issues**
```bash
# Check database file permissions
docker-compose exec umukozi-app ls -la /app/database/

# Reinitialize database
docker-compose exec umukozi-app rm /app/database/umukozi.db
docker-compose restart umukozi-app
```

**File upload issues**
```bash
# Check uploads directory permissions
docker-compose exec umukozi-app ls -la /app/uploads/

# Fix permissions if needed
docker-compose exec umukozi-app chown -R nodejs:nodejs /app/uploads
```

### Health Checks
```bash
# Check application health
curl http://localhost:3001/health

# Check container status
docker-compose ps
```

## Development

### Local Development with Docker
```bash
# Mount source code for live reloading
docker-compose -f docker-compose.dev.yml up --build
```

### Building Images
```bash
# Build only the application image
docker build -t umukozi-app .

# Build with custom tag
docker build -t umukozi-app:v1.0.0 .
```

## Support

For issues related to:
- Docker deployment: Check this guide and Docker documentation
- Application functionality: Check the main README.md
- Security: Review security considerations section

## License

This Docker configuration is part of the Umukozi project. See the main project license for details.
