const API_BASE = "http://127.0.0.1:8000/api/auth";

// ===============================
// UI STATE
// ===============================

function toggleView(view) {
    const regView = document.getElementById('register-view');
    const logView = document.getElementById('login-view');
    const dashView = document.getElementById('dashboard-view');
    const adminView = document.getElementById('admin-view');

    regView.classList.add('hidden');
    logView.classList.add('hidden');
    dashView.classList.add('hidden');
    adminView.classList.add('hidden');

    if (view === 'register') regView.classList.remove('hidden');
    if (view === 'login') logView.classList.remove('hidden');
    if (view === 'dashboard') dashView.classList.remove('hidden');

    if (view === 'admin') {
        adminView.classList.remove('hidden');
        loadUsers();
    }
}

// ===============================
// NOTIFICATIONS
// ===============================

function showNotif(msg, isError = false) {
    const n = document.createElement('div');

    n.className = 'notif';

    if (isError) {
        n.style.borderColor = '#fb7185';
    }

    n.innerText = msg;

    document.body.appendChild(n);

    setTimeout(() => {
        n.style.opacity = '0';

        setTimeout(() => {
            n.remove();
        }, 400);

    }, 2500);
}

// ===============================
// REGISTER
// ===============================

async function register() {

    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!email || !password) {
        return showNotif("All fields required", true);
    }

    try {

        const r = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const d = await r.json();

        if (r.ok) {

            showNotif("Identity Created Successfully!");

            document.getElementById('log-email').value = email;

            setTimeout(() => {
                toggleView('login');
            }, 800);

        } else {

            showNotif(d.detail || "Registration Failed", true);
        }

    } catch (e) {

        showNotif("Security Engine Offline", true);
    }
}

// ===============================
// LOGIN
// ===============================

async function login() {

    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;

    if (!email || !password) {
        return showNotif("Credentials Required", true);
    }

    try {

        const r = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
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

// ===============================
// LOAD PROFILE
// ===============================

async function loadProfile() {

    const token = localStorage.getItem("token");

    if (!token) {
        return toggleView('register');
    }

    try {

        const r = await fetch(`${API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const d = await r.json();

        if (r.ok) {

            document.getElementById('dash-email').innerText = d.email;
            document.getElementById('dash-id').innerText = d.id;

            document.getElementById('dash-date').innerText =
                new Date(d.created_at).toLocaleDateString();

            // Admin Portal Access
            if (d.is_superuser) {

                document.getElementById('admin-portal-link')
                    .classList.remove('hidden');

            } else {

                document.getElementById('admin-portal-link')
                    .classList.add('hidden');
            }

            toggleView('dashboard');

        } else {

            localStorage.removeItem("token");

            toggleView('login');
        }

    } catch (e) {

        showNotif("Session Sync Failed", true);
    }
}

// ===============================
// LOAD USERS (ADMIN)
// ===============================

async function loadUsers() {
    const token = localStorage.getItem("token");
    try {
        const r = await fetch(`${API_BASE}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await r.json();
        if (r.ok) {
            const body = document.getElementById('user-list-body');
            body.innerHTML = users.map(u => `
                <tr>
                    <td style="font-weight: 500;">${u.email}</td>
                    <td>
                        <span class="role-badge ${u.is_superuser ? 'role-admin' : 'role-user'}">
                            ${u.is_superuser ? 'Superuser' : 'Engineer'}
                        </span>
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.8rem;">
                        ${new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                </tr>
            `).join('');
        } else {
            showNotif("Unauthorized for Admin Access", true);
            toggleView('dashboard');
        }
    } catch (e) {
        showNotif("Failed to load users", true);
    }
}

// ===============================
// LOGOUT
// ===============================

async function logout() {

    const token = localStorage.getItem("token");

    try {

        await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

    } catch (e) {

        console.log("Logout request failed");
    }

    localStorage.removeItem("token");

    showNotif("Session Revoked Successfully");

    setTimeout(() => {
        toggleView('login');
    }, 600);
}

// ===============================
// INIT
// ===============================

document.getElementById('reg-btn')
    .addEventListener('click', register);

document.getElementById('log-btn')
    .addEventListener('click', login);

document.getElementById('out-btn')
    .addEventListener('click', logout);

document.getElementById('admin-out-btn')
    .addEventListener('click', logout);

// Auto Login Check

if (localStorage.getItem("token")) {

    loadProfile();

} else {

    toggleView('register');
}