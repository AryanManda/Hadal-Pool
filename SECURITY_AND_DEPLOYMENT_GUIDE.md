# 🔒 Security & Deployment Guide - Privacy Mixer

## Table of Contents
1. [Pre-Deployment Security](#pre-deployment-security)
2. [Post-Deployment Security](#post-deployment-security)
3. [Domain Setup with Cloudflare](#domain-setup-with-cloudflare)
4. [Frontend Deployment](#frontend-deployment)
5. [Arbitrum Deployment Setup](#arbitrum-deployment-setup)
6. [Quick Start Overview](#quick-start-overview)

---

## Pre-Deployment Security

### 1. Smart Contract Security Audit

**⚠️ CRITICAL: Mandatory Before Mainnet**

#### Why Audit?
- Protects user funds from vulnerabilities
- Builds trust with users
- Required for insurance coverage
- Identifies gas optimization opportunities

#### Audit Process:

**Step 1: Choose an Auditor**
- **Recommended Firms:**
  - OpenZeppelin (Certified)
  - Trail of Bits
  - CertiK
  - ConsenSys Diligence
  - Hacken

**Step 2: Prepare Documentation**
```bash
# Create audit package with:
# - Complete source code
# - Test suite and coverage reports
# - Architecture documentation
# - Deployment scripts
# - Known limitations/risks
```

**Step 3: Audit Scope**
- [ ] Reentrancy attacks
- [ ] Access control vulnerabilities
- [ ] Integer overflow/underflow (Solidity 0.8+ handles this)
- [ ] Logic errors in business logic
- [ ] Gas optimization
- [ ] Upgrade mechanism security
- [ ] Emergency pause functionality
- [ ] Fee calculation accuracy

**Step 4: Remediation**
- Fix all **Critical** and **High** severity issues
- Document **Medium** and **Low** issues for future updates
- Re-audit if major changes made

**Estimated Cost:** $10,000 - $50,000
**Estimated Time:** 2-4 weeks

---

### 2. Security Testing Checklist

#### Smart Contract Testing:
```bash
# Run all tests
npx hardhat test

# Run with coverage
npx hardhat coverage

# Check for common vulnerabilities
npm install -g slither-analyzer  # If using Slither
```

**Test Coverage Requirements:**
- [ ] 100% code coverage for critical functions
- [ ] All edge cases tested
- [ ] Error conditions tested
- [ ] Integration tests passing

#### Manual Security Checks:
- [ ] **Access Control**: Only owner can pause/upgrade
- [ ] **Reentrancy**: All external calls at end of functions
- [ ] **Integer Safety**: Using SafeMath or Solidity 0.8+
- [ ] **Input Validation**: All inputs validated
- [ ] **Emergency Mechanisms**: Pause function tested
- [ ] **Upgrade Security**: Proxy upgrade mechanism tested

---

### 3. Multi-Signature Wallet Setup

**Why Multi-Sig?**
- Single private key = single point of failure
- Requires multiple approvals for critical operations
- Industry standard for DeFi protocols

**Setup Process:**

1. **Deploy Gnosis Safe Multi-Sig**
   ```bash
   # Use Gnosis Safe UI: https://app.safe.global/
   # Or deploy programmatically
   ```

2. **Configuration:**
   - **Signers**: 3-5 trusted addresses
   - **Threshold**: 2 of 3 (or 3 of 5)
   - **Use hardware wallets** for signers

3. **Transfer Contract Ownership:**
   ```solidity
   // After deployment, transfer ownership to multi-sig
   contract.transferOwnership(multiSigAddress);
   ```

4. **Test Multi-Sig Operations:**
   - Test pause/unpause
   - Test upgrade proposals
   - Verify threshold requirements

---

### 4. Environment Security

#### Private Key Management:
```bash
# ❌ NEVER do this:
PRIVATE_KEY=0x1234...  # In .env file in repo

# ✅ DO THIS:
# Use hardware wallet for deployment
# Use environment variables from secure vault
# Use key management services (AWS Secrets Manager, etc.)
```

#### Environment Variables Checklist:
- [ ] Private keys stored securely (hardware wallet recommended)
- [ ] API keys stored in environment variables
- [ ] `.env` file in `.gitignore`
- [ ] Production secrets not in repository
- [ ] Use different keys for testnet/mainnet
- [ ] Rotate keys regularly

#### Secure Deployment Practices:
```bash
# Use hardware wallet for deployment
# Or use secure key management service
export PRIVATE_KEY=$(aws secretsmanager get-secret-value --secret-id deployment-key)

# Verify network before deployment
npx hardhat run scripts/deploy.cjs --network mainnet
```

---

### 5. Code Review Checklist

**Smart Contract Review:**
- [ ] No hardcoded addresses
- [ ] All functions have proper access control
- [ ] Events emitted for important actions
- [ ] Error messages are clear
- [ ] Gas optimization applied
- [ ] No unused code or functions

**Frontend Security:**
- [ ] No private keys in code
- [ ] API keys not exposed
- [ ] Input validation on all forms
- [ ] XSS protection (React handles this)
- [ ] Content Security Policy (CSP) headers
- [ ] Secure wallet connection (MetaMask)

**Backend Security:**
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive info
- [ ] SQL injection protection (if using SQL)

---

## Post-Deployment Security

### 1. Monitoring & Alerting

#### Smart Contract Monitoring:

**Set Up Event Monitoring:**
```typescript
// Monitor critical events
- Deposit events
- Pause events
- Upgrade events
- Large transactions (> threshold)
```

**Tools:**
- **Etherscan/Alchemy/Infura**: Event monitoring
- **OpenZeppelin Defender**: Automated monitoring
- **Tenderly**: Transaction monitoring
- **Custom Scripts**: Monitor contract balance

#### Alert Configuration:
- [ ] Contract balance drops below threshold
- [ ] Large deposits (> $10k)
- [ ] Contract paused
- [ ] Failed transactions spike
- [ ] Gas price spikes
- [ ] Unusual activity patterns

---

### 2. Incident Response Plan

**Emergency Procedures:**

1. **If Vulnerability Discovered:**
   ```bash
   # 1. Immediately pause contract
   contract.emergencyPause()
   
   # 2. Assess severity
   # 3. Notify team
   # 4. Fix vulnerability
   # 5. Test fix
   # 6. Upgrade contract
   # 7. Unpause
   ```

2. **If Funds at Risk:**
   - Pause contract immediately
   - Assess situation
   - Communicate with users (if safe)
   - Coordinate fix
   - Deploy fix
   - Re-open contract

3. **Contact List:**
   - Security team
   - Legal team
   - Communications team
   - Blockchain developers

---

### 3. Regular Security Practices

#### Weekly:
- [ ] Review contract balance
- [ ] Check for unusual transactions
- [ ] Review error logs
- [ ] Check monitoring alerts

#### Monthly:
- [ ] Security dependency updates
- [ ] Review access logs
- [ ] Audit access controls
- [ ] Review incident reports

#### Quarterly:
- [ ] Security audit review
- [ ] Penetration testing (optional)
- [ ] Disaster recovery drill
- [ ] Update security documentation

---

### 4. Security Headers Configuration

**Frontend Security Headers (Vercel/Netlify):**

Create `vercel.json` or `netlify.toml`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

---

## Domain Setup with Cloudflare

### Step 1: Purchase Domain

**Recommended Registrars:**
- Namecheap
- Google Domains
- Cloudflare Registrar (best integration)

**Choose Domain:**
- Short and memorable
- .com preferred (or .app, .finance)
- Avoid hyphens if possible

---

### Step 2: Add Domain to Cloudflare

1. **Sign up for Cloudflare** (free plan is sufficient)
   - Go to https://dash.cloudflare.com/
   - Click "Add a Site"
   - Enter your domain name

2. **Cloudflare scans your DNS records**
   - Review existing records
   - Cloudflare will import them

3. **Update Nameservers**
   - Cloudflare provides nameservers (e.g., `brad.ns.cloudflare.com`)
   - Go to your domain registrar
   - Replace nameservers with Cloudflare's
   - Wait for propagation (24-48 hours, usually faster)

---

### Step 3: Configure DNS Records

**For Vercel Deployment:**

1. **In Cloudflare Dashboard:**
   - Go to DNS → Records
   - Add records:

   ```
   Type: A
   Name: @
   Content: 76.76.21.21 (Vercel IP - check Vercel docs for current)
   Proxy: Proxied (orange cloud) ✅
   TTL: Auto
   ```

   ```
   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: Proxied ✅
   TTL: Auto
   ```

2. **In Vercel Dashboard:**
   - Go to Project → Settings → Domains
   - Add your domain: `yourdomain.com`
   - Add www domain: `www.yourdomain.com`
   - Vercel will verify DNS

**For Netlify Deployment:**

1. **In Netlify:**
   - Go to Site Settings → Domain Management
   - Add custom domain
   - Netlify provides DNS targets

2. **In Cloudflare:**
   ```
   Type: CNAME
   Name: @
   Content: your-site.netlify.app
   Proxy: Proxied ✅
   ```

   ```
   Type: CNAME
   Name: www
   Content: your-site.netlify.app
   Proxy: Proxied ✅
   ```

**For VPS Deployment:**

1. **In Cloudflare:**
   ```
   Type: A
   Name: @
   Content: YOUR_SERVER_IP
   Proxy: Proxied ✅ (or DNS only for direct IP)
   ```

   ```
   Type: A
   Name: www
   Content: YOUR_SERVER_IP
   Proxy: Proxied ✅
   ```

---

### Step 4: SSL/TLS Configuration

**Cloudflare SSL (Free):**

1. **In Cloudflare Dashboard:**
   - Go to SSL/TLS
   - Set encryption mode: **Full (strict)**
   - SSL/TLS encryption mode: **Flexible** (if not using Cloudflare on origin)
   - **Full (strict)** recommended (requires SSL on origin)

2. **Automatic HTTPS:**
   - Cloudflare automatically provides SSL
   - HTTPS Redirect: Enable "Always Use HTTPS"

---

### Step 5: Cloudflare Security Settings

**Recommended Settings:**

1. **Security Level:**
   - Set to "Medium" or "High"
   - Protects against DDoS

2. **Bot Fight Mode:**
   - Enable (free tier)
   - Protects against bots

3. **Browser Integrity Check:**
   - Enable
   - Validates browser headers

4. **Rate Limiting (Pro plan):**
   - Set up rate limits for API endpoints
   - Protect against abuse

5. **WAF Rules (Pro plan):**
   - Configure custom rules
   - Block suspicious requests

---

### Step 6: Performance Optimization

**Cloudflare Caching:**

1. **Page Rules (Free tier):**
   ```
   URL Pattern: yourdomain.com/static/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

2. **Caching Settings:**
   - Browser Cache TTL: 4 hours
   - Always Online: Enabled
   - Auto Minify: Enable (HTML, CSS, JS)

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions included
- Easy domain integration

**Deployment Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # From project root
   vercel
   
   # For production
   vercel --prod
   ```

4. **Configure Project:**
   - Vercel auto-detects framework (Vite)
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

5. **Add Domain:**
   ```bash
   vercel domains add yourdomain.com
   vercel domains add www.yourdomain.com
   ```

6. **Environment Variables:**
   - Go to Project → Settings → Environment Variables
   - Add production variables:
     ```
     VITE_CONTRACT_ADDRESS_MAINNET=0x...
     VITE_CONTRACT_ADDRESS_ARBITRUM=0x...
     ```

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

**Deployment Steps:**

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   # Build first
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

4. **Configure Site:**
   - Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

5. **Add Domain:**
   - Netlify Dashboard → Domain Settings
   - Add custom domain
   - Configure DNS in Cloudflare

---

### Option 3: VPS Deployment

**Requirements:**
- Ubuntu/Debian server
- Node.js 18+
- Nginx
- PM2 (for process management)

**Deployment Script:**

```bash
#!/bin/bash
# deploy-vps.sh

# 1. Install dependencies
sudo apt update
sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx

# 2. Clone repository
git clone https://github.com/yourusername/privacy-mixer.git
cd privacy-mixer

# 3. Install project dependencies
npm install

# 4. Build production
npm run build

# 5. Configure Nginx
sudo tee /etc/nginx/sites-available/privacy-mixer << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /path/to/privacy-mixer/dist;
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
    }
}
EOF

# 6. Enable site
sudo ln -s /etc/nginx/sites-available/privacy-mixer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Setup SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 8. Setup PM2 for backend
npm install -g pm2
pm2 start server/index.ts --name "privacy-mixer-api"
pm2 startup
pm2 save
```

---

## Arbitrum Deployment Setup

### Why Arbitrum?

- **90% lower gas fees** than Ethereum Mainnet
- **Faster transactions**
- **Ethereum security** (Layer 2 on Ethereum)
- **Growing ecosystem**

---

### Step 1: Environment Setup

**Update `.env` file:**

```env
# Arbitrum RPC URLs
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_KEY
ARBITRUM_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_INFURA_KEY

# Arbiscan API Key (for contract verification)
ARBISCAN_API_KEY=your_arbiscan_api_key

# Existing variables
PRIVATE_KEY=your_private_key_here
```

**Get RPC URLs:**
1. **Infura:** https://infura.io → Create project → Select Arbitrum
2. **Alchemy:** https://alchemy.com → Create app → Select Arbitrum

**Get Arbiscan API Key:**
1. Sign up at https://arbiscan.io
2. Go to API-KEYs section
3. Create new API key

---

### Step 2: Hardhat Configuration

**Update `hardhat.config.cjs`:**

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.22",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
    },
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    },
  },
};
```

---

### Step 3: Deploy to Arbitrum Sepolia (Testnet)

**Get Test ETH:**
- Arbitrum Sepolia Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Alchemy Faucet: https://www.alchemy.com/faucets/arbitrum-sepolia

**Deploy:**
```bash
npx hardhat run scripts/deploy.cjs --network arbitrumSepolia
```

**Verify Contracts:**
```bash
npx hardhat verify --network arbitrumSepolia <IMPLEMENTATION_ADDRESS>
npx hardhat verify --network arbitrumSepolia <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
```

**Update Frontend:**
```typescript
// client/src/lib/contracts.ts
export const CONTRACT_ADDRESSES = {
  sepolia: "0x...",
  mainnet: "",
  arbitrum: "",
  arbitrumSepolia: "0x...", // ← Add your address here
} as const;
```

---

### Step 4: Test on Arbitrum Sepolia

**MetaMask Setup:**
1. Open MetaMask
2. Add Network:
   - **Network Name:** Arbitrum Sepolia
   - **RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`
   - **Chain ID:** `421614`
   - **Currency Symbol:** `ETH`
   - **Block Explorer:** `https://sepolia.arbiscan.io`

3. Get test ETH from faucets
4. Test deposits and withdrawals

---

### Step 5: Deploy to Arbitrum One (Mainnet)

**⚠️ Prerequisites:**
- ✅ Tested thoroughly on Arbitrum Sepolia
- ✅ Security audit completed (recommended)
- ✅ Have ETH on Arbitrum (bridge from Mainnet)
- ✅ Gas fees ready (~0.01-0.1 ETH)

**Bridge ETH to Arbitrum:**
1. Official Bridge: https://bridge.arbitrum.io/
2. Connect wallet
3. Bridge ETH from Ethereum Mainnet
4. Wait ~10 minutes

**Deploy:**
```bash
npx hardhat run scripts/deploy.cjs --network arbitrum
```

**Verify Contracts:**
```bash
npx hardhat verify --network arbitrum <IMPLEMENTATION_ADDRESS>
npx hardhat verify --network arbitrum <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS> "0x"
```

**Update Frontend:**
```typescript
export const CONTRACT_ADDRESSES = {
  arbitrum: "0x...", // ← Add your Arbitrum One address
} as const;
```

**MetaMask Setup for Arbitrum One:**
- **Network Name:** Arbitrum One
- **RPC URL:** `https://arb1.arbitrum.io/rpc`
- **Chain ID:** `42161`
- **Currency Symbol:** `ETH`
- **Block Explorer:** `https://arbiscan.io`

---

### Step 6: Gas Cost Comparison

| Network | Deployment Cost | Deposit Gas | Withdrawal Gas |
|---------|----------------|-------------|----------------|
| Ethereum Mainnet | $200-500 | $10-30 | $5-15 |
| Arbitrum One | $2-5 | $0.20-0.50 | $0.10-0.30 |
| **Savings** | **~95%** | **~95%** | **~95%** |

---

## Quick Start Overview

### Complete Deployment Timeline

#### Week 1: Security & Testing
1. ✅ Complete security audit
2. ✅ Set up multi-sig wallet
3. ✅ Test on testnets (Sepolia + Arbitrum Sepolia)
4. ✅ Fix any issues found

#### Week 2: Smart Contract Deployment
1. ✅ Deploy to Arbitrum Sepolia (testnet)
2. ✅ Test thoroughly
3. ✅ Deploy to Arbitrum One (mainnet)
4. ✅ Verify contracts on Arbiscan
5. ✅ Deploy to Ethereum Mainnet (optional, for maximum compatibility)

#### Week 3: Frontend & Domain
1. ✅ Purchase domain
2. ✅ Set up Cloudflare
3. ✅ Deploy frontend to Vercel/Netlify
4. ✅ Configure domain DNS
5. ✅ Set up SSL/HTTPS
6. ✅ Configure security headers

#### Week 4: Monitoring & Launch
1. ✅ Set up monitoring (Etherscan, Alchemy, etc.)
2. ✅ Configure alerts
3. ✅ Final testing on production
4. ✅ Public launch

---

### Quick Command Reference

```bash
# Security Audit Preparation
npx hardhat test
npx hardhat coverage

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.cjs --network arbitrumSepolia

# Deploy to Arbitrum One
npx hardhat run scripts/deploy.cjs --network arbitrum

# Verify Contracts
npx hardhat verify --network arbitrum <ADDRESS>

# Frontend Deployment (Vercel)
vercel --prod
vercel domains add yourdomain.com

# Frontend Deployment (Netlify)
npm run build
netlify deploy --prod --dir=dist
```

---

### Cost Summary

**One-Time Costs:**
- Security Audit: $10,000 - $50,000 (recommended)
- Domain: $10-15/year
- Deployment Gas:
  - Arbitrum One: ~$2-5
  - Ethereum Mainnet: ~$200-500 (optional)

**Monthly Costs:**
- Hosting (Vercel/Netlify): $20-50/month
- RPC Provider: $0-200/month (free tier usually sufficient)
- Cloudflare: Free (or $20/month Pro)

**Total Monthly: $20-250/month**

---

### Security Checklist Summary

**Pre-Deployment:**
- [ ] Security audit completed
- [ ] All tests passing
- [ ] Multi-sig wallet set up
- [ ] Private keys secured
- [ ] Environment variables configured
- [ ] Code review completed

**Post-Deployment:**
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] SSL/HTTPS enabled
- [ ] Security headers configured
- [ ] Incident response plan ready
- [ ] Regular security reviews scheduled

---

## Resources

**Security:**
- OpenZeppelin Security: https://openzeppelin.com/security-audits/
- Trail of Bits: https://www.trailofbits.com/
- Smart Contract Best Practices: https://consensys.github.io/smart-contract-best-practices/

**Cloudflare:**
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Cloudflare Docs: https://developers.cloudflare.com/

**Arbitrum:**
- Arbitrum Docs: https://docs.arbitrum.io/
- Arbiscan: https://arbiscan.io/
- Arbitrum Bridge: https://bridge.arbitrum.io/

**Deployment:**
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com/

---

**🎉 You're now ready for secure, production deployment!**

Remember: Security is an ongoing process, not a one-time task. Regular reviews and updates are essential.


