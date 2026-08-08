/**
 * TradeTrack Pro - Add / Edit Trade JS
 * Live PnL calculation, validation, form submission with loading state spinner
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tradeForm");
  const stockInput = document.getElementById("stock");
  const typeSelect = document.getElementById("type");
  const entryInput = document.getElementById("entry");
  const exitInput = document.getElementById("exit");
  const qtyInput = document.getElementById("quantity");
  const strategyInput = document.getElementById("strategy");
  const emotionSelect = document.getElementById("emotion");
  const dateInput = document.getElementById("date");
  const notesInput = document.getElementById("notes");

  const livePnLEl = document.getElementById("pnl");
  const submitBtn = document.getElementById("submitBtn");
  const formTitle = document.getElementById("formTitle");

  // Default Today's Date
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  // Live PnL Calculation Function
  function calculatePnL() {
    if (!entryInput || !exitInput || !qtyInput || !livePnLEl) return;

    const entry = parseFloat(entryInput.value) || 0;
    const exit = parseFloat(exitInput.value) || 0;
    const qty = parseInt(qtyInput.value) || 0;
    const type = typeSelect ? typeSelect.value : "BUY";
    const currencySymbol = localStorage.getItem("currency") || "₹";

    if (entry <= 0 || exit <= 0 || qty <= 0) {
      livePnLEl.textContent = `${currencySymbol}0.00`;
      livePnLEl.className = "card-value text-muted";
      return;
    }

    let pnl = 0;
    if (type === "BUY") {
      pnl = (exit - entry) * qty;
    } else {
      pnl = (entry - exit) * qty;
    }

    livePnLEl.textContent = `${currencySymbol}${pnl.toFixed(2)}`;
    if (pnl >= 0) {
      livePnLEl.className = "card-value text-profit";
    } else {
      livePnLEl.className = "card-value text-loss";
    }
  }

  // Attach live input listeners
  [entryInput, exitInput, qtyInput, typeSelect].forEach(element => {
    if (element) {
      element.addEventListener("input", calculatePnL);
      element.addEventListener("change", calculatePnL);
    }
  });

  // Check if Editing Existing Trade
  let editTradeId = null;
  const editDataStr = localStorage.getItem("editTradeData");
  if (editDataStr) {
    try {
      const editData = JSON.parse(editDataStr);
      if (editData && editData.id) {
        editTradeId = editData.id;
        if (formTitle) formTitle.textContent = "✏️ Edit Trade";
        if (submitBtn) submitBtn.textContent = "Update Trade";

        stockInput.value = editData.stock || "";
        typeSelect.value = editData.type || "BUY";
        entryInput.value = editData.entry || "";
        exitInput.value = editData.exit || "";
        qtyInput.value = editData.quantity || "";
        if (strategyInput) strategyInput.value = editData.strategy || "";
        if (emotionSelect) emotionSelect.value = editData.emotion || "Neutral";
        if (dateInput) dateInput.value = editData.date || new Date().toISOString().split("T")[0];
        if (notesInput) notesInput.value = editData.notes || "";

        calculatePnL();
      }
    } catch (e) {
      console.error("Error parsing edit trade data", e);
    }
  }

  // Form Submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const stock = stockInput.value.trim().toUpperCase();
      const type = typeSelect.value;
      const entry = parseFloat(entryInput.value);
      const exit = parseFloat(exitInput.value);
      const quantity = parseInt(qtyInput.value);
      const strategy = strategyInput ? strategyInput.value.trim() : "General";
      const emotion = emotionSelect ? emotionSelect.value : "Neutral";
      const date = dateInput.value;
      const notes = notesInput ? notesInput.value.trim() : "";

      if (!stock || !entry || !exit || !quantity) {
        showToast("Please fill in all required fields accurately.", "error");
        return;
      }

      let pnlValue = 0;
      if (type === "BUY") {
        pnlValue = (exit - entry) * quantity;
      } else {
        pnlValue = (entry - exit) * quantity;
      }

      // Show Loading State on Submit Button
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<div class="spinner"></div> Saving...`;

      const user = AuthManager.getCurrentUser();
      const tradeObj = {
        id: editTradeId ? editTradeId : Date.now(),
        username: user.username || "Guest",
        stock: stock,
        type: type,
        entry: entry,
        exit: exit,
        quantity: quantity,
        strategy: strategy,
        emotion: emotion,
        date: date,
        notes: notes,
        pnl: pnlValue
      };

      try {
        await DataStore.saveTrade(tradeObj);

        // Reset edit mode
        localStorage.removeItem("editTradeData");
        localStorage.removeItem("editTradeIndex");

        showToast(editTradeId ? "Trade updated successfully! 🎯" : "Trade logged successfully! 🚀", "success");

        setTimeout(() => {
          window.location.href = "/history";
        }, 800);
      } catch (err) {
        showToast("Failed to save trade. Saved locally.", "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
