# 🍱 SavorSync — Cook the Culture

*A full-stack journey of food, culture, and community — built with love, UX research, and modern tech*

---

## 🌍 What is SavorSync?

SavorSync is not just a recipe app — it's a culturally immersive cooking platform that helps users discover global dishes, learn the stories behind them, connect with a community of food lovers, and cook with confidence — all in one beautifully designed space.

Built from scratch as part of my Human-Computer Interaction (HCI) journey, SavorSync blends UX design, full-stack development, and cultural storytelling. It's powered by real user research, thoughtful design iterations, and a deep belief that food is a universal language that connects us all.

---

## 🎯 Why I Built It

Coming from a background in intercultural communication now into tech, I've always seen food as a powerful way to understand culture. But most recipe platforms feel transactional with just lists of ingredients with no soul or story.

So I asked myself: **"What if cooking a recipe could feel like stepping into someone's world?"**

SavorSync is my answer:
- **A platform to learn culture through cooking**
- **A space to listen to music, hear stories, and understand the "why" behind each dish**
- **A tool that usesmodern web application devevelopment techonology and even AI to make cooking more accessible and culturally meaningful**

---

## ✨ Key Features

### 🧭 **Discover Global Recipes**
- Browse by cuisine (Chinese, Indian, Mediterranean, etc.) and U.S. regional styles (Southern, Tex-Mex, New England)
- Filter by dietary needs, difficulty, or cooking time
- Step-by-step instructions, with the dish's fun facts gathered in a "Good to know" note beside the steps

### 🧠 **AI-Powered Cultural Insights**
- Ask questions like *"What's the story behind this dish?"* or *"Why is this ingredient important?"*
- OpenAI integration provides engaging, educational responses — turning your kitchen into a cultural classroom
- Learn the history, traditions, and cultural significance behind every recipe

### 🔄 **Smart Ingredient Substitutions**
- AI-driven suggestions for vegetarian, gluten-free, and low-sodium alternatives
- Culturally sensitive swaps that maintain the dish's authenticity
- Learn why each ingredient matters and how substitutions affect the final dish

### 🎵 **Cook with Music**
- Spotify integration lets you vibe to traditional playlists from each region while you cook
- Creates an immersive, mood-driven cooking experience
- Discover new music while exploring new cuisines

### 💬 **Community & Social Cooking**
- Share your cooking photos, stories, and personal twists on recipes
- Comment, like, and get inspired by fellow food enthusiasts from around the world
- Build connections through shared culinary adventures

### 🍳 **Cook with AI**
- Tell SavorSync what's in your kitchen and AI writes a recipe around it, with its cultural story
- Pick a cuisine, a diet and a time limit; save the recipes you like to your profile

### 🛒 **Kitchen Tools**
- Save favorites with the heart on any recipe
- Scale servings and switch between US and metric units
- Add a recipe's ingredients to a shopping list, then tick them off as you shop
- "I made this" reviews with star ratings, notes and photos; Trending ranks dishes by saves and reviews

---

## 🧪 The HCI Design Process

### 📊 **Research Phase**
User surveys and interviews revealed common pain points:
- Recipe overload with no cultural context or meaning
- Lack of clear dietary filters and substitution options
- Poor user experience with cluttered interfaces and excessive ads

### 🎨 **Design Phase**
Iterative design from low to high-fidelity prototypes in Figma, focusing on:
- **Clarity and simplicity** in navigation and recipe presentation
- **Cultural visual cues** through images, icons, and music integration
- **Inclusive design** for cooks of all skill levels and dietary needs

### 🧱 **Build Phase**
Full-stack implementation using modern web technologies with emphasis on:
- Clean, scalable architecture
- Responsive design for all devices
- Seamless API integrations for enhanced user experience

---

## 🧰 Technology Stack

### 🖥️ **Frontend**
- **React** + **TypeScript** + **Vite** for modern, type-safe development
- **Material-UI (MUI)** for consistent, beautiful design components
- **React Router** for smooth page transitions
- **Axios** for efficient API communication

### ⚙️ **Backend**
- **Node.js** + **Express.js** for robust server architecture
- **MongoDB** + **Mongoose** for flexible data management
- **JWT** + **bcryptjs** for secure user authentication
- **OpenAI API** for cultural insights and ingredient substitutions
- **Spotify Web API** for music integration
- **Cloudinary** for optimized image storage and delivery

### 🛠️ **Development Tools**
- **Git** + **GitHub** for version control and collaboration
- **MongoDB Atlas** for cloud database hosting
- **ESLint** + **Prettier** for code quality
- **Nodemon** for development efficiency

---

## 💡 What I Learned

This project transformed me into a more well-rounded developer and designer:

- **UX Researcher** — Applied real user feedback to create meaningful design solutions
- **Full-Stack Developer** — Built everything from database schemas to responsive UI components
- **Product Thinker** — Balanced technical features with cultural storytelling
- **Problem Solver** — Debugged complex integrations across multiple APIs and services
- **Culture-Centered Creator** — Learned to build technology that celebrates diversity and connection

---

## 🚀 How to Run Locally

### **Clone the Repository**
```bash
git clone https://github.com/your-username/SavorSync.git
cd SavorSync
```

### **Backend Setup**
```bash
cd savorsync-api
npm install
```

Create a `.env` file with:
```env
MONGODB_URI=your-mongodb-connection-string
RECIPE_MONGODB_URI=your-recipe-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=your-openai-api-key
# Optional: the chat model for cultural Q&A (defaults to gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
# For "Cook with music" playlists (Spotify developer dashboard, no user login needed)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
NODE_ENV=development
```

```bash
npm start
```

### **Frontend Setup**
```bash
cd ../savorsync-frontend
npm install
npm run dev
```

**Open** `http://localhost:5173` **to explore!**

---

## 🔮 Future Enhancements

- **Mobile App** for cooking on the go
- **Voice-Guided Cooking** for hands-free recipe navigation
- **Weekly meal plans**: not built yet. For now SavorSync is about discovering recipes and cooking them, not planning a week of meals.
- **Advanced AI Cooking Assistant** for personalized recommendations

---

## 🌟 Project Impact

SavorSync represents more than just a technical achievement — it's a bridge between cultures, a celebration of diversity, and a tool for meaningful human connection. Through food, we can learn about each other's traditions, histories, and stories.

This project demonstrates how thoughtful UX research, modern technology, and cultural sensitivity can come together to create something truly meaningful.

---

## 🙋‍♀️ About the Creator

I'm **Xinjie Shen** — a culture explorer turned full-stack developer. SavorSync blends my passion for storytelling, design, and technology into one heartfelt project that celebrates the beautiful diversity of global cuisine.

If you're interested in food, culture, technology, or collaboration — I'd love to connect!

---

*"Cooking is not just about ingredients — it's about identity, memory, and joy."*

**Let's savor the world together, one recipe at a time.** 🌍
