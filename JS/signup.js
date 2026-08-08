// ======================================
// TradeTrack Pro - Signup Logic
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSignupForm();
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

function initSignupForm() {
    const signupForm = document.getElementById("signupForm");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const togglePassword = document.getElementById("togglePassword");
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const strength = document.getElementById("passwordStrength") || document.getElementById("npasswordStrength");
    const message = document.getElementById("signupMessage");

    if (togglePassword && password) {
        togglePassword.addEventListener("click", () => {
            if (password.type === "password") {
                password.type = "text";
                togglePassword.textContent = "🙈";
            } else {
                password.type = "password";
                togglePassword.textContent = "👁️";
            }
        });
    }

    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener("click", () => {
            if (confirmPassword.type === "password") {
                confirmPassword.type = "text";
                toggleConfirmPassword.textContent = "🙈";
            } else {
                confirmPassword.type = "password";
                toggleConfirmPassword.textContent = "👁️";
            }
        });
    }

    if (password && strength) {
        password.addEventListener("keyup", () => {
            const value = password.value;
            if (value.length < 6) {
                strength.innerHTML = "Weak Password";
                strength.style.color = "#ef4444";
            } else if (value.length < 10) {
                strength.innerHTML = "Medium Password";
                strength.style.color = "#f59e0b";
            } else {
                strength.innerHTML = "Strong Password";
                strength.style.color = "#10b981";
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fullName = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const username = document.getElementById("username").value.trim();
            const pass = password.value;
            const confirm = confirmPassword.value;

            if (pass !== confirm) {
                if (message) {
                    message.style.color = "#ef4444";
                    message.innerHTML = "Passwords do not match.";
                }
                return;
            }

            let users = JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];

            const emailExists = users.find(user => user.email === email);
            if (emailExists) {
                if (message) {
                    message.style.color = "#ef4444";
                    message.innerHTML = "Email already registered.";
                }
                return;
            }

            const usernameExists = users.find(user => user.username.toLowerCase() === username.toLowerCase());
            if (usernameExists) {
                if (message) {
                    message.style.color = "#ef4444";
                    message.innerHTML = "Username already exists.";
                }
                return;
            }

            const newUser = {
                fullName,
                email,
                username,
                password: pass
            };

            users.push(newUser);
            localStorage.setItem("tradeTrackUsers", JSON.stringify(users));

            if (message) {
                message.style.color = "#10b981";
                message.innerHTML = "Account Created Successfully! Redirecting to login...";
            }

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        });
    }
}