// ==========================================
// TradeTrack Pro - Settings & Config Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initTheme();
    initMobileNav();
    initSettings();
});

function initAuthCheck() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        localStorage.setItem("authMessage", "Please login first to continue.");
        window.location.href = "index.html";
    }
}

function initTheme() {
    const saved = localStorage.getItem("tradetrack_theme") || localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(saved);

    const toggleBtns = document.querySelectorAll("#themeToggleBtn, #topThemeToggleBtn, .theme-toggle-btn");
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

    const toggleBtns = document.querySelectorAll("#themeToggleBtn, #topThemeToggleBtn, .theme-toggle-btn");
    toggleBtns.forEach(btn => {
        const icon = btn.querySelector(".theme-icon");
        const text = btn.querySelector(".theme-text");
        if (theme === "dark") {
            if (icon) icon.textContent = "☀️";
            if (text) text.textContent = "Light Mode";
            if (btn.id === "topThemeToggleBtn") btn.textContent = "☀️";
        } else {
            if (icon) icon.textContent = "🌙";
            if (text) text.textContent = "Dark Mode";
            if (btn.id === "topThemeToggleBtn") btn.textContent = "🌙";
        }
    });
}

function initMobileNav() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        });
    }
}

function initSettings() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || { fullName: "Demo Trader", email: "demo@tradetrack.com", username: "demo" };
    let users = JSON.parse(localStorage.getItem("tradeTrackUsers")) || [];

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const currency = document.getElementById("currency");
    const risk = document.getElementById("risk");
    const capital = document.getElementById("capital");

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileUsername = document.getElementById("profileUsername");

    if (currentUser) {
        if (nameInput) nameInput.value = currentUser.fullName || "";
        if (emailInput) emailInput.value = currentUser.email || "";

        if (profileName) profileName.textContent = currentUser.fullName || "Trader Profile";
        if (profileEmail) profileEmail.textContent = currentUser.email || "trader@example.com";
        if (profileUsername) profileUsername.textContent = "@" + (currentUser.username || "trader");
    }

    if (currency) currency.value = localStorage.getItem("currency") || "₹";
    if (risk) risk.value = localStorage.getItem("defaultRisk") || "2%";
    if (capital) capital.value = localStorage.getItem("capital") || "100000";

    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (nameInput && nameInput.value.trim()) currentUser.fullName = nameInput.value.trim();
            if (emailInput && emailInput.value.trim()) currentUser.email = emailInput.value.trim();

            users = users.map(u => u.username === currentUser.username ? currentUser : u);

            localStorage.setItem("tradeTrackUsers", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            if (currency) localStorage.setItem("currency", currency.value);
            if (risk) localStorage.setItem("defaultRisk", risk.value);
            if (capital) localStorage.setItem("capital", capital.value);

            if (profileName) profileName.textContent = currentUser.fullName;
            if (profileEmail) profileEmail.textContent = currentUser.email;

            alert("✅ Settings Saved Successfully!");
        });
    }

    // Export CSV
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const trades = JSON.parse(localStorage.getItem("trades")) || [];
            if (trades.length === 0) {
                alert("No trade records found to export.");
                return;
            }

            let csv = "Stock,Type,Entry,Exit,Qty,PnL,Strategy,Emotion,Date,Notes\n";
            trades.forEach(t => {
                const noteEsc = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '""';
                csv += `${t.stock},${t.type},${t.entry},${t.exit},${t.quantity},${t.pnl},${t.strategy},${t.emotion},${t.date},${noteEsc}\n`;
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `TradeTrackPro_Report_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
        });
    }

    // Export PDF
    const pdfBtn = document.getElementById("pdfBtn");
    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => {
            window.print();
        });
    }

    // Backup JSON
    const backupBtn = document.getElementById("backupBtn");
    if (backupBtn) {
        backupBtn.addEventListener("click", () => {
            const tradesData = localStorage.getItem("trades") || "[]";
            const blob = new Blob([tradesData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `TradeTrackPro_Backup_${new Date().toISOString().split("T")[0]}.json`;
            a.click();
        });
    }

    // Import Backup
    const importBtn = document.getElementById("importBtn");
    const importFile = document.getElementById("importFile");

    if (importBtn && importFile) {
        importBtn.addEventListener("click", () => importFile.click());
        importFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        localStorage.setItem("trades", JSON.stringify(importedData));
                        alert("✅ Trade Backup Imported Successfully!");
                    } else {
                        alert("Invalid backup file format.");
                    }
                } catch (err) {
                    alert("Error parsing JSON file.");
                }
            };
            reader.readAsText(file);
        });
    }

    // Clear Trades
    const clearBtn = document.getElementById("clearBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("⚠️ Are you sure you want to PERMANENTLY DELETE all trade records?")) {
                localStorage.removeItem("trades");
                alert("🗑️ All trade records cleared.");
            }
        });
    }

    // Change Password
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", () => {
            const currentPass = document.getElementById("currentPassword")?.value || "";
            const newPass = document.getElementById("newPassword")?.value || "";
            const confirmPass = document.getElementById("confirmPassword")?.value || "";

            if (!currentPass || !newPass || !confirmPass) {
                alert("Please fill out all password fields.");
                return;
            }

            if (currentPass !== currentUser.password && currentUser.password) {
                alert("Current password is incorrect.");
                return;
            }

            if (newPass !== confirmPass) {
                alert("New passwords do not match.");
                return;
            }

            currentUser.password = newPass;
            users = users.map(u => u.username === currentUser.username ? currentUser : u);
            localStorage.setItem("tradeTrackUsers", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            alert("🔑 Password Changed Successfully!");
            if (document.getElementById("currentPassword")) document.getElementById("currentPassword").value = "";
            if (document.getElementById("newPassword")) document.getElementById("newPassword").value = "";
            if (document.getElementById("confirmPassword")) document.getElementById("confirmPassword").value = "";
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Logout from TradeTrack Pro?")) {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("editTradeIndex");
                localStorage.removeItem("editTradeData");
                window.location.href = "index.html";
            }
        });
    }
}