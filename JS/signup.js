// ======================================
// TradeTrack Pro - Signup
// ======================================
// ==============================
// Apply Saved Theme
// ========
const signupForm = document.getElementById("signupForm");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const strength = document.getElementById("npasswordStrength");
const message = document.getElementById("signupMessage");

// ------------------------------
// Show Password
// ------------------------------

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){

        password.type = "text";
        togglePassword.textContent = "🙈";

    }else{

        password.type = "password";
        togglePassword.textContent = "👁️";

    }

});

// ------------------------------
// Show Confirm Password
// ------------------------------

toggleConfirmPassword.addEventListener("click", () => {

    if(confirmPassword.type === "password"){

        confirmPassword.type = "text";
        toggleConfirmPassword.textContent = "🙈";

    }else{

        confirmPassword.type = "password";
        toggleConfirmPassword.textContent = "👁️";

    }

});

// ------------------------------
// Password Strength
// ------------------------------

password.addEventListener("keyup",()=>{

    const value=password.value;

    if(value.length<6){

        strength.innerHTML="Weak Password";
        strength.style.color="red";

    }

    else if(value.length<10){

        strength.innerHTML="Medium Password";
        strength.style.color="orange";

    }

    else{

        strength.innerHTML="Strong Password";
        strength.style.color="green";

    }

});

// ------------------------------
// Signup
// ------------------------------

signupForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    const fullName=document.getElementById("fullname").value.trim();

    const email=document.getElementById("email").value.trim().toLowerCase();

    const username=document.getElementById("username").value.trim();

    const pass=password.value;

    const confirm=confirmPassword.value;

    if(pass!==confirm){

        message.style.color="red";
        message.innerHTML="Passwords do not match.";
        return;

    }

    let users=JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];

    const emailExists=users.find(user=>user.email===email);

    if(emailExists){

        message.style.color="red";
        message.innerHTML="Email already registered.";
        return;

    }

    const usernameExists=users.find(user=>user.username===username);

    if(usernameExists){

        message.style.color="red";
        message.innerHTML="Username already exists.";
        return;

    }

    const newUser={

        fullName,
        email,
        username,
        password:pass

    };

    users.push(newUser);

    localStorage.setItem("tradeTrackUsers",JSON.stringify(users));

    message.style.color="green";
    message.innerHTML="Account Created Successfully! Redirecting...";

    setTimeout(()=>{

        window.location.href="index.html";

    },1500);

});