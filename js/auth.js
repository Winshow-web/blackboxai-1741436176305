// Utility Functions
const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
};

const hideError = (elementId) => {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.add('hidden');
};

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

// Authentication Functions
const signup = async (event) => {
    event.preventDefault();

    // Get form elements
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const terms = document.getElementById('terms').checked;

    // Reset previous error messages
    ['fullName', 'email', 'password', 'confirmPassword', 'role'].forEach(id => hideError(id + 'Error'));

    // Validate inputs
    let hasError = false;

    if (!fullName) {
        showError('fullNameError', 'Full name is required');
        hasError = true;
    }

    if (!email || !validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        hasError = true;
    }

    if (!validatePassword(password)) {
        showError('passwordError', 'Password must be at least 6 characters long');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    if (!role) {
        showError('roleError', 'Please select a role');
        hasError = true;
    }

    if (!terms) {
        alert('Please accept the terms and conditions');
        hasError = true;
    }

    if (hasError) return;

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === email)) {
        showError('emailError', 'Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        password, // In a real app, this should be hashed
        role
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message and redirect
    alert('Account created successfully! Please login.');
    window.location.href = 'index.html';
};

const login = async (event) => {
    event.preventDefault();

    // Get form elements
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Reset previous error messages
    ['email', 'password'].forEach(id => hideError(id + 'Error'));

    // Validate inputs
    let hasError = false;

    if (!email || !validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        hasError = true;
    }

    if (!password) {
        showError('passwordError', 'Password is required');
        hasError = true;
    }

    if (hasError) return;

    // Check credentials
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showError('emailError', 'Invalid email or password');
        return;
    }

    // Set session
    const session = {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    };
    localStorage.setItem('session', JSON.stringify(session));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
};

const logout = () => {
    localStorage.removeItem('session');
    window.location.href = 'index.html';
};

const checkAuth = () => {
    const session = JSON.parse(localStorage.getItem('session'));
    const currentPage = window.location.pathname;

    if (!session && currentPage.includes('dashboard.html')) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }

    if (session && currentPage.includes('dashboard.html')) {
        // Update dashboard UI
        document.getElementById('userFullName').textContent = session.fullName;
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${session.fullName}!`;

        // Set role badge
        const roleBadge = document.getElementById('userRole');
        roleBadge.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1);
        roleBadge.classList.add(session.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100');
        roleBadge.classList.add(session.role === 'admin' ? 'text-purple-800' : 'text-blue-800');

        // Show/hide role-specific content
        const adminContent = document.getElementById('adminContent');
        if (session.role === 'admin') {
            adminContent.classList.remove('hidden');
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', signup);
    }

    // Check authentication status
    checkAuth();
});
