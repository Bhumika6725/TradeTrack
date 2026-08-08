/**
 * TradeTrack Pro - Settings & Data Management JS
 * User Profile updates, Password change, CSV Export, JSON Backup & Restore, Clear Data
 */

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = AuthManager.getCurrentUser();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const currencyInput = document.getElementById("currency");
  const riskInput = document.getElementById("risk");
  const capitalInput = document.getElementById("capital");

  const saveBtn = document.getElementById("saveSettingsBtn");
  const exportBtn = document.getElementById("exportBtn");
  const backupBtn = document.getElementById("backupBtn");
  const importBtn = document.getElementById("importBtn");
  const importFileInput = document.getElementById("importFile");
  const clearBtn = document.getElementById("clearBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Populate Profile Inputs
  if (currentUser) {
    if (nameInput) nameInput.value = currentUser.fullName || "";
    if (emailInput) emailInput.value = currentUser.email || "";

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileUsername = document.getElementById("profileUsername");

    if (profileName) profileName.textContent = currentUser.fullName || "Trader";
    if (profileEmail) profileEmail.textContent = currentUser.email || "trader@example.com";
    if (profileUsername) profileUsername.textContent = `@${currentUser.username || 'trader'}`;
  }

  if (currencyInput) currencyInput.value = localStorage.getItem("currency") || "₹";
  if (riskInput) riskInput.value = localStorage.getItem("defaultRisk") || "2%";
  if (capitalInput) capitalInput.value = localStorage.getItem("capital") || "100000";

  // Save Settings
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (nameInput) currentUser.fullName = nameInput.value.trim();
      if (emailInput) currentUser.email = emailInput.value.trim();

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      if (currencyInput) localStorage.setItem("currency", currencyInput.value);
      if (riskInput) localStorage.setItem("defaultRisk", riskInput.value);
      if (capitalInput) localStorage.setItem("capital", capitalInput.value);

      showToast("Settings saved successfully! ⚙️", "success");
    });
  }

  // Export CSV
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const trades = DataStore.getTrades();
      if (trades.length === 0) {
        showToast("No trades found to export.", "error");
        return;
      }

      let csv = "ID,Stock,Type,Entry,Exit,Qty,PnL,Strategy,Emotion,Date,Notes\n";
      trades.forEach(t => {
        const notesSanitized = (t.notes || "").replace(/,/g, " ");
        csv += `${t.id},${t.stock},${t.type},${t.entry},${t.exit},${t.quantity},${t.pnl},${t.strategy},${t.emotion},${t.date},${notesSanitized}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TradeTrackPro_Export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("CSV export downloaded! 📊", "success");
    });
  }

  // Backup JSON
  if (backupBtn) {
    backupBtn.addEventListener("click", () => {
      const trades = DataStore.getTrades();
      const blob = new Blob([JSON.stringify(trades, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TradeTrackPro_Backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("JSON backup created! 💾", "success");
    });
  }

  // Import Backup
  if (importBtn && importFileInput) {
    importBtn.addEventListener("click", () => importFileInput.click());

    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function () {
        try {
          const imported = JSON.parse(reader.result);
          if (Array.isArray(imported)) {
            DataStore.setTrades(imported);
            await fetch("/api/trades/import", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(imported)
            });
            showToast(`Successfully imported ${imported.length} trades! 🎉`, "success");
            setTimeout(() => window.location.reload(), 1000);
          } else {
            showToast("Invalid JSON file format.", "error");
          }
        } catch (err) {
          showToast("Failed to read JSON backup file.", "error");
        }
      };
      reader.readAsText(file);
    });
  }

  // Clear Trades
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      if (confirm("⚠️ Are you sure you want to delete ALL logged trades? This action cannot be undone.")) {
        DataStore.setTrades([]);
        try {
          await fetch("/api/trades/clear", { method: "POST" });
        } catch (e) {}
        showToast("All trade logs cleared.", "info");
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  // Change Password
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      const curPass = document.getElementById("currentPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirmPass = document.getElementById("confirmPassword").value;

      if (!newPass || newPass !== confirmPass) {
        showToast("New passwords do not match.", "error");
        return;
      }

      currentUser.password = newPass;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showToast("Password updated successfully 🔒", "success");
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => AuthManager.logout());
  }
});
