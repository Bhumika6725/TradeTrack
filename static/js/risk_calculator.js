/**
 * TradeTrack Pro - Smart Risk & Position Sizing Calculator JS
 * Real-time calculation of risk amount, risk per share, allowed quantity, and position size
 */

document.addEventListener("DOMContentLoaded", () => {
  const capitalInput = document.getElementById("capital");
  const riskPercentInput = document.getElementById("riskPercent");
  const entryPriceInput = document.getElementById("entryPrice");
  const stopLossInput = document.getElementById("stopLoss");

  const riskAmountEl = document.getElementById("riskAmount");
  const riskPerShareEl = document.getElementById("riskPerShare");
  const quantityEl = document.getElementById("quantity");
  const positionSizeEl = document.getElementById("positionSize");

  const calculateBtn = document.getElementById("calculateBtn");

  function calculateRisk() {
    const capital = parseFloat(capitalInput.value) || 0;
    const riskPercent = parseFloat(riskPercentInput.value) || 0;
    const entry = parseFloat(entryPriceInput.value) || 0;
    const sl = parseFloat(stopLossInput.value) || 0;

    if (capital <= 0 || riskPercent <= 0 || entry <= 0 || sl <= 0) {
      if (riskAmountEl) riskAmountEl.textContent = "₹0.00";
      if (riskPerShareEl) riskPerShareEl.textContent = "₹0.00";
      if (quantityEl) quantityEl.textContent = "0";
      if (positionSizeEl) positionSizeEl.textContent = "₹0.00";
      return;
    }

    const totalRiskAmount = (capital * riskPercent) / 100;
    const riskPerShare = Math.abs(entry - sl);

    if (riskPerShare === 0) {
      showToast("Entry Price and Stop Loss cannot be identical.", "error");
      return;
    }

    const quantity = Math.floor(totalRiskAmount / riskPerShare);
    const totalPosition = quantity * entry;

    if (riskAmountEl) riskAmountEl.textContent = `₹${totalRiskAmount.toFixed(2)}`;
    if (riskPerShareEl) riskPerShareEl.textContent = `₹${riskPerShare.toFixed(2)}`;
    if (quantityEl) quantityEl.textContent = quantity.toLocaleString();
    if (positionSizeEl) positionSizeEl.textContent = `₹${totalPosition.toFixed(2)}`;
  }

  // Load saved default capital or risk from localStorage if available
  const savedCap = localStorage.getItem("capital");
  const savedRisk = localStorage.getItem("defaultRisk");
  if (savedCap && capitalInput && !capitalInput.value) capitalInput.value = savedCap;
  if (savedRisk && riskPercentInput && !riskPercentInput.value) {
    riskPercentInput.value = savedRisk.replace("%", "");
  }

  [capitalInput, riskPercentInput, entryPriceInput, stopLossInput].forEach(input => {
    if (input) {
      input.addEventListener("input", calculateRisk);
    }
  });

  if (calculateBtn) {
    calculateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      calculateRisk();
      showToast("Position size calculated successfully! 🎯", "info");
    });
  }

  calculateRisk();
});
