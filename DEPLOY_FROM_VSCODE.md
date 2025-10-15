# 🚀 Deploy from VS Code Terminal - Complete Guide

## ✅ Prerequisites
- [x] Code pushed to GitHub
- [x] Private key in `.env` file
- [ ] Choose deployment platform (Render recommended for free tier)

---

## 🎯 Option 1: Deploy to Render (Recommended - Free Tier)

### Step 1: Sign in to Render
1. Go to https://render.com
2. Sign in with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click **"New +"** button in top right
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Find and select your `plugumons-staking` repository
5. Click **"Connect"**

### Step 3: Configure Service

**Name:** `plugumons-staking`

**Environment:** `Node`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment Variables (CRITICAL):**
Click "Advanced" → "Add Environment Variable"

Add these variables:
```
SOLANA_RPC = https://api.mainnet-beta.solana.com
REWARD_WALLET_PRIVATE_KEY = 3She7cac5voQCKXbkb9y3gzCKaZnVHasKihEzwVZ6rzLTg1xG9UdEjsPiKeV7NVvEedujjQLHuhtFEjPRcmTY7B1
PORT = 3000
NODE_ENV = production
```

**Instance Type:** `Free`

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Render will show build logs
4. Once complete, you'll get a URL like: `https://plugumons-staking.onrender.com`

### Step 5: Test Your Deployment
1. Visit your Render URL
2. Test wallet connection
3. Create a small test stake
4. Verify everything works!

**🎉 You're live on Solana Mainnet!**

---

## 🎯 Option 2: Deploy with Heroku (from VS Code terminal)

### Step 1: Install Heroku CLI
**On Mac:**
```bash
brew tap heroku/brew && brew install heroku
```

**On Windows:**
Download from: https://devcenter.heroku.com/articles/heroku-cli

**On Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login to Heroku
Open VS Code terminal and run:
```bash
heroku login
```
Press any key to open browser and login

### Step 3: Create Heroku App
```bash
cd /path/to/your/plugumons-staking
heroku create plugumons-staking
```

If name is taken:
```bash
heroku create plugumons-staking-$(date +%s)
```

### Step 4: Set Environment Variables
```bash
heroku config:set SOLANA_RPC=https://api.mainnet-beta.solana.com
heroku config:set REWARD_WALLET_PRIVATE_KEY=3She7cac5voQCKXbkb9y3gzCKaZnVHasKihEzwVZ6rzLTg1xG9UdEjsPiKeV7NVvEedujjQLHuhtFEjPRcmTY7B1
heroku config:set NODE_ENV=production
```

### Step 5: Deploy
```bash
git push heroku main
```

If you're on a different branch:
```bash
git push heroku your-branch:main
```

### Step 6: Open Your App
```bash
heroku open
```

### Step 7: View Logs (if needed)
```bash
heroku logs --tail
```

**🎉 Deployed!**

---

## 🎯 Option 3: Deploy to VPS (DigitalOcean, AWS, etc.)

### Step 1: Create VPS
**DigitalOcean (Recommended):**
1. Go to https://digitalocean.com
2. Create a Droplet
3. Choose: Ubuntu 22.04 LTS
4. Plan: Basic $6/month (or $4/month)
5. Create droplet

### Step 2: Connect via SSH (from VS Code terminal)
```bash
ssh root@your-server-ip
```

### Step 3: Setup Server
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create app directory
mkdir -p /var/www/plugumons-staking
cd /var/www/plugumons-staking
```

### Step 4: Upload Your Code (from your local VS Code terminal)
```bash
# Zip your project (excluding node_modules)
cd /path/to/your/plugumons-staking
tar -czf plugumons.tar.gz --exclude='node_modules' --exclude='.git' --exclude='staking.db' .

# Upload to server
scp plugumons.tar.gz root@your-server-ip:/var/www/plugumons-staking/

# Or use git clone
ssh root@your-server-ip
cd /var/www/plugumons-staking
git clone https://github.com/your-username/plugumons-staking.git .
```

### Step 5: Setup on Server (SSH session)
```bash
# Extract files (if using tar)
tar -xzf plugumons.tar.gz

# Install dependencies
npm install

# Create .env file
nano .env
```

Paste this into .env:
```
SOLANA_RPC=https://api.mainnet-beta.solana.com
REWARD_WALLET_PRIVATE_KEY=3She7cac5voQCKXbkb9y3gzCKaZnVHasKihEzwVZ6rzLTg1xG9UdEjsPiKeV7NVvEedujjQLHuhtFEjPRcmTY7B1
PORT=3000
NODE_ENV=production
```

Save: `CTRL+X`, then `Y`, then `Enter`

### Step 6: Start with PM2
```bash
pm2 start server.js --name plugumons-staking
pm2 save
pm2 startup
```

Copy the command PM2 shows and run it

### Step 7: Setup Nginx (Optional, for custom domain)
```bash
apt install nginx -y

# Create nginx config
nano /etc/nginx/sites-available/plugumons
```

Paste this:
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

Enable and start:
```bash
ln -s /etc/nginx/sites-available/plugumons /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 8: Setup SSL (Free HTTPS)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com -d www.your-domain.com
```

**🎉 Your VPS is live!**

---

## 🤖 Setup UptimeRobot Monitoring

### Why UptimeRobot?
- Keep your Render free tier app awake (free tier sleeps after 15 min)
- Get alerts if your site goes down
- Monitor uptime statistics

### Setup Steps:

1. **Sign in to UptimeRobot**
   - Go to https://uptimerobot.com
   - Log in to your free account

2. **Add New Monitor**
   - Click **"+ Add New Monitor"**
   
3. **Configure Monitor**
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Plugumons Staking
   - **URL:** Your deployed URL (e.g., `https://plugumons-staking.onrender.com` or `https://your-domain.com`)
   - **Monitoring Interval:** 5 minutes (free tier)

4. **Alert Contacts** (Optional)
   - Add your email for downtime alerts
   - Click **"Create Monitor"**

5. **Done!**
   - UptimeRobot will ping your site every 5 minutes
   - Keeps Render free tier awake
   - Alerts you if site goes down

### Advanced: Keep Render App Awake 24/7

For Render free tier apps (they sleep after 15 min inactivity):

**Option A: Use UptimeRobot (Already setup above)**
- Pings every 5 minutes
- Keeps app awake during day
- App still sleeps at night (Render free tier limit)

**Option B: Use Cron-job.org (Additional monitor)**
1. Go to https://cron-job.org
2. Sign up free
3. Create job: Ping your URL every 5 minutes
4. Combine with UptimeRobot for better coverage

**Option C: Upgrade Render (Recommended for production)**
- $7/month for always-on instance
- No sleep, guaranteed uptime
- Better for production use

---

## 📊 Post-Deployment Checklist

### Test Everything:
- [ ] Visit your deployed URL
- [ ] Test Phantom wallet connection
- [ ] Test Solflare wallet connection
- [ ] Test Backpack wallet connection
- [ ] Create a small test stake
- [ ] Verify leaderboard updates
- [ ] Check grid stats are accurate
- [ ] Test docs modal
- [ ] Test reward calculator
- [ ] Try claiming rewards (if you have an active stake)
- [ ] Check transaction on Solana Explorer

### Monitor:
- [ ] Setup UptimeRobot monitoring
- [ ] Check reward wallet has PLUGU tokens
- [ ] Monitor for any errors in logs
- [ ] Test from mobile device

### Optimize:
- [ ] Add custom domain (optional)
- [ ] Setup SSL/HTTPS
- [ ] Enable monitoring alerts
- [ ] Share link with community!

---

## 🔧 Troubleshooting

### Render Deployment Issues:

**Build Failed:**
```bash
# Check package.json is valid
# Verify all dependencies are listed
# Check build logs for specific errors
```

**Environment Variables Not Working:**
- Go to Render dashboard
- Click your service
- Go to "Environment" tab
- Verify all variables are set correctly
- Redeploy

**App Not Starting:**
- Check Render logs
- Verify PORT is set to 3000
- Ensure start command is `npm start`

### Heroku Issues:

**Push Rejected:**
```bash
# Make sure you committed changes
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

**Logs Show Errors:**
```bash
heroku logs --tail
# Read error messages
# Fix issues and push again
```

### VPS Issues:

**Can't Connect via SSH:**
- Check server IP is correct
- Verify firewall allows SSH (port 22)
- Use `ssh -v root@ip` for verbose output

**PM2 Process Crashed:**
```bash
pm2 logs plugumons-staking
pm2 restart plugumons-staking
```

**Nginx 502 Error:**
```bash
pm2 status  # Check if app is running
pm2 restart plugumons-staking
systemctl restart nginx
```

---

## 📞 Quick Commands Reference

### Render (from website):
- View logs: Dashboard → Service → Logs
- Redeploy: Dashboard → Service → Manual Deploy
- Environment vars: Dashboard → Service → Environment

### Heroku (from VS Code terminal):
```bash
heroku logs --tail                    # View logs
heroku ps                            # Check status
heroku restart                       # Restart app
heroku config                        # View env vars
heroku open                          # Open in browser
```

### VPS with PM2 (SSH session):
```bash
pm2 status                           # Check status
pm2 logs plugumons-staking          # View logs
pm2 restart plugumons-staking       # Restart
pm2 stop plugumons-staking          # Stop
pm2 delete plugumons-staking        # Remove
```

---

## ✅ You're Live!

Your Plugumons staking platform is now deployed on Solana Mainnet! 🚀⚡

**Share your URL:**
- Post on X (Twitter)
- Share in Discord
- Add to your website
- Let the community know!

**Monitor your deployment:**
- Check UptimeRobot dashboard
- Monitor reward wallet balance
- Watch for any errors in logs

**Need help?** Check the troubleshooting section or deployment logs!
