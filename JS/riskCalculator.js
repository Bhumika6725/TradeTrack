// ==========================================
// TradeTrack Pro - Risk Calculator Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initTheme();
    initMobileNav();
    initCalculator();
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

function initCalculator() {
    const capital = document.getElementById("capital");
    const riskPercent = document.getElementById("riskPercent");
    const entryPrice = document.getElementById("entryPrice");
    const stopLoss = document.getElementById("stopLoss");
    const calculateBtn = document.getElementById("calculateBtn");

    const riskAmount = document.getElementById("riskAmount");
    const riskPerShare = document.getElementById("riskPerShare");
    const quantity = document.getElementById("quantity");
    const positionSize = document.getElementById("positionSize");

    const currencySymbol = localStorage.getItem("currency") || "₹";

    // Load defaults from Settings
    const savedCapital = localStorage.getItem("capital");
    const savedRisk = localStorage.getItem("defaultRisk");

    if (savedCapital && capital && !capital.value) capital.value = savedCapital;
    if (savedRisk && riskPercent && !riskPercent.value) riskPercent.value = savedRisk.replace("%", "").trim();

    function calculateRisk() {
        if (!capital || !riskPercent || !entryPrice || !stopLoss) return;

        const cap = parseFloat(capital.value);
        const risk = parseFloat(riskPercent.value);
        const entry = parseFloat(entryPrice.value);
        const sl = parseFloat(stopLoss.value);

        if (isNaN(cap) || isNaN(risk) || isNaN(entry) || isNaN(sl) || cap <= 0 || risk <= 0 || entry <= 0 || sl <= 0) {
            if (riskAmount) riskAmount.innerHTML = currencySymbol + "0.00";
            if (riskPerShare) riskPerShare.innerHTML = currencySymbol + "0.00";
            if (quantity) quantity.innerHTML = "0";
            if (positionSize) positionSize.innerHTML = currencySymbol + "0.00";
            return;
        }

        const totalRisk = cap * (risk / 100);
        const perShareRisk = Math.abs(entry - sl);

        if (perShareRisk === 0) {
            alert("Entry Price and Stop Loss cannot be identical.");
            return;
        }

        const qty = Math.floor(totalRisk / perShareRisk);
        const totalPosition = qty * entry;

        if (riskAmount) riskAmount.innerHTML = currencySymbol + totalRisk.toFixed(2);
        if (riskPerShare) riskPerShare.innerHTML = currencySymbol + perShareRisk.toFixed(2);
        if (quantity) quantity.innerHTML = qty;
        if (positionSize) positionSize.innerHTML = currencySymbol + totalPosition.toFixed(2);
    }

    if (calculateBtn) calculateBtn.addEventListener("click", calculateRisk);

    if (capital) capital.addEventListener("input", calculateRisk);
    if (riskPercent) riskPercent.addEventListener("input", calculateRisk);
    if (entryPrice) entryPrice.addEventListener("input", calculateRisk);
    if (stopLoss) stopLoss.addEventListener("input", calculateRisk);

    if (capital && capital.value && riskPercent && riskPercent.value && entryPrice && entryPrice.value && stopLoss && stopLoss.value) {
        calculateRisk();
    }
}