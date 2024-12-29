const express = require('express');
const { 
    registerUser, 
    loginUser, 
    getBalance, 
    transferFunds, 
    getTransactions, 
    depositFunds, 
    withdrawFunds 
} = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// User registration
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// Get user balance
router.get('/balance', authenticate, getBalance);

// Get transaction history
router.get('/transactions', authenticate, getTransactions);

// Deposit funds
router.post('/deposit', authenticate, depositFunds);

// Withdraw funds
router.post('/withdraw', authenticate, withdrawFunds);

// Transfer funds
router.post('/transfer', authenticate, transferFunds);
module.exports = router;
