#!/bin/bash
# deploy-vps.sh - VPS Deployment Script for Privacy Mixer

echo "🚀 Deploying Privacy Mixer to VPS..."

# 1. Install dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx

# 2. Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/yourusername/privacy-mixer.git
cd privacy-mixer

# 3. Install project dependencies
echo "📦 Installing project dependencies..."
npm install
cd client && npm install && cd ..

# 4. Build production
echo "🔨 Building production..."
npm run build:production

# 5. Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/privacy-mixer << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /path/to/privacy-mixer/client/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 6. Enable site
sudo ln -s /etc/nginx/sites-available/privacy-mixer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Setup SSL with Let's Encrypt
echo "🔒 Setting up SSL..."
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 8. Setup PM2 for backend
echo "🔄 Setting up PM2..."
npm install -g pm2
pm2 start server/index.ts --name "privacy-mixer-api"
pm2 startup
pm2 save

echo "✅ Deployment completed!"
echo "🌐 Your app is now live at: https://yourdomain.com"
