# 🚀 Deployment Guide - Plugumons Staking on Solana Mainnet

## ✅ Pre-Deployment Checklist

- [x] Private key added to `.env`
- [x] Reward wallet funded with PLUGU tokens
- [x] All wallet integrations working
- [x] Production mode enabled
- [ ] Domain name configured (optional)
- [ ] SSL certificate ready (for HTTPS)

---

## 🌐 Deployment Options

### Option 1: Deploy to VPS (Recommended)

#### Services: DigitalOcean, AWS EC2, Linode, Vultr

**1. Provision Server:**
```bash
# Minimum specs:
- 1 GB RAM
- 1 CPU core
- 25 GB SSD
- Ubuntu 22.04 LTS
```

**2. Connect to Server:**
```bash
ssh root@your-server-ip
```

**3. Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt install npm
```

**4. Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

**5. Upload Your Code:**
```bash
# On your local machine
scp -r /app root@your-server-ip:/var/www/plugumons-staking
```

**6. Configure on Server:**
```bash
cd /var/www/plugumons-staking
npm install

# Create .env file
nano .env
# Paste your configuration with private key
# Save: CTRL+X, Y, Enter
```

**7. Start with PM2:**
```bash
pm2 start server.js --name plugumons-staking
pm2 save
pm2 startup
```

**8. Configure Nginx (for domain):**
```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/plugumons
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/plugumons /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**9. Setup SSL (HTTPS):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Option 2: Deploy to Heroku

**1. Install Heroku CLI:**
```bash
npm install -g heroku
```

**2. Login and Create App:**
```bash
heroku login
heroku create plugumons-staking
```

**3. Add Environment Variables:**
```bash
heroku config:set SOLANA_RPC=https://api.mainnet-beta.solana.com
heroku config:set REWARD_WALLET_PRIVATE_KEY=your_key_here
heroku config:set PORT=3000
```

**4. Deploy:**
```bash
git push heroku main
```

**5. Open App:**
```bash
heroku open
```

---

### Option 3: Deploy to Vercel

**Note:** Vercel is serverless, so you'll need to modify the setup for serverless functions.

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "SOLANA_RPC": "https://api.mainnet-beta.solana.com",
    "PORT": "3000"
  }
}
```

**3. Deploy:**
```bash
vercel
```

**4. Add Private Key:**
```bash
vercel env add REWARD_WALLET_PRIVATE_KEY
# Paste your private key when prompted
```

---

### Option 4: Deploy to Render

**1. Go to:** https://render.com

**2. Create New Web Service:**
- Connect your GitHub repository
- Name: plugumons-staking
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`

**3. Add Environment Variables:**
```
SOLANA_RPC = https://api.mainnet-beta.solana.com
REWARD_WALLET_PRIVATE_KEY = your_key_here
PORT = 3000
```

**4. Deploy:**
- Click "Create Web Service"
- Automatic deployment from GitHub

---

## 🔒 Security for Production

### 1. Update .env for Production:
```env
SOLANA_RPC=https://api.mainnet-beta.solana.com
REWARD_WALLET_PRIVATE_KEY=your_actual_key
PORT=3000
NODE_ENV=production
```

### 2. Add Rate Limiting:
```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Add Helmet for Security Headers:
```bash
npm install helmet
```

Add to `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Enable CORS properly:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

---

## 📊 Monitoring & Maintenance

### Check Server Status:
```bash
pm2 status
pm2 logs plugumons-staking
```

### Monitor Reward Wallet:
- Visit: https://explorer.solana.com/address/HaLue8w9EcBS4j3vTzHoyBcTvZCV6dWPd9YQce7S2QZZ
- Check balance regularly
- Set up alerts for low balance

### Database Backup:
```bash
# Backup staking.db regularly
cp /var/www/plugumons-staking/staking.db /backups/staking-$(date +%Y%m%d).db
```

### Setup Cron Job for Backups:
```bash
crontab -e

# Add this line (daily backup at 2 AM):
0 2 * * * cp /var/www/plugumons-staking/staking.db /backups/staking-$(date +\%Y\%m\%d).db
```

---

## 🔧 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Issue: PM2 not starting
```bash
pm2 delete all
pm2 start server.js --name plugumons-staking
```

### Issue: Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status
# Restart app
pm2 restart plugumons-staking
```

### Issue: Out of memory
```bash
# Increase Node.js memory
pm2 start server.js --name plugumons-staking --node-args="--max-old-space-size=1024"
```

---

## 📱 Post-Deployment Testing

1. Visit your deployed URL
2. Test wallet connection (Phantom, Solflare, Backpack)
3. Create a small test stake
4. Verify leaderboard updates
5. Check grid stats are accurate
6. Test reward claiming
7. Verify tokens are transferred
8. Check transaction on Solana Explorer

---

## 🌐 DNS Configuration

If using a custom domain:

**A Record:**
```
Type: A
Name: @
Value: your_server_ip
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: your-domain.com
TTL: 3600
```

---

## ✅ Production Deployment Complete!

Your Plugumons staking system is now live on Solana Mainnet:
- ✅ Users can stake PLUGU tokens
- ✅ NFT holders get special benefits
- ✅ Rewards are automatically distributed
- ✅ Leaderboard tracks top stakers
- ✅ Grid power system active

**Monitor your reward wallet balance and enjoy!** 🎉

---

## 📞 Support

For deployment issues:
- Check server logs: `pm2 logs`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Check database: `sqlite3 staking.db`
- Verify Solana RPC: `curl https://api.mainnet-beta.solana.com`
