#!/bin/bash

# GitHub Pages Deployment Script
# Run this after setting up your Supabase backend

echo "🚀 Deploying Coaching Materials Hub to GitHub Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Create a temporary directory for deployment
echo "📁 Preparing deployment files..."
cp -r dist/* .

# Add all files to git
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://YOUR_USERNAME.github.io/coaching-materials-hub"
echo ""
echo "⚠️  Remember to:"
echo "1. Set up Supabase backend"
echo "2. Update environment variables in your hosting platform"
echo "3. Test the deployed application"
