# Deployment Guide - Coolify

This guide explains how to deploy the Deep DMS application to Coolify using Docker Compose.

## Prerequisites

- Coolify instance set up and running
- GitHub repository connected to Coolify
- Azure AD App Registration configured
- Backend API deployed and accessible

## Deployment Steps

### 1. Connect Repository to Coolify

1. Log in to your Coolify dashboard
2. Create a new project or select an existing one
3. Add a new resource: **Docker Compose**
4. Connect your GitHub repository (`deep-dms`)
5. Select the `main` branch (or your preferred branch)

### 2. Configure Build Settings

In Coolify's build settings:
- **Build Pack**: Docker Compose
- **Docker Compose File**: `docker-compose.yml`
- **Base Directory**: Leave empty (root of repository)

### 3. Configure Environment Variables

In Coolify's Environment section, add the following variables:

#### Required Variables

```bash
# Port Configuration
PORT=3000

# Backend API
VITE_API_BASE_URL=https://dmsserver.inova.krd

# Authentication Mode
# Set to true for mock auth (development/testing)
# Set to false for production with real authentication
VITE_MOCK_AUTH=false

# Development Mode
VITE_DEV_MODE=false

# Environment
NODE_ENV=production
```

> **Note**: Copy values from `.env.production.example` and adjust as needed

#### Authentication Modes

- **Mock Auth (Development/Testing)**: Set `VITE_MOCK_AUTH=true`
  - Bypasses Microsoft authentication
  - Uses hardcoded test users
  - Suitable for development and testing environments

- **Production Auth**: Set `VITE_MOCK_AUTH=false`
  - Enables real authentication (when implemented)
  - Requires proper authentication backend

### 4. Configure Domain

1. In Coolify, go to the **Domains** section
2. Add your custom domain (e.g., `dms.yourcompany.com`)
3. Coolify will automatically:
   - Generate SSL certificates via Let's Encrypt
   - Configure reverse proxy
   - Enable HTTPS redirection

### 5. Deploy

1. Click **Deploy** in Coolify
2. Monitor the build logs
3. Wait for the deployment to complete

## Build Process

The deployment follows these stages:

1. **Builder Stage** (Node.js):
   - Installs dependencies (`npm ci`)
   - Builds the Vue.js application (`npm run build`)
   - Generates optimized static files

2. **Production Stage** (Nginx):
   - Copies built files to nginx
   - Serves static content
   - Handles Vue Router (SPA routing)

## Post-Deployment

### Health Check

Visit `https://your-domain.com/health` to verify the deployment is running.

### Verify Authentication

1. Navigate to your application
2. Test the login flow based on your auth mode:
   - **Mock Auth**: Login with test credentials
   - **Production Auth**: Test your authentication backend

### Check Application

1. Test navigation between routes
2. Verify API connectivity
3. Test document upload/download functionality

## Troubleshooting

### Build Fails

- Check Coolify build logs for errors
- Ensure all environment variables are set correctly
- Verify `package.json` dependencies are correct

### Authentication Issues

- Verify `VITE_MOCK_AUTH` is set correctly (true for mock, false for production)
- Check that backend API authentication endpoint is working
- Verify API base URL is correct

### API Connection Issues

- Verify `VITE_API_BASE_URL` points to the correct backend
- Check CORS configuration on backend
- Ensure backend is accessible from the frontend

### Static Assets Not Loading

- Check nginx logs in Coolify
- Verify build completed successfully
- Check browser console for errors

## Scaling

### Horizontal Scaling

To scale the application:

1. In Coolify, adjust the **replicas** setting in the service configuration
2. Coolify will automatically load-balance between instances

### Performance Optimization

- **Nginx Caching**: Already configured in `nginx.conf`
- **Gzip Compression**: Enabled for all text-based assets
- **Static Asset Caching**: 1-year cache for immutable assets

## Maintenance

### Updating the Application

1. Push changes to your GitHub repository
2. Coolify will automatically:
   - Pull latest code
   - Rebuild the Docker image
   - Deploy with zero-downtime (if configured)

### Manual Deployment

To trigger a manual deployment:
1. Go to Coolify dashboard
2. Navigate to your application
3. Click **Redeploy**

### Viewing Logs

Access logs in Coolify:
1. Go to your application
2. Click **Logs** tab
3. View real-time or historical logs

## Security Considerations

- ✅ HTTPS enforced via Coolify
- ✅ Security headers configured in nginx
- ✅ Environment variables stored securely in Coolify
- ✅ Sensitive files excluded via `.dockerignore`
- ✅ Health check endpoint for monitoring

## Support

For issues:
- Check Coolify documentation: https://coolify.io/docs
- Review nginx error logs in Coolify
- Verify environment variables are set correctly
