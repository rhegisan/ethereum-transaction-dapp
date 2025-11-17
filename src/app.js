class TransactionDApp {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.contract = null;
        this.contractAddress = '0xfdF87E1567Bbe8387dE7fCF7058A82D49387eae5'; // Sepolia contract address
        this.currentAccount = null;
        
        this.init();
    }

    async init() {
        try {
            await this.initWeb3();
            await this.initContract();
            this.setupEventListeners();
            console.log('DApp initialized successfully');
        } catch (error) {
            console.error('Error initializing DApp:', error);
            this.showMessage('Error initializing application', 'error');
        }
    }

    // 1. WEB3 INITIALIZATION
    async initWeb3() {
        // Modern dapp browsers (MetaMask etc.)
        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            console.log('Using modern dapp browser');
        } 
        // Legacy dapp browsers
        else if (window.web3) {
            this.web3 = new Web3(window.web3.currentProvider);
            console.log('Using legacy dapp browser');
        } 
        // Fallback to Ganache
        else {
            this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
            console.log('Using Ganache local provider');
        }
    }

    // 2. CONTRACT INITIALIZATION - UPDATED
    async initContract() {
        try {
            // Try to load the actual ABI from the deployed contract JSON file
            const response = await fetch('/Transaction.json');
            const contractData = await response.json();
            const contractABI = contractData.abi;
            
            this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
            console.log('Contract initialized with deployed ABI from JSON file');
        } catch (error) {
            console.error('Error loading contract ABI from JSON file, using fallback ABI:', error);
            
            // Fallback to hardcoded ABI if the JSON file is not available
            const contractABI = [
                {
                    "inputs": [
                        {
                            "internalType": "address payable",
                            "name": "_to",
                            "type": "address"
                        }
                    ],
                    "name": "sendETH",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getContractBalance",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_user",
                            "type": "address"
                        }
                    ],
                    "name": "getTransactionCount",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_user",
                            "type": "address"
                        }
                    ],
                    "name": "getUserBalance",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "name": "Transfer",
                    "type": "event"
                }
            ];

            this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
            console.log('Contract initialized with fallback ABI');
        }
    }

    // 3. EVENT LISTENERS SETUP
    setupEventListeners() {
        // Connect MetaMask button
        document.getElementById('connectButton').addEventListener('click', () => {
            this.connectMetaMask();
        });

        // Send transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendTransaction();
        });

        // Refresh balances
        document.getElementById('refreshBalance').addEventListener('click', () => {
            this.loadBalances();
        });

        // Load transaction history
        document.getElementById('loadHistory').addEventListener('click', () => {
            this.loadTransactionHistory();
        });

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                this.accountsChanged(accounts);
            });

            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }
    }

    // 4. METAMASK CONNECTION
    async connectMetaMask() {
        try {
            if (!window.ethereum) {
                this.showMessage('Please install MetaMask!', 'error');
                return;
            }

            // Request account access
            this.accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            this.currentAccount = this.accounts[0];
            this.updateAccountInfo();
            await this.loadBalances();
            
            this.showMessage('MetaMask connected successfully!', 'success');
            console.log('Connected account:', this.currentAccount);
            
        } catch (error) {
            if (error.code === 4001) {
                this.showMessage('User rejected connection request', 'error');
            } else {
                console.error('Error connecting MetaMask:', error);
                this.showMessage('Error connecting to MetaMask', 'error');
            }
        }
    }

    // 5. ACCOUNT MANAGEMENT
    accountsChanged(accounts) {
        if (accounts.length === 0) {
            this.showMessage('Please connect to MetaMask', 'error');
        } else {
            this.currentAccount = accounts[0];
            this.updateAccountInfo();
            this.loadBalances();
        }
    }

    updateAccountInfo() {
        const accountInfo = document.getElementById('accountInfo');
        const networkInfo = document.getElementById('networkInfo');
        
        if (this.currentAccount) {
            const shortAddress = `${this.currentAccount.substring(0, 6)}...${this.currentAccount.substring(38)}`;
            accountInfo.innerHTML = `<span class="status-success">Connected: ${shortAddress}</span>`;
            
            // Get network info
            this.web3.eth.getChainId().then(chainId => {
                const networkName = this.getNetworkName(chainId);
                networkInfo.innerHTML = `Network: ${networkName} (Chain ID: ${chainId})`;
            });
        }
    }

    getNetworkName(chainId) {
        const networks = {
            1: 'Ethereum Mainnet',
            3: 'Ropsten Testnet',
            4: 'Rinkeby Testnet',
            5: 'Goerli Testnet',
            11155111: 'Sepolia Testnet',
            1337: 'Ganache Local',
            5777: 'Ganache'
        };
        return networks[chainId] || `Unknown Network (${chainId})`;
    }

    // 6. BALANCE MANAGEMENT
    async loadBalances() {
        if (!this.currentAccount || !this.contract) return;

        try {
            // Get user balance
            const userBalanceWei = await this.web3.eth.getBalance(this.currentAccount);
            const userBalanceETH = this.web3.utils.fromWei(userBalanceWei, 'ether');
            document.getElementById('userBalance').textContent = `${parseFloat(userBalanceETH).toFixed(4)} ETH`;

            // Get contract balance
            const contractBalanceWei = await this.contract.methods.getContractBalance().call();
            const contractBalanceETH = this.web3.utils.fromWei(contractBalanceWei, 'ether');
            document.getElementById('contractBalance').textContent = `${parseFloat(contractBalanceETH).toFixed(4)} ETH`;

        } catch (error) {
            console.error('Error loading balances:', error);
            this.showMessage('Error loading balances', 'error');
        }
    }

    // 7. TRANSACTION HANDLING
    async sendTransaction() {
        if (!this.currentAccount) {
            this.showMessage('Please connect MetaMask first', 'error');
            return;
        }

        const recipient = document.getElementById('recipient').value;
        const amountETH = document.getElementById('amount').value;

        // Validation
        if (!this.web3.utils.isAddress(recipient)) {
            this.showMessage('Invalid recipient address', 'error');
            return;
        }

        if (!amountETH || parseFloat(amountETH) <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }

        try {
            this.showMessage('Processing transaction...', 'pending');

            const amountWei = this.web3.utils.toWei(amountETH, 'ether');
            
            // Estimate gas
            const gasEstimate = await this.contract.methods.sendETH(recipient).estimateGas({
                from: this.currentAccount,
                value: amountWei
            });

            // Send transaction
            const transaction = await this.contract.methods.sendETH(recipient).send({
                from: this.currentAccount,
                value: amountWei,
                gas: gasEstimate
            });

            this.showMessage(`Transaction successful! Hash: ${transaction.transactionHash}`, 'success');
            console.log('Transaction details:', transaction);

            // Clear form
            document.getElementById('transactionForm').reset();
            
            // Update balances
            await this.loadBalances();
            
            // Reload transaction history
            await this.loadTransactionHistory();

        } catch (error) {
            console.error('Transaction error:', error);
            
            if (error.code === 4001) {
                this.showMessage('User rejected transaction', 'error');
            } else if (error.message.includes('insufficient funds')) {
                this.showMessage('Insufficient funds for transaction', 'error');
            } else {
                this.showMessage(`Transaction failed: ${error.message}`, 'error');
            }
        }
    }

    // 8. TRANSACTION HISTORY
    async loadTransactionHistory() {
        if (!this.currentAccount) {
            this.showMessage('Please connect MetaMask first', 'error');
            return;
        }

        try {
            // Get transaction count
            const txCount = await this.web3.eth.getTransactionCount(this.currentAccount, 'latest');
            
            const historyDiv = document.getElementById('transactionHistory');
            historyDiv.innerHTML = `<p>Total transactions from your account: ${txCount}</p>`;
            
            // Note: For full transaction history, you'd need to query the blockchain
            // or use a service like Etherscan API
            this.showMessage('Transaction count loaded', 'success');
            
        } catch (error) {
            console.error('Error loading transaction history:', error);
            this.showMessage('Error loading transaction history', 'error');
        }
    }

    // 9. UTILITY FUNCTIONS
    showMessage(message, type = 'info') {
        const statusDiv = document.getElementById('transactionStatus');
        statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
        
        // Auto-clear success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        }
    }
}

// Initialize the DApp when page loads
window.addEventListener('load', () => {
    window.transactionDApp = new TransactionDApp();
});