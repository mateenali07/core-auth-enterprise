const API_BASE = "http://127.0.0.1:8000/api/auth";

// --- STATE MANAGEMENT ---
let accessToken = localStorage.getItem("access_token");

// --- UI UTILS ---
function toggleAuth(mode) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const dashboard = document.getElementById('dashboard');

    if (mode === 'register') {
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
        dashboard.classList.add('hidden');
    } else if (mode === 'login') {
        loginCard.classList.remove('hidden');
        registerCard.classList.add('hidden');
        dashboard.classList.add('hidden');
    } else if (mode === 'dashboard') {
        loginCard.classList.add('hidden');
        registerCard.classList.add('hidden');
        dashboard.classList.remove('hidden');
    }
}

function notify(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `notification ${type === 'success' ? 'badge-active' : 'logout-btn'}`;
    div.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)';
    div.style.color = 'white';
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.padding = '12px 24px';
    div.style.borderRadius = '8px';
    div.style.zIndex = '1000';
    div.innerText = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// --- API ACTIONS ---

async function handleRegister() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const resp = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        
        if (resp.ok) {
            notify("Identity Created! Please login.");
            toggleAuth('login');
        } else {
            notify(data.detail || "Registration failed", 'error');
        }
    } catch (err) {
        notify("Backend unavailable", 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const resp = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        
        if (resp.ok) {
            accessToken = data.access_token;
            localStorage.setItem("access_token", accessToken);
            notify("Secure Login Successful");
            loadProfile();
        } else {
            notify(data.detail || "Login failed", 'error');
        }
    } catch (err) {
        notify("Backend unavailable", 'error');
    }
}

async function loadProfile() {
    if (!accessToken) return toggleAuth('login');

    try {
        const resp = await fetch(`${API_BASE}/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await resp.json();
        
        if (resp.ok) {
            document.getElementById('user-email').innerText = data.email;
            document.getElementById('user-id').innerText = data.id;
            document.getElementById('user-created').innerText = new Date(data.created_at).toLocaleString();
            toggleAuth('dashboard');
        } else {
            localStorage.removeItem("access_token");
            toggleAuth('login');
        }
    } catch (err) {
        notify("Profile sync failed", 'error');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    } catch (e) {}

    localStorage.removeItem("access_token");
    accessToken = null;
    notify("Session Revoked Instantly");
    toggleAuth('login');
}

// --- EVENT LISTENERS ---
document.getElementById('register-btn').addEventListener('click', handleRegister);
document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// --- INITIAL LOAD ---
if (accessToken) {
    loadProfile();
} else {
    toggleAuth('login');
}
