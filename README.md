# 🔍 ZoraLens

**ZoraLens** is a powerfull explorer app for Zora Coins. It helps traders and creators get a tabular and visualized data for the top performing coins.

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

### 🌐 Social + Local UX
- One-input login to load portfolios
- LocalStorage-based user state for autologin
- Mobile-first responsive UI
//- Gamified styles with animated interactions

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

2. Install dependencies

`npm install`

3. Add environment vars
```bash
# Rename file
mv .env.example .env
```

Visit []() and create an API key then add it to the .env file var `VITE_ZORA_API_KEY`

4. Run the dev server

`npm run dev`

App will be running at `http://localhost:5173`

🌐 Live Demo

> [ZoraLens]()

📄 License

MIT License. Free to fork, remix, and contribute!

💡 Contributing

Pull requests are welcome!