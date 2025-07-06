# .env.example の充実
cp .env.example .env.template

# セットアップスクリプト作成
echo '#!/bin/bash
echo "🚀 Express API Starter Kit Setup"
cp .env.example .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
npm install
npm run db:seed
echo "✅ Setup completed! Run: npm run dev"