# 🔧 Render Deployment Fix Guide

## ✅ **Issues Fixed:**

### 1. **Port Configuration**
- **Problem**: Server was hardcoded to port 3001
- **Fix**: Changed to `const PORT = process.env.PORT || 3001;`
- **Why**: Render assigns a dynamic port via environment variable

### 2. **Root Route Added**
- **Added**: `GET /` endpoint that shows API status
- **Purpose**: Easy way to verify deployment is working

---

## 🚀 **Next Steps:**

### **1. Check Render Deployment**
Your Render service should automatically redeploy after the git push. Wait 2-3 minutes, then:

1. **Visit your Render URL** (the one showing "Route not found")
2. **You should now see**:
   ```json
   {
     "message": "SavorSync API is running!",
     "status": "OK",
     "endpoints": {
       "health": "/api/health",
       "auth": "/api/auth",
       "recipes": "/api/recipes",
       "posts": "/api/posts",
       "cultural": "/api/cultural"
     }
   }
   ```

### **2. Test API Endpoints**
Try these URLs (replace `your-render-url` with your actual URL):
- `https://your-render-url.onrender.com/`
- `https://your-render-url.onrender.com/api/health`
- `https://your-render-url.onrender.com/api/recipes`

### **3. Set Environment Variables in Render**
In your Render dashboard, make sure these are set:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=your-user-mongodb-connection
RECIPE_MONGODB_URI=your-recipe-mongodb-connection
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=your-openai-key
```

---

## 🔍 **If Still Not Working:**

### **Check Render Logs**
1. Go to your Render service dashboard
2. Click "Logs" tab
3. Look for errors like:
   - Database connection failures
   - Missing environment variables
   - Port binding issues

### **Common Issues:**
- **Database not connecting**: Check MongoDB URI format
- **Still getting 404**: Clear browser cache or try incognito
- **Environment variables**: Make sure they're exactly as above

---

## 📱 **After Backend Works:**

### **Deploy Frontend to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Select your GitHub repository
4. Configure:
   ```
   Base directory: savorsync-frontend
   Build command: npm run build
   Publish directory: savorsync-frontend/dist
   ```
5. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL=https://your-render-url.onrender.com/api
   ```

### **Update Frontend API URLs**
Once you have your Render URL, you can set the environment variable instead of hardcoding.

---

## 🎉 **Success Indicators**

✅ **Backend Working**: Root URL shows API status  
✅ **Database Connected**: Health endpoint shows "connected"  
✅ **Routes Working**: `/api/recipes` returns recipe data  
✅ **Frontend Ready**: Environment variables configured  

Your SavorSync app will be live! 🚀 