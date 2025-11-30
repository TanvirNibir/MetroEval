# Render Deployment Guide for MetroEval

This guide will help you deploy the MetroEval application to Render.

## Prerequisites

1. A [Render](https://render.com) account (free tier available)
2. A GitHub repository with your code (or GitLab/Bitbucket)
3. Google Gemini API key (for AI features)
4. MongoDB database (can use Render's MongoDB or external)

## Deployment Options

### Option 1: Using Render Blueprint (Recommended)

This is the easiest way to deploy everything at once.

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"

3. **Connect your repository**
   - Connect your Git repository
   - Render will detect the `render.yaml` file

4. **Configure Environment Variables**
   Before deploying, you'll need to set these environment variables in the Render dashboard:

   **For Backend Service:**
   - `MONGODB_URI`: Your MongoDB connection string
     - Format: `mongodb://username:password@host:port/database?authSource=admin`
     - If using Render MongoDB: Get the connection string from your MongoDB service
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - `CORS_ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://metroeval-frontend.onrender.com`)
   - `SECRET_KEY`: Will be auto-generated, but you can set a custom one

   **For Frontend Service:**
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://metroeval-backend.onrender.com`)

5. **Deploy**
   - Click "Apply" in the Blueprint
   - Render will create all services and deploy them

### Option 2: Manual Deployment

If you prefer to set up services manually:

#### Step 1: Deploy MongoDB (if using Render's MongoDB)

1. Go to Render Dashboard → "New +" → "PostgreSQL" (or use external MongoDB)
2. Or use Render's MongoDB service:
   - "New +" → "MongoDB"
   - Choose plan (Starter is fine for development)
   - Note the connection string

#### Step 2: Deploy Backend

1. **Create Web Service**
   - Go to Render Dashboard → "New +" → "Web Service"
   - Connect your repository
   - Select the branch (usually `main`)

2. **Configure Backend Service:**
   - **Name**: `metroeval-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --access-logfile - --error-logfile - backend.app.wsgi:app`
   - **Root Directory**: Leave empty (or set to project root)

3. **Set Environment Variables:**
   ```
   PYTHON_VERSION=3.11.0
   PYTHONUNBUFFERED=1
   PYTHONPATH=/opt/render/project/src
   FLASK_ENV=production
   SECRET_KEY=<generate-a-strong-secret-key>
   MONGODB_URI=<your-mongodb-connection-string>
   GOOGLE_API_KEY=<your-google-gemini-api-key>
   CORS_ALLOWED_ORIGINS=https://metroeval-frontend.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://metroeval-backend.onrender.com`)

#### Step 3: Deploy Frontend

1. **Create Web Service**
   - Go to Render Dashboard → "New +" → "Web Service"
   - Connect your repository (same as backend)
   - Select the branch

2. **Configure Frontend Service:**
   - **Name**: `metroeval-frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile.frontend`
   - **Docker Context**: `.` (project root)

3. **Set Environment Variables:**
   ```
   REACT_APP_API_URL=https://metroeval-backend.onrender.com
   RENDER_SERVICE_NAME=metroeval-backend
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your app will be available at the service URL

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SECRET_KEY` | Yes | Flask secret key for sessions | Auto-generated or custom |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://user:pass@host:port/db?authSource=admin` |
| `GOOGLE_API_KEY` | Yes | Google Gemini API key | `AIza...` |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend URL for CORS | `https://metroeval-frontend.onrender.com` |
| `FLASK_ENV` | No | Flask environment | `production` |
| `PYTHON_VERSION` | No | Python version | `3.11.0` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_URL` | Yes | Backend API URL | `https://metroeval-backend.onrender.com` |
| `RENDER_SERVICE_NAME` | No | Backend service name (for auto-detection) | `metroeval-backend` |

## MongoDB Setup

### Option 1: Render MongoDB (Recommended for simplicity)

1. Create MongoDB service in Render
2. Get the connection string from the service dashboard
3. Use it as `MONGODB_URI` in backend environment variables

### Option 2: MongoDB Atlas (Recommended for production)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create database user
4. Whitelist Render's IP addresses (or use 0.0.0.0/0 for development)
5. Get connection string and use as `MONGODB_URI`

### Option 3: External MongoDB

Use any MongoDB instance you have access to. Format the connection string as:
```
mongodb://username:password@host:port/database?authSource=admin
```

## Post-Deployment Checklist

- [ ] Backend service is running and healthy
- [ ] Frontend service is running and healthy
- [ ] MongoDB connection is working
- [ ] API endpoints are accessible
- [ ] Frontend can communicate with backend
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is enabled (automatic on Render)

## Troubleshooting

### Backend Issues

**Issue: Build fails**
- Check that `requirements.txt` is in the project root
- Verify Python version compatibility
- Check build logs for specific errors

**Issue: Application crashes on start**
- Check environment variables are set correctly
- Verify MongoDB connection string format
- Check logs for specific error messages

**Issue: Database connection errors**
- Verify `MONGODB_URI` is correct
- Check MongoDB service is running
- Verify network connectivity (IP whitelist if using Atlas)

### Frontend Issues

**Issue: Build fails**
- Check that `frontend/package.json` exists
- Verify Node.js version compatibility
- Check build logs for specific errors

**Issue: API requests fail**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend service is running
- Verify CORS configuration in backend
- Check browser console for errors

**Issue: 502 Bad Gateway**
- Backend service might be down
- Check backend logs
- Verify backend URL is correct

### Common Issues

**CORS Errors**
- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check backend middleware configuration
- Verify URLs don't have trailing slashes

**Session/Cookie Issues**
- Ensure `SECRET_KEY` is set
- Check cookie settings in Flask config
- Verify HTTPS is enabled (cookies require secure in production)

**Environment Variables Not Working**
- Restart services after changing environment variables
- Verify variable names are correct (case-sensitive)
- Check for typos in values

## Updating Your Deployment

### Automatic Deployments

Render automatically deploys when you push to your connected branch (usually `main`).

### Manual Deployments

1. Go to your service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Rolling Back

1. Go to your service in Render dashboard
2. Click "Events" tab
3. Find the previous successful deployment
4. Click "Redeploy"

## Monitoring

### View Logs

1. Go to your service in Render dashboard
2. Click "Logs" tab
3. View real-time logs

### Health Checks

- Backend: `https://your-backend.onrender.com/api/v1/health` (if implemented)
- Frontend: `https://your-frontend.onrender.com/health`

## Cost Considerations

### Free Tier Limits

- **Web Services**: 750 hours/month (enough for 1 service 24/7)
- **MongoDB**: Limited storage and connections
- **Sleep**: Free services sleep after 15 minutes of inactivity

### Paid Plans

- **Starter**: $7/month per service
- **Standard**: $25/month per service
- **Pro**: $85/month per service

For production, consider:
- Starter plan for backend ($7/month)
- Starter plan for frontend ($7/month)
- MongoDB Atlas free tier or paid plan

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use strong SECRET_KEY**: Generate with `python -c "import secrets; print(secrets.token_hex(32))"`
3. **Enable HTTPS**: Automatic on Render
4. **Restrict CORS**: Only allow your frontend domain
5. **Use MongoDB authentication**: Always use auth in production
6. **Regular updates**: Keep dependencies updated
7. **Monitor logs**: Check for suspicious activity

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

## Next Steps

After deployment:
1. Test all features end-to-end
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up backups for MongoDB
5. Configure CI/CD for automated deployments

---

**Note**: The first deployment may take 5-10 minutes. Subsequent deployments are usually faster (2-5 minutes).

