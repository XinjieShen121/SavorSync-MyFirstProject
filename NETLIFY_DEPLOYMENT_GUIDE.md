# 🚀 Netlify Deployment Guide for SavorSync Frontend

## 🔧 **CRITICAL FIX: Environment Variable Setup**

### **Step 1: Update Netlify to Use Branch b1**

1. Go to your **Netlify Dashboard**
2. Click on your site: **savorsync-myfirstproject.netlify.app**
3. Go to **"Site settings"** → **"Build & deploy"** → **"Deploy contexts"**
4. Change **"Production branch"** from `main` to `b1`

### **Step 2: Set Environment Variable**

1. In Netlify, go to **"Site settings"** → **"Environment variables"**
2. Click **"Add a variable"**
3. **Key**: `VITE_API_BASE_URL`
4. **Value**: `https://savorsync-myfirstproject.onrender.com/api`
5. Click **"Save"**

### **Step 3: Trigger New Deploy**

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 3-5 minutes for build to complete

## 🐛 **Debug: Check Console Logs**

After deployment, open your browser's **Developer Console** and look for:

```
🔧 Environment VITE_API_BASE_URL: https://savorsync-myfirstproject.onrender.com/api
🌐 Final API Base URL: https://savorsync-myfirstproject.onrender.com/api
🌐 Final Recipe API Base URL: https://savorsync-myfirstproject.onrender.com/api/recipes
```

## ✅ **Expected URLs After Fix**

**Before (Wrong):**
```
❌ https://savorsync-myfirstproject.onrender.com/recipes/cuisine/Asian
```

**After (Correct):**
```
✅ https://savorsync-myfirstproject.onrender.com/api/recipes/cuisine/Asian
```

## 🚨 **If Still Not Working**

If you still see errors after following these steps:

1. **Clear browser cache** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check console logs** for the debug messages above
3. **Verify environment variable** is set correctly in Netlify
4. **Verify Render API** is working: visit `https://savorsync-myfirstproject.onrender.com/api/recipes`

## 📱 **Test Success**

After deployment, test these features:
- ✅ Home page loads
- ✅ Click on "Asian Heritage" cuisine card
- ✅ Recipes load without 404 errors
- ✅ Individual recipe pages work
- ✅ Cultural insights load

## 🎯 **Key Changes in Branch b1**

1. **Added debug logging** to track API URLs
2. **Fixed CORS policy** to allow Netlify domain
3. **Improved error handling** for deployment issues

Your app should now work perfectly! 🎉 