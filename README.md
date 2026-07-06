# Siyakhula
This is the big one. 

# Siyakhula – Blockchain Insurance Guarantee Platform 

*This is essentially the greatest Capital Management Platform to exist

# Video Link:
https://drive.google.com/drive/folders/14At8pcpP0sW0qRIdio9UO33zfrDpx2mr?usp=sharing 

## Overview

Siyakhula is in its **Minimum Viable Product (MVP)** phase it demonstrates how blockchain parametric insurance can de‑risk early‑stage investments in Africa.

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
- **Local Testnet** – Fully functional on Hardhat’s local blockchain (no real funds)


##  Stack

 **Blockchain:**  Hardhat, Solidity (0.8.24), Ethers.js
 **Frontend:** React 19, Vite, Tailwind CSS, React Router
 **Backend:** Node.js, Express, SQLite (for user data)


## Prerequisites outside Modules

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

## 5. ROAR THE FOUNDATIONAL ENGINE

When starting softare (on local host):
1. Blockchain folder first: npx hardhat node
2. Recompile contracts in blockchain folder: npx hardhat compile
3. Then deploy them in blockchain folder: npx hardhat run scripts/deploy.js --network localhost
4. By replacing backend and frontend .env files
5. Redeploy local hardhat files into ABI frontend folder.(Blockchain basics)
6. Go into backend folder and: npm run dev
7. Go into frontend folder and: npm run dev

```NOTE: Before steps 6 and 7, 3,4 and 5 are an Absilute requirement.```

## 4. CONFIGURING ENVIRONEMENT VARIABLES IS VERY IMPORTANT

### Frontend .env
VITE_API_URL=http://localhost:5000
VITE_MOCK_RWFC=<deployed-address>
VITE_PREMIUM_POOL=<deployed-address>
VITE_POLICY_REGISTRY=<deployed-address>
VITE_TRIGGER_ORACLE=<deployed-address>

### Backend .env
PORT=5000
JWT_SECRET=<your-secret> (P.S you can randomly generate this).
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=<hardhat-account-private-key>
MOCK_RWFC_ADDRESS=<deployed-address>
PREMIUM_POOL_ADDRESS=<deployed-address>
POLICY_REGISTRY_ADDRESS=<deployed-address>
TRIGGER_ORACLE_ADDRESS=<deployed-address>

```NOTE: You can only  add these addresses AFTER you fully set up the local network```