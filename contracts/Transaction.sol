// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleTransaction
 * @dev Allows ETH transfers and tracks transaction history
 */
contract SimpleTransaction {
    // Events for tracking transactions
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );
    
    // Store transaction count per user
    mapping(address => uint256) public transactionCount;
    
    // Struct to represent a transaction
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }
    
    // Store all transactions per user
    mapping(address => Transaction[]) public transactionHistory;
    
    /**
     * @dev Send ETH to another address
     * @param _to Recipient address
     */
    function sendETH(address payable _to) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot send to yourself");
        
        // Transfer ETH
        (bool success, ) = _to.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        // Update transaction count
        transactionCount[msg.sender]++;
        transactionCount[_to]++;
        
        // Add to transaction history
        transactionHistory[msg.sender].push(Transaction({
            sender: msg.sender,
            receiver: _to,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        transactionHistory[_to].push(Transaction({
            sender: msg.sender,
            receiver: _to,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        // Emit event
        emit Transfer(msg.sender, _to, msg.value, block.timestamp);
    }
    
    /**
     * @dev Get user's transaction count
     * @param _user User address
     * @return count Number of transactions
     */
    function getTransactionCount(address _user) public view returns (uint256) {
        return transactionCount[_user];
    }
    
    /**
     * @dev Get user's transaction history
     * @param _user User address
     * @return Array of transactions
     */
    function getTransactionHistory(address _user) 
        public 
        view 
        returns (Transaction[] memory) 
    {
        return transactionHistory[_user];
    }
    
    /**
     * @dev Get contract balance
     * @return Contract's ETH balance
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get user's balance
     * @param _user User address
     * @return User's ETH balance
     */
    function getUserBalance(address _user) public view returns (uint256) {
        return _user.balance;
    }
}
