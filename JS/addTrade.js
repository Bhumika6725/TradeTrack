// ======================================
// TradeTrack Pro
// Add Trade JavaScript
// ======================================
// ==============================
// Apply Saved Theme
// ==============================



console.log("JS Loaded");
// ---------- Form Elements ----------
if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href = "index.html";

}

const tradeForm = document.getElementById("tradeForm");

const stock = document.getElementById("stock");
const type = document.getElementById("type");
const entry = document.getElementById("entry");
const exit = document.getElementById("exit");
const quantity = document.getElementById("quantity");
const strategy = document.getElementById("strategy");
const emotion = document.getElementById("emotion");
const date = document.getElementById("date");
const notes = document.getElementById("notes");

const pnl = document.getElementById("pnl");

// ---------- Auto Today's Date ----------

date.value = new Date().toISOString().split("T")[0];

const currencySymbol = localStorage.getItem("currency") || "₹";

// ---------- Live Profit / Loss ----------

function calculatePnL() {

    const entryPrice = Number(entry.value);
    const exitPrice = Number(exit.value);
    const qty = Number(quantity.value);

    if (!entryPrice || !exitPrice || !qty) {

        pnl.innerHTML = currencySymbol + "0";
        pnl.style.color = "#2563eb";
        return;

    }

    let result = 0;

    if (type.value === "BUY") {

        result = (exitPrice - entryPrice) * qty;

    } else {

        result = (entryPrice - exitPrice) * qty;

    }

    pnl.innerHTML = currencySymbol + result.toFixed(2);

    if (result >= 0) {

        pnl.style.color = "#16a34a";

    } else {

        pnl.style.color = "#dc2626";

    }

}

// ---------- Live Events ----------

entry.addEventListener("input", calculatePnL);
exit.addEventListener("input", calculatePnL);
quantity.addEventListener("input", calculatePnL);
type.addEventListener("change", calculatePnL);

// ---------- Edit Mode Check & Load ----------
let editIndex = localStorage.getItem("editTradeIndex");
let isEditMode = editIndex !== null && editIndex !== undefined && editIndex !== "";

if (isEditMode) {
    try {
        const editData = JSON.parse(localStorage.getItem("editTradeData"));
        if (editData) {
            stock.value = editData.stock || "";
            type.value = editData.type || "BUY";
            entry.value = editData.entry || "";
            exit.value = editData.exit || "";
            quantity.value = editData.quantity || "";
            strategy.value = editData.strategy || "";
            emotion.value = editData.emotion || "";
            date.value = editData.date || new Date().toISOString().split("T")[0];
            notes.value = editData.notes || "";
            
            // Recalculate P&L
            calculatePnL();
            
            // Update Title & Button Text
            const pageTitle = document.querySelector(".page-title h1");
            if (pageTitle) pageTitle.textContent = "Edit Trade";
            
            const submitBtn = document.querySelector(".save-btn");
            if (submitBtn) submitBtn.textContent = "Update Trade";
        }
    } catch (err) {
        console.error("Error loading edit trade data", err);
    }
}

// ---------- Save Trade ----------

tradeForm.addEventListener("submit", function (e) {

    e.preventDefault();

    console.log("Submit Working");

    // Current User
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

    // Trade Object
    const trade = {

        id: isEditMode ? JSON.parse(localStorage.getItem("editTradeData")).id : Date.now(),

        username: currentUser.username || "Guest",

        stock: stock.value.trim(),

        type: type.value,

        entry: Number(entry.value),

        exit: Number(exit.value),

        quantity: Number(quantity.value),

        strategy: strategy.value.trim(),

        emotion: emotion.value.trim(),

        date: date.value,

        notes: notes.value.trim(),

        pnl: Number(pnl.innerHTML.replace(currencySymbol, ""))

    };

    // Get Existing Trades
    let trades = [];

    try {

        trades = JSON.parse(localStorage.getItem("trades")) || [];

    } catch (error) {

        console.log(error);

        trades = [];

    }

    if (isEditMode) {
        trades[Number(editIndex)] = trade;
        localStorage.removeItem("editTradeIndex");
        localStorage.removeItem("editTradeData");
        localStorage.setItem("trades", JSON.stringify(trades));
        alert("✅ Trade Updated Successfully!");
        window.location.href = "history.html";
    } else {
        trades.push(trade);
        localStorage.setItem("trades", JSON.stringify(trades));
        console.log("Saved Trades:", trades);
        alert("✅ Trade Saved Successfully!");
        tradeForm.reset();
        pnl.innerHTML = currencySymbol + "0";
        pnl.style.color = "#2563eb";
        date.value = new Date().toISOString().split("T")[0];
    }

});