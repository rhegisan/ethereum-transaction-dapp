// test/simple-connection.js
require('dotenv').config();

async function simpleTest() {
    try {
        console.log('🔧 Testing basic setup...');
        
        // Check environment variables
        console.log('ALCHEMY_API_KEY loaded:', !!process.env.ALCHEMY_API_KEY);
        console.log('MNEMONIC loaded:', !!process.env.MNEMONIC);
        
        if (!process.env.ALCHEMY_API_KEY) {
            throw new Error('ALCHEMY_API_KEY not found in .env');
        }
        if (!process.env.MNEMONIC) {
            throw new Error('MNEMONIC not found in .env');
        }
        
        console.log('✅ Environment variables OK');
        
        // Test HDWalletProvider directly
        const HDWalletProvider = require('@truffle/hdwallet-provider');
        console.log('🔗 Creating HDWalletProvider...');
        
        const provider = new HDWalletProvider(
            process.env.MNEMONIC,
            `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        );
        
        console.log('✅ HDWalletProvider created');
        
        const accounts = await provider.getAddresses();
        console.log('📬 Your Sepolia address:', accounts[0]);
        
        console.log('💰 Use this address to get test ETH from: https://faucets.chain.link/sepolia');
        
        provider.engine.stop();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('🔍 Error details:', error);
    }
}

simpleTest();