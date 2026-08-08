// ==========================================
// TradeTrack Pro - Settings V2
// ==========================================

// ---------- Authentication ----------

if (localStorage.getItem("isLoggedIn") !== "true") {

    window.location.href = "index.html";

}

// ---------- Current User ----------

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

let users = JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];

// ---------- Elements ----------

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

const currency = document.getElementById("currency");
const risk = document.getElementById("risk");
const capital = document.getElementById("capital");

const notification = document.getElementById("notification");

const saveBtn = document.getElementById("saveBtn");
const logoutBtn = document.getElementById("logoutBtn");

const exportBtn = document.getElementById("exportBtn");
const backupBtn = document.getElementById("backupBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const clearBtn = document.getElementById("clearBtn");

const changePasswordBtn = document.getElementById("changePasswordBtn");

// ==========================================
// Load Settings
// ==========================================

window.onload = () => {

    if(currentUser){

        nameInput.value = currentUser.fullName;
        emailInput.value = currentUser.email;

        document.getElementById("profileName").innerHTML =
        currentUser.fullName;

        document.getElementById("profileEmail").innerHTML =
        currentUser.email;

        document.getElementById("profileUsername").innerHTML =
        "@" + currentUser.username;

    }

    currency.value =
    localStorage.getItem("currency") || "₹";

    risk.value =
    localStorage.getItem("defaultRisk") || "2%";

    capital.value =
    localStorage.getItem("capital") || "";

    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if(isDarkMode){

        document.body.classList.add("dark");

    }

};

// ==========================================
// Save Settings
// ==========================================

saveBtn.addEventListener("click",()=>{

    currentUser.fullName = nameInput.value.trim();

    currentUser.email = emailInput.value.trim();

    users = users.map(user=>{

        if(user.username===currentUser.username){

            return currentUser;

        }

        return user;

    });

    localStorage.setItem(
        "tradeTrackUsers",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    localStorage.setItem(
        "currency",
        currency.value
    );

    localStorage.setItem(
        "defaultRisk",
        risk.value
    );

    localStorage.setItem(
        "capital",
        capital.value
    );

    alert("Settings Saved Successfully.");

});


// ==========================================
// Export CSV
// ==========================================

exportBtn.addEventListener("click",()=>{

    const trades =
    JSON.parse(localStorage.getItem("trades")) || [];

    if(trades.length===0){

        alert("No Trades Found.");

        return;

    }

    let csv =
"Stock,Type,Entry,Exit,Qty,PnL,Strategy,Emotion,Date,Notes\n";

    trades.forEach(t=>{

        const noteEscaped = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '""';
        csv +=
`${t.stock},${t.type},${t.entry},${t.exit},${t.quantity},${t.pnl},${t.strategy},${t.emotion},${t.date},${noteEscaped}\n`;

    });

    const blob =
    new Blob([csv],{type:"text/csv"});

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href=url;

    a.download="TradeTrackPro.csv";

    a.click();

});

// ==========================================
// Backup JSON
// ==========================================

backupBtn.addEventListener("click",()=>{

    const trades =
    localStorage.getItem("trades");

    const blob =
    new Blob([trades],{type:"application/json"});

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href=url;

    a.download="TradeBackup.json";

    a.click();

});

// ==========================================
// Import Backup
// ==========================================

importBtn.addEventListener("click",()=>{

    importFile.click();

});

importFile.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=function(){

        localStorage.setItem(
            "trades",
            reader.result
        );

        alert("Backup Imported Successfully");

    }

    reader.readAsText(file);

});

// ==========================================
// Clear Trades
// ==========================================

clearBtn.addEventListener("click",()=>{

    if(confirm("Delete all trades?")){

        localStorage.removeItem("trades");

        alert("All Trades Deleted.");

    }

});

// ==========================================
// Change Password
// ==========================================

changePasswordBtn.addEventListener("click",()=>{

    const current =
    document.getElementById("currentPassword").value;

    const newPass =
    document.getElementById("newPassword").value;

    const confirm =
    document.getElementById("confirmPassword").value;

    if(current!==currentUser.password){

        alert("Current Password Incorrect");

        return;

    }

    if(newPass!==confirm){

        alert("Passwords do not match");

        return;

    }

    currentUser.password=newPass;

    users=users.map(user=>{

        if(user.username===currentUser.username){

            return currentUser;

        }

        return user;

    });

    localStorage.setItem(
        "tradeTrackUsers",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    alert("Password Updated Successfully");

});

// ==========================================
// Logout
// ==========================================

logoutBtn.addEventListener("click",()=>{

    if(confirm("Logout from TradeTrack Pro?")){

        localStorage.removeItem("isLoggedIn");

        localStorage.removeItem("currentUser");

        localStorage.removeItem("editTradeIndex");

        localStorage.removeItem("editTradeData");

        window.location.href="index.html";

    }

});