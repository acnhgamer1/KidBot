# 🚀 Deploy KidBot AI to GitHub Pages

This guide will help you deploy your KidBot AI application to GitHub Pages for free hosting.

## 📋 Prerequisites

- GitHub account
- Your KidBot repository on GitHub
- GitHub Pages enabled for your repository

## 🔧 Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**

### 2. Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

**To deploy:**

1. Merge your changes to the `main` branch
2. The GitHub Action will automatically:
   - Build the React application
   - Deploy it to GitHub Pages
3. Your site will be available at: `https://yourusername.github.io/KidBot/`

### 3. Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# 1. Navigate to the client directory
cd client

# 2. Install dependencies
npm install

# 3. Build the application
npm run build

# 4. The built files will be in the 'dist' directory
# Upload these files to your GitHub Pages branch
```

## 🌐 Accessing Your Deployed App

Once deployed, your KidBot AI will be available at:

```
https://yourusername.github.io/KidBot/
```

Replace `yourusername` with your actual GitHub username.

## ✨ Features Available

Your deployed KidBot AI includes:

- **💬 Normal Chat Mode** - AI-powered conversations
- **🧠 Deep Think Mode** - Enhanced AI responses with dual processing
- **🎨 Image Generation** - Create images from text descriptions
- **📱 Responsive Design** - Works on desktop and mobile
- **🌙 Dark Theme** - ChatGPT-like interface

## 🔧 Configuration

The app is configured to work directly with:

- **Pollinations AI Text API** - For chat responses
- **Pollinations AI Image API** - For image generation

No backend server required! Everything runs in the browser.

## 🐛 Troubleshooting

### Common Issues:

**1. 404 Error on GitHub Pages**

- Make sure GitHub Pages is enabled in repository settings
- Check that the base path in `vite.config.ts` matches your repository name

**2. Build Fails**

- Ensure all dependencies are installed: `npm install`
- Check that Node.js version is 18 or higher

**3. Images Not Loading**

- This may be due to CORS policies
- Images should load after a few seconds

### Getting Help

If you encounter issues:

1. Check the GitHub Actions logs in the **Actions** tab
2. Ensure your repository name matches the base path in `vite.config.ts`
3. Verify GitHub Pages is enabled and set to "GitHub Actions"

## 🎉 You're Done!

Your KidBot AI is now live on the web and accessible to anyone with the URL!
