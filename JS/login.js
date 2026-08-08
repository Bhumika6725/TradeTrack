// ======================================
// TradeTrack Pro - Login Logic
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLoginForm();
});

function initTheme() {
    const saved = localStorage.getItem("tradetrack_theme") || localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(saved);

    const toggleBtns = document.querySelectorAll("#themeToggleBtn, .theme-toggle-btn");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
        });
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
    }
    localStorage.setItem("tradetrack_theme", theme);
    localStorage.setItem("theme", theme);

    const toggleBtns = document.querySelectorAll("#themeToggleBtn, .theme-toggle-btn");
    toggleBtns.forEach(btn => {
        const icon = btn.querySelector(".theme-icon");
        const text = btn.querySelector(".theme-text");
        if (theme === "dark") {
            if (icon) icon.textContent = "☀️";
            if (text) text.textContent = "Light";
        } else {
            if (icon) icon.textContent = "🌙";
            if (text) text.textContent = "Dark";
        }
    });
}

function initLoginForm() {
    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const errorMessage = document.getElementById("errorMessage");

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePasswordBtn.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                togglePasswordBtn.textContent = "👁️";
            }
        });
    }

    const remembered = localStorage.getItem("rememberUser");
    if (remembered && document.getElementById("username")) {
        document.getElementById("username").value = remembered;
        const remCb = document.getElementById("remember");
        if (remCb) remCb.checked = true;
    }

    const authMessage = localStorage.getItem("authMessage");
    if (authMessage && errorMessage) {
        errorMessage.style.color = "#ef4444";
        errorMessage.innerHTML = authMessage;
        localStorage.removeItem("authMessage");
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("username");
            const username = usernameInput ? usernameInput.value.trim() : "";
            const pass = passwordInput ? passwordInput.value : "";
            const remCb = document.getElementById("remember");
            const remember = remCb ? remCb.checked : false;

            if (errorMessage) errorMessage.innerHTML = "";

            const users = JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];
            let user = users.find(
                u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass
            );

            // Demo account fallback
            if (!user && (username.toLowerCase() === "demo" || username.toLowerCase() === "admin") && pass === "demo") {
                user = { username: username, fullName: "Demo Trader", email: "demo@tradetrack.com" };
            }

            if (!user) {
                if (errorMessage) {
                    errorMessage.style.color = "#ef4444";
                    errorMessage.innerHTML = "Invalid Username or Password. (Try demo / demo)";
                }
                return;
            }

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("currentUser", JSON.stringify(user));

            if (remember) {
                localStorage.setItem("rememberUser", username);
            } else {
                localStorage.removeItem("rememberUser");
            }

            if (errorMessage) {
                errorMessage.style.color = "#10b981";
                errorMessage.innerHTML = "Login Successful! Redirecting...";
            }

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 600);
        });
    }
}