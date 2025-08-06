# API Integration Guide

## 🎯 **Final Structure**

### **File Structure**
```
src/services/
├── apiUser.ts      ← User authentication & profile (port 3001)
└── apiRecipe.ts    ← Recipe data & generation (port 8000)
```

### **API Endpoints**
| File | Handles | Connects to |
|------|---------|-------------|
| `apiUser.ts` | login, register, auth, profile | `http://localhost:3001/api` |
| `apiRecipe.ts` | recipes, generation, search | `http://localhost:8000` |

## 🔧 **Configuration Required**

### **1. Frontend Environment Variables**
Create `.env` file in `savorsync-frontend/`:
```env
# FastAPI Recipe Backend Configuration
VITE_ADMIN_API_KEY=your-admin-api-key-here

# API Endpoints
VITE_USER_API_URL=http://localhost:3001/api
VITE_RECIPE_API_URL=http://localhost:8000
```

### **2. Backend Setup**
- **Node.js Backend (Port 3001)**: Already configured for user authentication
- **FastAPI Backend (Port 8000)**: Needs to be running for recipe data

## 📝 **Updated Components**

### **UserContext.tsx**
- ✅ Updated to use `apiUser.ts`
- ✅ Handles authentication and user profile

### **CuisinePage.tsx**
- ✅ Updated to use `apiRecipe.ts`
- ✅ Fetches recipes from FastAPI backend

### **RecipeDetailPage.tsx**
- ✅ Updated to use `apiRecipe.ts`
- ✅ Added loading and error states
- ✅ Async recipe fetching

## 🚀 **How to Test**

### **1. Start Both Backends**
```bash
# Terminal 1: Node.js Backend (User Auth)
cd savorsync-api
npm run dev

# Terminal 2: FastAPI Backend (Recipes)
# Start your FastAPI server on port 8000
```

### **2. Start Frontend**
```bash
cd savorsync-frontend
npm run dev
```

### **3. Test Endpoints**
- **User Login**: `http://localhost:5174/login`
- **Recipe Browse**: `http://localhost:5174/cuisine/asian`
- **Recipe Detail**: `http://localhost:5174/recipe/[id]`

## 🔄 **API Functions Available**

### **User API (apiUser.ts)**
```typescript
// Authentication
authAPI.register(name, email, password)
authAPI.login(email, password)

// User Profile
userProfileAPI.getProfile()
userProfileAPI.updateProfile(updates)
userProfileAPI.addToFavorites(recipeName)
userProfileAPI.saveRecipe(recipeName)

// Health Check
healthAPI.check()
```

### **Recipe API (apiRecipe.ts)**
```typescript
// Recipe Data
getAllRecipes()
getRecipeById(id)
getRecipesByCuisine(cuisine)
searchRecipes(query)

// Recipe Generation
generateRecipe(recipe_name, cuisine)

// Legacy Support
getRecipes(params)
```

## ⚠️ **Important Notes**

1. **Environment Variables**: Make sure to set `VITE_ADMIN_API_KEY` for recipe generation
2. **CORS**: Ensure both backends allow requests from `http://localhost:5174`
3. **Error Handling**: Both APIs include proper error handling and user feedback
4. **Loading States**: Components now show loading states while fetching data

## 🎨 **UI Layout**
- ✅ All existing UI layouts preserved
- ✅ Only API logic changed
- ✅ Same user experience with better data flow 