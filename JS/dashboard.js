// ==========================================
// TradeTrack Pro - Dashboard Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initTheme();
    initMobileNav();
    renderDashboard();
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

function renderDashboard() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    const userName = currentUser.fullName || currentUser.username || "Trader";
    const currencySymbol = localStorage.getItem("currency") || "₹";

    const welcomeEl = document.getElementById("welcomeText");
    if (welcomeEl) welcomeEl.innerHTML = `Welcome, ${userName} 👋`;

    const todayDateEl = document.getElementById("todayDate");
    if (todayDateEl) todayDateEl.innerHTML = new Date().toDateString();

    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    let totalTrades = trades.length;
    let totalProfit = 0;
    let wins = 0;
    let losses = 0;
    let todayProfit = 0;
    let biggestProfit = 0;
    let biggestLoss = 0;
    let bestStock = "-";
    let bestStrategy = "-";
    let stockProfit = {};
    let strategyProfit = {};

    const todayStr = new Date().toISOString().split("T")[0];

    trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) || 0;
        totalProfit += pnl;

        if (pnl >= 0) wins++;
        else losses++;

        if (pnl > biggestProfit) biggestProfit = pnl;
        if (pnl < biggestLoss) biggestLoss = pnl;

        if (trade.date === todayStr) {
            todayProfit += pnl;
        }

        if (trade.stock) {
            stockProfit[trade.stock] = (stockProfit[trade.stock] || 0) + pnl;
        }

        if (trade.strategy) {
            strategyProfit[trade.strategy] = (strategyProfit[trade.strategy] || 0) + pnl;
        }
    });

    let maxStockVal = -Infinity;
    for (let s in stockProfit) {
        if (stockProfit[s] > maxStockVal) {
            maxStockVal = stockProfit[s];
            bestStock = s;
        }
    }

    let maxStratVal = -Infinity;
    for (let st in strategyProfit) {
        if (strategyProfit[st] > maxStratVal) {
            maxStratVal = strategyProfit[st];
            bestStrategy = st;
        }
    }

    const totalTradesEl = document.getElementById("totalTrades");
    if (totalTradesEl) totalTradesEl.innerHTML = totalTrades;

    const netProfitEl = document.getElementById("netProfit");
    if (netProfitEl) {
        netProfitEl.innerHTML = `${currencySymbol}${totalProfit.toFixed(2)}`;
        netProfitEl.style.color = totalProfit >= 0 ? "var(--profit-color)" : "var(--loss-color)";
    }

    const todayProfitEl = document.getElementById("todayProfit");
    if (todayProfitEl) {
        todayProfitEl.innerHTML = `${currencySymbol}${todayProfit.toFixed(2)}`;
        todayProfitEl.style.color = todayProfit >= 0 ? "var(--profit-color)" : "var(--loss-color)";
    }

    const winRate = totalTrades === 0 ? "0.0" : ((wins / totalTrades) * 100).toFixed(1);
    const winRateEl = document.getElementById("winRate");
    if (winRateEl) winRateEl.innerHTML = `${winRate}%`;

    const bestStockEl = document.getElementById("bestStock");
    if (bestStockEl) bestStockEl.innerHTML = bestStock;

    const bestStrategyEl = document.getElementById("bestStrategy");
    if (bestStrategyEl) bestStrategyEl.innerHTML = bestStrategy;

    const bigProfitEl = document.getElementById("bigProfit");
    if (bigProfitEl) bigProfitEl.innerHTML = `${currencySymbol}${biggestProfit.toFixed(2)}`;

    const bigLossEl = document.getElementById("bigLoss");
    if (bigLossEl) bigLossEl.innerHTML = `${currencySymbol}${biggestLoss.toFixed(2)}`;

    const tableBody = document.getElementById("recentTrades");
    if (tableBody) {
        tableBody.innerHTML = "";
        const recent = trades.slice(-5).reverse();
        if (recent.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No trades recorded yet. Add your first trade!</td></tr>`;
        } else {
            recent.forEach(trade => {
                const pnlVal = parseFloat(trade.pnl) || 0;
                const pnlClass = pnlVal >= 0 ? "profit" : "loss";
                tableBody.innerHTML += `
                    <tr>
                        <td><strong>${trade.stock || "-"}</strong></td>
                        <td>${trade.type || "BUY"}</td>
                        <td class="${pnlClass}">${currencySymbol}${pnlVal.toFixed(2)}</td>
                        <td>${trade.date || "-"}</td>
                    </tr>
                `;
            });
        }
    }

    renderWeeklyChart(trades);

    const tips = [
        "Always define your Risk per Trade before entering position.",
        "Never risk more than 1-2% of total capital on a single trade.",
        "Maintain a minimum 1:2 Risk-to-Reward ratio.",
        "Focus on execution quality over profit frequency.",
        "Avoid revenge trading after a losing trade.",
        "Discipline & consistency create long-term profitability.",
        "Capital protection always comes first.",
        "Stick strictly to your trading rules and setup parameters.",
        "Journal emotion & psychology for every trade.",
        "Patience and staying flat is also an active market position."
    ];
    const tipEl = document.getElementById("tradingTip");
    if (tipEl) {
        tipEl.innerHTML = tips[Math.floor(Math.random() * tips.length)];
    }
}

function renderWeeklyChart(trades) {
    const chartCanvas = document.getElementById("weeklyChart");
    if (!chartCanvas) return;

    const weekly = [0, 0, 0, 0, 0, 0, 0];
    trades.forEach(trade => {
        if (trade.date) {
            const d = new Date(trade.date).getDay();
            weekly[d] += (parseFloat(trade.pnl) || 0);
        }
    });

    const isDark = (document.documentElement.getAttribute("data-theme") === "dark");
    const barColors = weekly.map(val => val >= 0 ? "#10b981" : "#ef4444");

    if (window.myWeeklyChart) {
        window.myWeeklyChart.destroy();
    }

    window.myWeeklyChart = new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [{
                label: "Profit / Loss",
                data: weekly,
                backgroundColor: barColors,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: isDark ? "#94a3b8" : "#475569" }
                },
                y: {
                    grid: { color: isDark ? "#1e293b" : "#e2e8f0" },
                    ticks: { color: isDark ? "#94a3b8" : "#475569" }
                }
            }
        }
    });
}