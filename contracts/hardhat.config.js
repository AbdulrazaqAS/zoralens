require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

const { WALLET_PRIVATE_KEY, ALCHEMY_BASE_RPC_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      url: ALCHEMY_BASE_RPC_URL,
      accounts: [WALLET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};
