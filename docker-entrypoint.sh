#!/bin/sh

echo "🚀 Starting OpenLibry..."

# Create database directory if it doesn't exist
mkdir -p /app/prisma/database

# Push database schema (creates database if needed)
echo "📦 Setting up database..."
npx prisma db push

# Start the application
echo "🌟 Starting Next.js server..."
npm run start