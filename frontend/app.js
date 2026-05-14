const API_BASE = "http://127.0.0.1:8000/api/auth";

// --- UI STATE ---
function toggleView(view) {
    const regView = document.getElementById('register-view');
    const logView = document.getElementById('login-view');
    const dashView = document.getElementById('dashboard-view');

    regView.classList.add('hidden');
    logView.classList.add('hidden');
    dashView.classList.add('hidden');

    if (view === 'register') regView.classList.remove('hidden');
    if (view === 'login') logView.classList.remove('hidden');
    if (view === 'dashboard') dashView.classList.remove('hidden');
}

function showNotif(msg, isError = false) {
    const n = document.createElement('div');
    n.className = 'notif';
    if (isError) n.style.borderColor = '#fb7185';
    n.innerText = msg;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 400);
    }, 2500);
}

// --- CORE ACTIONS ---

async function register() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!email || !password) return showNotif("All fields required", true);

    try {
        const r = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const d = await r.json();
        
        if (r.ok) {
            showNotif("Identity Created Successfully!");
            // Auto-fill login email for convenience
            document.getElementById('log-email').value = email;
            setTimeout(() => toggleView('login'), 800);
        } else {
            showNotif(d.detail || "Registration Failed", true);
        }
    } catch (e) {
        showNotif("Security Engine Offline", true);
    }
}

async function login() {
    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;

    try {
        const r = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const d = await r.json();
        
        if (r.ok) {
            localStorage.setItem("token", d.access_token);
            showNotif("Authentication Verified");
            loadProfile();
        } else {
            showNotif(d.detail || "Invalid Credentials", true);
        }
    } catch (e) {
        showNotif("Security Engine Offline", true);
    }
}

async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) return toggleView('register');

    try {
        const r = await fetch(`${API_BASE}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await r.json();
        
        if (r.ok) {
            document.getElementById('dash-email').innerText = d.email;
            document.getElementById('dash-id').innerText = d.id;
            document.getElementById('dash-date').innerText = new Date(d.created_at).toLocaleDateString();
            toggleView('dashboard');
        } else {
            localStorage.removeItem("token");
            toggleView('login');
        }
    } catch (e) {
        showNotif("Session Sync Failed", true);
    }
}

async function logout() {
    const token = localStorage.getItem("token");
    try {
        await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (e) {}

    localStorage.removeItem("token");
    showNotif("Session Revoked Successfully");
    toggleView('register');
}

// --- INIT ---
document.getElementById('reg-btn').addEventListener('click', register);
document.getElementById('log-btn').addEventListener('click', login);
document.getElementById('out-btn').addEventListener('click', logout);

// Start with Register as requested
if (localStorage.getItem("token")) {
    loadProfile();
} else {
    toggleView('register');
}
