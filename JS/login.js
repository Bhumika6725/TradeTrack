// ======================================
// TradeTrack Pro - Login
// ======================================

// Elements
// ==============================
// Apply Saved Theme
// ==============================



const loginForm = document.getElementById("loginForm");

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const errorMessage = document.getElementById("errorMessage");

// ===============================
// Show / Hide Password
// ===============================

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";
        togglePassword.textContent = "🙈";

    } else {

        password.type = "password";
        togglePassword.textContent = "👁️";

    }

});

// ===============================
// Login
// ===============================

loginForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();

    const pass = password.value;

    const remember = document.getElementById("remember").checked;

    errorMessage.innerHTML = "";

    // Get All Users

    const users = JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];

    // Find User

    const user = users.find(

        u => u.username === username && u.password === pass

    );

    if (!user) {

        errorMessage.style.color = "#ef4444";
        errorMessage.innerHTML = "Invalid Username or Password.";

        return;

    }

    // Login Success

    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem("currentUser", JSON.stringify(user));

    if (remember) {

        localStorage.setItem("rememberUser", username);

    } else {

        localStorage.removeItem("rememberUser");

    }

    errorMessage.style.color = "#22c55e";
    errorMessage.innerHTML = "Login Successful...";

    setTimeout(() => {

        window.location.href = "dashboard.html";

    }, 1000);

});

// ===============================
// Remember Username & Show Auth Message
// ===============================

window.onload = () => {

    const remembered = localStorage.getItem("rememberUser");

    if (remembered) {

        document.getElementById("username").value = remembered;

        document.getElementById("remember").checked = true;

    }

    const authMessage = localStorage.getItem("authMessage");
    if (authMessage) {
        errorMessage.style.color = "#ef4444";
        errorMessage.innerHTML = authMessage;
        localStorage.removeItem("authMessage");
    }

};