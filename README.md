# ZoraLens

**ZoraLens** is a powerful explorer app for Zora ecosystem. It provides traders and creators with clear, tabular, and visual data on top-performing coins, making it easy to analyze and compare market trends. It's the CoinGecko of Zora!.

## 💡 Inspiration
We wanted a single dashboard to track trending coins, spot new opportunities, and make informed decisions quickly. ZoraLens was built to fill this gap and empower the Zora community with actionable insights.

## 🚀 Features

### 🧭 Explore Coins
- Filter coins by: Top Gainers, High Volume, Most Valuable, New Coins
- View sortable tables and visual charts

### 📊 Portfolio Viewer
- Check the portfolio of any user by username
- Displays holdings, value, price, and 24h change
- Deep link to Zora Coin pages

### ⚖️ Coin Comparison
- Compare up to 5 coins side-by-side
- View attributes: price, market cap, holders, etc.
- Visual charts: Market Cap, Holders, 24h Change
- Quick access to Zora links

### 🌐 UX
- LocalStorage-based user state for autologin
- Responsive UI

## 📡 Data Source: Zora SDK (v4)

ZoraLens leverages the powerful **Zora SDK v4** to fetch and present real-time, on-chain coin data. The SDK allows for seamless access to Zora’s open minting and trading infrastructure.

We use the SDK for the following key data queries:

- Top Movers & other Categories
- Individual Coin Metadata
- User Account
- User Coin Balances

## 💻 Tech Stack

- **Vite + React + TypeScript**
- **TailwindCSS + ShadCN UI**
- **Zora Coin SDK** for on-chain data
- **Recharts** for visual charts
- **Sonner** for toasts

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/AbdulrazaqAS/zoralens.git
cd zoralens
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add environment vars
```bash
# Rename file
mv .env.example .env
```

Visit [Zora Developers](https://zora.co/settings/developer) and create an API key then add it to the .env file var `VITE_ZORA_API_KEY`

### 4. Run the dev server
```bash
npm run dev
```

App will be running at `http://localhost:5173`

## 🌐 Live Demo
> [ZoraLens](https://rememe.vercel.app/)

## 📄 License
MIT License. Free to fork, remix, and contribute!