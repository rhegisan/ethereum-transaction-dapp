require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    sepolia: {
      provider: () => {
        if (!process.env.MNEMONIC || !process.env.ALCHEMY_API_KEY) {
          throw new Error('Missing MNEMONIC or ALCHEMY_API_KEY in .env file');
        }
        
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        );
      },
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 20000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",
    }
  }
};