# Siyakhula
This is the big one. 

# Siyakhula:  Blockchain Insurance Guarantee System 

*This is essentially the greatest Asset Management Management Platform and System to exist

# Video Link:
https://drive.google.com/drive/folders/1iVKQGpA6n8zp35e0fZGExfOvCD6-XQ2v?usp=sharing


## Overview
Siyakhula is a permissioned blockchain inspired parametric guarantee platform that demonstrates how blockchain technology can reduce investor risk in African startup and SME ecosystems. (using insurance).

Instead of waiting weeks for traditional insurance claims, Siyakhula executes predefined payouts automatically once trigger conditions are met. You get coverage from a premium pool that is filled by user policy acceptance, so they pay the policy premium, and once they pay the policy premium the funds go into the premium pool. The pool then acts like a two fold output system. it issues coverage, whilst being used as an investment fund redamable and useable by the insurer. 

There are 3 roles on the webapp:
- **Administrators** to create parametric insurance policies (currency devaluation, regulatory bans, civil unrest).
- **Investors** to purchase coverage for their investments using a stablecoin (RWFC).
- **Insurers** to trigger automated payouts when predefined events occur, transferring funds from a premium pool to the investor.

All logic is executed via **Solidity smart contracts** , with a **React** frontend and a lightweight **Node.js/Express** backend for authentication with a **SQLite** database.

## Current Features

-  **Smart Contracts** – PolicyRegistry, PremiumPool, TriggerOracle (with role‑based access)
- **Admin Dashboard** – Create policies, view pool liquidity and total premiums
-  **Investor Dashboard** – View available policies, purchase coverage (with ERC‑20 approval with OUR OWN RWFC MADE TOKEN)
-  **Insurer Dashboard** – Monitor issued policies and trigger payouts (coverage amount)
--  **Role‑Based Authentication** – Separate views for Admin, Investor, and Insurer
- **Oracle** - Oracle emulation.

**Elaboration on Features Per Role:**
### Administrator
- User authentication
- Create insurance policies
- Configure:
  - coverage amount
  - premium
  - trigger threshold
  - trigger type
- Mint RWFC testing tokens
- Monitor liquidity pool
- Oracle controls
- View notifications

### Investor
- Secure login
- MetaMask wallet connection
- View assigned policies
- Purchase insurance coverage
- View premium history
- View payout history
- Track active coverage
- View RWFC balance
- View Sepolia balance

### Insurer
- Secure dashboard
- Monitor policies
- Execute trigger events
- Trigger automated payouts
- View payment history

# Oracle Parametric Trigger Types
The MVP currently emulates these three insurance events:
- Currency Devaluation
- Regulatory Ban
- Civil Unrest

##  Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Ethers.js

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- PostgreSQL (Neon)

### Blockchain

- Solidity 0.8.x
- Hardhat
- OpenZeppelin
- Ethereum Sepolia Testnet

##### Smart Contracts
PolicyRegistry:
- Policy creation
- Policy storage
- Investor purchases
- Policy management

#### PremiumPool
- Holding premiums
- Reserve management
- Payout execution

#### TriggerOracle
- Monitoring trigger events
- Authorising payouts
- Interacting with PremiumPool

#### MockRWFC
- ERC-20 stablecoin used for testing policy purchases.

# Live Deployment
## Prerequisites outside (Specified Modules):

- **Node.js** (v18 or later) and npm
- **MetaMask** browser extension
- **Git** (for cloning)


## Installation & Setup
This will all be ran locally.

## 1. Clone the repository
```USE bash ```
cd siyakhula


## 2. Installation & Setup
cd blockchain
npm install

#Backend API
cd ../backend
npm install

#Frontend React
cd ../frontend
npm install

## 3.Live Deployment Platforms

### Frontend
> https://<your-vercel-url>

### Backend API
> https://<your-railway-url>

### Smart Contracts
Deployed on Ethereum Sepolia Testnet.



## 3. THE FOUNDATIONAL ENGINE SETUP (NOTE 6 and 7 for local running)

When starting softare (on local host):
1. Blockchain folder first: npx hardhat node
2. Recompile contracts in blockchain folder: npx hardhat compile
3. Then deploy them in blockchain folder: npx hardhat run scripts/deploy.js --network localhost
4. By replacing backend and frontend .env files
5. Redeploy local hardhat files into ABI frontend folder.(Blockchain basics)
6. Go into backend folder and: npm run dev
7. Go into frontend folder and: npm run dev

## 4. CONFIGURING ENVIRONEMENT VARIABLES IS VERY IMPORTANT

### Frontend .env (P.s: Put this in Vercel EXACTLY like this)
VITE_API_URL=http://localhost:5000
VITE_MOCK_RWFC=<deployed-address>
VITE_PREMIUM_POOL=<deployed-address>
VITE_POLICY_REGISTRY=<deployed-address>
VITE_TRIGGER_ORACLE=<deployed-address>

### Backend .env (P.s: Put the keys and names in railway EXACTLY like this)
PORT=5000
JWT_SECRET=<your-secret> (P.S you can randomly generate this).
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=<hardhat-account-private-key>
MOCK_RWFC_ADDRESS=<deployed-address>
PREMIUM_POOL_ADDRESS=<deployed-address>
POLICY_REGISTRY_ADDRESS=<deployed-address>
TRIGGER_ORACLE_ADDRESS=<deployed-address>

```NOTE: You can only  add these addresses locally too not just on Vercel or railway. Why? Keeps things in unison. Also helps incase you want to switch to local deployment.```

# After Deployment
## Performance Highlights
- Automated payouts executed successfully
- Role based authentication
- Full blockchain transaction history
- Immutable policy records
- Gas costs remained within reasonable Decentralized Exchange level target (150K - 200K)
- Transparent premium pool auditability

## Current Limitations
The MVP intentionally excludes:
- Live insurer integrations (need certifications to enact)
- Real oracle providers (need to create them from scratch...fortunately)
- Real RWFC Stablecoin (not real yet unfortunately)
- Mainnet deployment (we broke)

The platform is essentially a validated SYSTEM type that is REPRESENTED through the platform. (using insurnace to mitigate risk for greater investment).

# Future Work
- Chainlink Oracle integration
- Live financial data feeds from a Decentralised Oracle Network
- Licensed insurer partnershipsto enable live insurer data feeding
- REAL RWFC (when that comes out)
- Blockchain switched to Hedera Hasnode OR an entirely investment ready and scalable Decentralised Network made specifcially for emerging market use cases.


# License
This project was developed for academic research and educational purposes. Commercial use requires permission from the author(ME!!!).

# Author
**Sipho Chakhala**

African Leadership University

2026