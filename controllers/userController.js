const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'User exists' });
    }
};

// Login a user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's balance
const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('balance');
        res.json({ balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Transfer funds
const transferFunds = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { amount, recipientUsername } = req.body;

        const recipient = await User.findOne({ username: recipientUsername });
        if (!recipient) return res.status(400).json({ message: 'Recipient not found' });
        
        if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

        user.balance -= amount;
        recipient.balance += amount;
        user.transactions.push({ description: `Transfer to ${recipientUsername}`, amount: -amount });
        recipient.transactions.push({ description: `Transfer from ${user.username}`, amount });
        await user.save();
        await recipient.save();

        res.json({ message: 'Transfer successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's transaction history
const getTransactions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('transactions');
        res.json({ transactions: user.transactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Deposit funds
const depositFunds = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { amount } = req.body;

        if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

        user.balance += amount;
        user.transactions.push({ description: 'Deposit', amount });
        await user.save();
        res.json({ message: 'Deposit successful', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Withdraw funds
const withdrawFunds = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { amount } = req.body;

        if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
        if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

        user.balance -= amount;
        user.transactions.push({ description: 'Withdraw', amount: -amount });
        await user.save();
        res.json({ message: 'Withdrawal successful', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
// Get user's balance with low balance check
const checkLowBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const lowBalance = user.balance < 50;
        res.json({ balance: user.balance, lowBalance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const applyLoan = async (req, res) => {
    try {
        const { loanAmount, loanPurpose, loanTerm, employmentDetails, annualIncome } = req.body;
        const { idProof, incomeStatement } = req.files; // Assuming file upload is handled in your middleware

        // Check that all required fields are filled
        if (!loanAmount || !loanPurpose || !loanTerm || !employmentDetails || !annualIncome || !idProof || !incomeStatement) {
            return res.status(400).json({ message: 'All fields and documents are required' });
        }

        // Save loan application in the database
        const loanApplication = {
            userId: req.user.id,
            loanAmount,
            loanPurpose,
            loanTerm,
            employmentDetails,
            annualIncome,
            documents: { idProof, incomeStatement },
            status: 'Loan under process'
        };

        await Loan.create(loanApplication); // Assuming you have a Loan model for storing applications

        // Send initial response
        res.json({ message: 'Loan application submitted successfully', status: 'Loan under process' });

        // Update status to "Approved" after 2 minutes if all fields are filled
        setTimeout(async () => {
            loanApplication.status = 'Approved';
            await Loan.findByIdAndUpdate(loanApplication._id, loanApplication);
        }, 120000); // 2 minutes in milliseconds

    } catch (error) {
        res.status(500).json({ message: 'Error submitting loan application' });
    }
};



// Export all functions
module.exports = {
    registerUser,
    loginUser,
    getBalance,
    transferFunds,
    getTransactions,
    depositFunds,     // Added depositFunds
    withdrawFunds,    // Added withdrawFunds
    checkLowBalance,
    applyLoan
};
