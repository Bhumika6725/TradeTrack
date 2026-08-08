// ======================================
// TradeTrack Pro - Forgot Password
// ======================================
// ==============================
// Apply Saved Theme
// ==============================


const form = document.getElementById("forgotForm");

const email = document.getElementById("email");
const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const strength = document.getElementById("passwordStrength");
const message = document.getElementById("forgotMessage");

// Show Password

togglePassword.addEventListener("click", () => {

    password.type = password.type === "password" ? "text" : "password";

});

// Show Confirm Password

toggleConfirmPassword.addEventListener("click", () => {

    confirmPassword.type = confirmPassword.type === "password" ? "text" : "password";

});

// Password Strength

password.addEventListener("keyup", () => {

    if (password.value.length < 6) {

        strength.innerHTML = "Weak Password";
        strength.style.color = "red";

    } else if (password.value.length < 10) {

        strength.innerHTML = "Medium Password";
        strength.style.color = "orange";

    } else {

        strength.innerHTML = "Strong Password";
        strength.style.color = "green";

    }

});

// Update Password

form.addEventListener("submit", (e) => {

    e.preventDefault();

    if (password.value !== confirmPassword.value) {

        message.style.color = "red";
        message.innerHTML = "Passwords do not match.";

        return;

    }

    let users = JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];

    const index = users.findIndex(user =>

        user.email === email.value.trim().toLowerCase() &&

        user.username === username.value.trim()

    );

    if (index === -1) {

        message.style.color = "red";
        message.innerHTML = "Account not found.";

        return;

    }

    users[index].password = password.value;

    localStorage.setItem("tradeTrackUsers", JSON.stringify(users));

    message.style.color = "green";
    message.innerHTML = "Password Updated Successfully.";

    setTimeout(() => {

        window.location.href = "index.html";

    }, 2000);

});