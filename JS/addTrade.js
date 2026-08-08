// ==========================================
// TradeTrack Pro - Add / Edit Trade Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initTheme();
    initMobileNav();
    initTradeForm();
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

function initTradeForm() {
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

    const currencySymbol = localStorage.getItem("currency") || "₹";

    if (date && !date.value) {
        date.value = new Date().toISOString().split("T")[0];
    }

    function calculatePnL() {
        if (!entry || !exit || !quantity || !pnl) return;

        const entryPrice = parseFloat(entry.value);
        const exitPrice = parseFloat(exit.value);
        const qty = parseFloat(quantity.value);

        if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(qty)) {
            pnl.innerHTML = currencySymbol + "0.00";
            pnl.style.color = "var(--accent-blue)";
            return;
        }

        let result = 0;
        if (type.value === "BUY") {
            result = (exitPrice - entryPrice) * qty;
        } else {
            result = (entryPrice - exitPrice) * qty;
        }

        pnl.innerHTML = currencySymbol + result.toFixed(2);
        pnl.style.color = result >= 0 ? "var(--profit-color)" : "var(--loss-color)";
    }

    if (entry) entry.addEventListener("input", calculatePnL);
    if (exit) exit.addEventListener("input", calculatePnL);
    if (quantity) quantity.addEventListener("input", calculatePnL);
    if (type) type.addEventListener("change", calculatePnL);

    // Edit Mode Support
    const editIndex = localStorage.getItem("editTradeIndex");
    const isEditMode = editIndex !== null && editIndex !== undefined && editIndex !== "";

    if (isEditMode) {
        try {
            const editData = JSON.parse(localStorage.getItem("editTradeData"));
            if (editData) {
                if (stock) stock.value = editData.stock || "";
                if (type) type.value = editData.type || "BUY";
                if (entry) entry.value = editData.entry || "";
                if (exit) exit.value = editData.exit || "";
                if (quantity) quantity.value = editData.quantity || "";
                if (strategy) strategy.value = editData.strategy || "";
                if (emotion) emotion.value = editData.emotion || "";
                if (date) date.value = editData.date || new Date().toISOString().split("T")[0];
                if (notes) notes.value = editData.notes || "";

                calculatePnL();

                const pageTitle = document.querySelector(".page-title h1");
                if (pageTitle) pageTitle.textContent = "Edit Trade Log";

                const submitBtn = document.querySelector(".save-btn");
                if (submitBtn) submitBtn.textContent = "Update Trade Log";
            }
        } catch (err) {
            console.error("Error loading edit trade data", err);
        }
    }

    if (tradeForm) {
        tradeForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

            const entryVal = parseFloat(entry.value) || 0;
            const exitVal = parseFloat(exit.value) || 0;
            const qtyVal = parseFloat(quantity.value) || 0;

            let computedPnl = 0;
            if (type.value === "BUY") {
                computedPnl = (exitVal - entryVal) * qtyVal;
            } else {
                computedPnl = (entryVal - exitVal) * qtyVal;
            }

            const trade = {
                id: isEditMode ? (JSON.parse(localStorage.getItem("editTradeData"))?.id || Date.now()) : Date.now(),
                username: currentUser.username || "Guest",
                stock: stock.value.trim(),
                type: type.value,
                entry: entryVal,
                exit: exitVal,
                quantity: qtyVal,
                strategy: strategy.value.trim(),
                emotion: emotion.value.trim(),
                date: date.value,
                notes: notes.value.trim(),
                pnl: computedPnl
            };

            let trades = JSON.parse(localStorage.getItem("trades")) || [];

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
                alert("✅ Trade Saved Successfully!");
                tradeForm.reset();
                if (pnl) {
                    pnl.innerHTML = currencySymbol + "0.00";
                    pnl.style.color = "var(--accent-blue)";
                }
                if (date) date.value = new Date().toISOString().split("T")[0];
            }
        });
    }
}