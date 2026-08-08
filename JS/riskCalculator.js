// ==========================================
// TradeTrack Pro - Risk Calculator
// ==========================================

if (localStorage.getItem("isLoggedIn") !== "true") {
    localStorage.setItem("authMessage", "Please login first to continue.");
    window.location.href = "index.html";
}

const capital = document.getElementById("capital");
const riskPercent = document.getElementById("riskPercent");
const entryPrice = document.getElementById("entryPrice");
const stopLoss = document.getElementById("stopLoss");

const calculateBtn = document.getElementById("calculateBtn");

// Outputs
const riskAmount = document.getElementById("riskAmount");
const riskPerShare = document.getElementById("riskPerShare");
const quantity = document.getElementById("quantity");
const positionSize = document.getElementById("positionSize");

const currencySymbol = localStorage.getItem("currency") || "₹";

// ==========================================
// Pre-populate Default Values from Settings
// ==========================================
function loadDefaultPreferences() {
    const savedCapital = localStorage.getItem("capital");
    const savedRisk = localStorage.getItem("defaultRisk");

    if (savedCapital) {
        capital.value = savedCapital;
    }
    if (savedRisk) {
        // Remove '%' sign if present in saved settings
        riskPercent.value = savedRisk.replace("%", "").trim();
    }
    
    // Set default currency label in outputs on load
    riskAmount.innerHTML = currencySymbol + "0";
    riskPerShare.innerHTML = currencySymbol + "0";
    quantity.innerHTML = "0";
    positionSize.innerHTML = currencySymbol + "0";
}

// ==========================================
// Calculate Function
// ==========================================
function calculateRisk() {
    let cap = Number(capital.value);
    let risk = Number(riskPercent.value);
    let entry = Number(entryPrice.value);
    let sl = Number(stopLoss.value);

    // Validation
    if (cap <= 0 || risk <= 0 || entry <= 0 || sl <= 0) {
        riskAmount.innerHTML = currencySymbol + "0";
        riskPerShare.innerHTML = currencySymbol + "0";
        quantity.innerHTML = "0";
        positionSize.innerHTML = currencySymbol + "0";
        return;
    }

    let totalRisk = cap * risk / 100;
    let perShareRisk = Math.abs(entry - sl);

    if (perShareRisk === 0) {
        alert("Entry Price and Stop Loss cannot be the same.");
        return;
    }

    let qty = Math.floor(totalRisk / perShareRisk);
    let totalPosition = qty * entry;

    // Display
    riskAmount.innerHTML = currencySymbol + totalRisk.toFixed(2);
    riskPerShare.innerHTML = currencySymbol + perShareRisk.toFixed(2);
    quantity.innerHTML = qty;
    positionSize.innerHTML = currencySymbol + totalPosition.toFixed(2);
}

// ==========================================
// Events
// ==========================================
calculateBtn.addEventListener("click", calculateRisk);

capital.addEventListener("input", calculateRisk);
riskPercent.addEventListener("input", calculateRisk);
entryPrice.addEventListener("input", calculateRisk);
stopLoss.addEventListener("input", calculateRisk);

// Load default settings on page script execution
loadDefaultPreferences();
// Run calculation if defaults were pre-populated
if (capital.value && riskPercent.value && entryPrice.value && stopLoss.value) {
    calculateRisk();
}