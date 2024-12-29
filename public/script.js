// Register user
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const messageContainer = document.getElementById('message');
        messageContainer.textContent = '';

        // Check if passwords match
        if (password !== confirmPassword) {
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Passwords do not match!';
            errorMessage.style.color = 'red';
            messageContainer.appendChild(errorMessage);
            return;
        }

        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        messageContainer.textContent = result.message;

        if (response.ok) {
            const successMessage = document.createElement('p');
            successMessage.textContent = 'Registered successfully!';
            successMessage.style.color = 'green';
            messageContainer.appendChild(successMessage);

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    });
}

// Toggle password visibility and change icon
function togglePassword(fieldId, icon) {
    const passwordField = document.getElementById(fieldId);
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.textContent = '👁️'; // Closed eye icon
    } else {
        passwordField.type = 'password';
        icon.textContent = '🙈'; // Open eye icon
    }
}



// Login user
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        document.getElementById('message').textContent = result.message;
        if (response.ok) {
            localStorage.setItem('token', result.token); // Store token
            window.location.href = 'dashboard.html'; // Redirect to dashboard after login
        }
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.addEventListener('click', () => {
        const passwordField = document.getElementById('loginPassword');
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            togglePassword.textContent = '👁️'; // Open eye icon
        } else {
            passwordField.type = 'password';
            togglePassword.textContent = '🙈'; // Closed eye icon
        }
    });
}



// Get balance on dashboard
if (document.getElementById('balance')) {
    (async () => {
        const response = await fetch('/api/users/balance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('balance').textContent = `Your balance: $${result.balance}`;
        } else {
            document.getElementById('balance').textContent = 'Error fetching balance';
        }
    })();
}

// Fetch transaction history
// Fetch transaction history
async function fetchTransactionHistory() {
    const response = await fetch('/api/users/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const result = await response.json();
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';  // Clear loading text

    if (response.ok) {
        result.transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.textContent = `${transaction.description}: $${transaction.amount}`;
            transactionList.appendChild(transactionItem);
        });
    } else {
        transactionList.textContent = 'Failed to load transactions';
    }
}

fetchTransactionHistory();


// Show deposit input
if (document.getElementById('depositBtn')) {
    document.getElementById('depositBtn').addEventListener('click', () => {
        document.getElementById('transactionHistory').style.display = 'none'; // Hide transaction history
        document.getElementById('withdrawInput').style.display = 'none'; // Hide withdraw input
        document.getElementById('depositInput').style.display = 'block'; // Show deposit input
    });
}

// Show withdraw input
if (document.getElementById('withdrawBtn')) {
    document.getElementById('withdrawBtn').addEventListener('click', () => {
        document.getElementById('transactionHistory').style.display = 'none'; // Hide transaction history
        document.getElementById('depositInput').style.display = 'none'; // Hide deposit input
        document.getElementById('withdrawInput').style.display = 'block'; // Show withdraw input
    });
}

// Logout user
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token'); // Clear token
        window.location.href = 'login.html'; // Redirect to login
    });
}

// Deposit funds
if (document.getElementById('submitDeposit')) {
    document.getElementById('submitDeposit').addEventListener('click', async () => {
        const amount = document.getElementById('depositAmount').value;
        const token = localStorage.getItem('token');

        const response = await fetch('/api/users/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: parseFloat(amount) }),
        });

        const result = await response.json();
        document.getElementById('depositMessage').textContent = result.message;
        if (response.ok) {
            document.getElementById('balance').textContent = `Your balance: $${result.balance}`; // Update balance
        }
    });
}

// Withdraw funds
if (document.getElementById('submitWithdraw')) {
    document.getElementById('submitWithdraw').addEventListener('click', async () => {
        const amount = document.getElementById('withdrawAmount').value;
        const token = localStorage.getItem('token');

        const response = await fetch('/api/users/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: parseFloat(amount) }),
        });

        const result = await response.json();
        document.getElementById('withdrawMessage').textContent = result.message;
        if (response.ok) {
            document.getElementById('balance').textContent = `Your balance: $${result.balance}`; // Update balance
        }
    });
}
// Transfer funds
// Transfer funds functionality on transfer.html
if (document.getElementById('submitTransfer')) {
    document.getElementById('submitTransfer').addEventListener('click', async () => {
        const recipientUsername = document.getElementById('recipientUsername').value;
        const amount = document.getElementById('transferAmount').value;
        const token = localStorage.getItem('token');

        const response = await fetch('/api/users/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ recipientUsername, amount: parseFloat(amount) }),
        });

        const result = await response.json();
        document.getElementById('transferMessage').textContent = result.message;

        if (response.ok) {
            // Optionally redirect back to dashboard after successful transfer
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // Redirect back to dashboard
            }, 2000); // Redirect after 2 seconds
        }
    });
}

// Back to Dashboard functionality
if (document.getElementById('backToDashboard')) {
    document.getElementById('backToDashboard').addEventListener('click', () => {
        window.location.href = 'dashboard.html'; // Redirect to dashboard
    });
}
// Dashboard balance check with alert
if (document.getElementById('balance')) {
    (async () => {
        const response = await fetch('/api/users/balance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('balance').textContent = `Your balance: $${result.balance}`;
            if (result.lowBalanceAlert) {
                alert(result.lowBalanceAlert);  // Show one-time alert if balance is low
            }
        } else {
            document.getElementById('balance').textContent = 'Error fetching balance';
        }
    })();
}
// Toggle loan form visibility
// Toggle the loan form
function toggleLoanForm() {
    const loanForm = document.getElementById('loanForm');
    loanForm.style.display = loanForm.style.display === 'none' ? 'block' : 'none';
}

// Fetch balance and check if low
async function fetchBalance() {
    try {
        const response = await fetch('/api/checkLowBalance'); // Ensure this route matches your backend
        const data = await response.json();
        document.getElementById('balance').innerText = `Balance: $${data.balance}`;

        // Display low balance alert if balance is below 50
        if (data.lowBalance) {
            document.getElementById('lowBalanceAlert').style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}


// Submit loan application
document.getElementById('loanApplicationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const loanStatus = document.getElementById('loanStatus');
    loanStatus.innerText = 'Loan under process...';

    setTimeout(() => {
        loanStatus.innerText = 'Loan Approved!';
    }, 120000); // 2 minutes in milliseconds
});

// Initialize balance check on page load
window.onload = fetchBalance;

