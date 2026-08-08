// ==========================================
// TradeTrack Pro - Analytics Engine Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initTheme();
    initMobileNav();
    renderAnalytics();
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

function renderAnalytics() {
    const currencySymbol = localStorage.getItem("currency") || "₹";
    const trades = JSON.parse(localStorage.getItem("trades")) || [];

    let wins = 0;
    let losses = 0;
    let totalProfit = 0;

    let bestTrade = null;
    let worstTrade = null;
    let stockCount = {};
    let strategyData = {};
    let emotionData = {};
    let dayData = {};

    let biggestProfit = -Infinity;
    let biggestLoss = Infinity;

    let winStreak = 0;
    let lossStreak = 0;
    let currentWin = 0;
    let currentLoss = 0;

    trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) || 0;
        totalProfit += pnl;

        if (pnl >= 0) {
            wins++;
            currentWin++;
            currentLoss = 0;
        } else {
            losses++;
            currentLoss++;
            currentWin = 0;
        }

        if (currentWin > winStreak) winStreak = currentWin;
        if (currentLoss > lossStreak) lossStreak = currentLoss;

        if (bestTrade === null || pnl > bestTrade.pnl) bestTrade = { ...trade, pnl };
        if (worstTrade === null || pnl < worstTrade.pnl) worstTrade = { ...trade, pnl };

        if (pnl > biggestProfit) biggestProfit = pnl;
        if (pnl < biggestLoss) biggestLoss = pnl;

        if (trade.stock) {
            stockCount[trade.stock] = (stockCount[trade.stock] || 0) + 1;
        }

        if (trade.strategy) {
            strategyData[trade.strategy] = (strategyData[trade.strategy] || 0) + pnl;
        }

        if (trade.emotion) {
            emotionData[trade.emotion] = (emotionData[trade.emotion] || 0) + 1;
        }

        if (trade.date) {
            const dayName = new Date(trade.date).toLocaleDateString("en-US", { weekday: "long" });
            dayData[dayName] = (dayData[dayName] || 0) + pnl;
        }
    });

    // Handle initial state if empty
    if (biggestProfit === -Infinity) biggestProfit = 0;
    if (biggestLoss === Infinity) biggestLoss = 0;

    const totalTradesEl = document.getElementById("totalTrades");
    if (totalTradesEl) totalTradesEl.textContent = trades.length;

    const winningTradesEl = document.getElementById("winningTrades");
    if (winningTradesEl) winningTradesEl.textContent = wins;

    const losingTradesEl = document.getElementById("losingTrades");
    if (losingTradesEl) losingTradesEl.textContent = losses;

    const winRateEl = document.getElementById("winRate");
    if (winRateEl) {
        const rate = trades.length ? ((wins / trades.length) * 100).toFixed(1) : "0.0";
        winRateEl.textContent = `${rate}%`;
    }

    const netProfitEl = document.getElementById("netProfit");
    if (netProfitEl) {
        netProfitEl.textContent = `${currencySymbol}${totalProfit.toFixed(2)}`;
        netProfitEl.style.color = totalProfit >= 0 ? "var(--profit-color)" : "var(--loss-color)";
    }

    const avgPnlVal = trades.length ? (totalProfit / trades.length).toFixed(2) : "0.00";
    const avgProfitEl = document.getElementById("avgProfit");
    if (avgProfitEl) avgProfitEl.textContent = `${currencySymbol}${avgPnlVal}`;
    const avgProfitCardEl = document.getElementById("avgProfitCard");
    if (avgProfitCardEl) avgProfitCardEl.textContent = `${currencySymbol}${avgPnlVal}`;

    // Asset Metrics
    const bestStockEl = document.getElementById("bestStock");
    const bestStockProfitEl = document.getElementById("bestStockProfit");
    if (bestStockEl && bestTrade) {
        bestStockEl.textContent = bestTrade.stock || "-";
        if (bestStockProfitEl) bestStockProfitEl.textContent = `${currencySymbol}${bestTrade.pnl.toFixed(2)}`;
    }

    const worstStockEl = document.getElementById("worstStock");
    const worstStockLossEl = document.getElementById("worstStockLoss");
    if (worstStockEl && worstTrade) {
        worstStockEl.textContent = worstTrade.stock || "-";
        if (worstStockLossEl) worstStockLossEl.textContent = `${currencySymbol}${worstTrade.pnl.toFixed(2)}`;
    }

    let mostStock = "-";
    let mostCount = 0;
    for (let s in stockCount) {
        if (stockCount[s] > mostCount) {
            mostCount = stockCount[s];
            mostStock = s;
        }
    }
    const mostTradedEl = document.getElementById("mostTraded");
    if (mostTradedEl) mostTradedEl.textContent = mostStock;
    const tradeCountEl = document.getElementById("tradeCount");
    if (tradeCountEl) tradeCountEl.textContent = `${mostCount} Trades`;

    let bestDay = "-";
    let bestProfitDay = -Infinity;
    for (let d in dayData) {
        if (dayData[d] > bestProfitDay) {
            bestProfitDay = dayData[d];
            bestDay = d;
        }
    }
    if (bestProfitDay === -Infinity) bestProfitDay = 0;
    const bestDayEl = document.getElementById("bestDay");
    if (bestDayEl) bestDayEl.textContent = bestDay;
    const bestDayProfitEl = document.getElementById("bestDayProfit");
    if (bestDayProfitEl) bestDayProfitEl.textContent = `${currencySymbol}${bestProfitDay.toFixed(2)}`;

    // Strategy & Emotion
    let bestStrategy = "-";
    let bestStratProfit = -Infinity;
    let worstStrategy = "-";
    let worstStratLoss = Infinity;

    for (let st in strategyData) {
        if (strategyData[st] > bestStratProfit) {
            bestStratProfit = strategyData[st];
            bestStrategy = st;
        }
        if (strategyData[st] < worstStratLoss) {
            worstStratLoss = strategyData[st];
            worstStrategy = st;
        }
    }
    if (bestStratProfit === -Infinity) bestStratProfit = 0;
    if (worstStratLoss === Infinity) worstStratLoss = 0;

    const bestStratEl = document.getElementById("bestStrategy");
    if (bestStratEl) bestStratEl.textContent = bestStrategy;
    const stratProfitEl = document.getElementById("strategyProfit");
    if (stratProfitEl) stratProfitEl.textContent = `${currencySymbol}${bestStratProfit.toFixed(2)}`;

    const worstStratEl = document.getElementById("worstStrategy");
    if (worstStratEl) worstStratEl.textContent = worstStrategy;
    const worstStratLossEl = document.getElementById("worstStrategyLoss");
    if (worstStratLossEl) worstStratLossEl.textContent = `${currencySymbol}${worstStratLoss.toFixed(2)}`;

    let topEmotion = "-";
    let topEmotionCount = 0;
    for (let e in emotionData) {
        if (emotionData[e] > topEmotionCount) {
            topEmotionCount = emotionData[e];
            topEmotion = e;
        }
    }
    const topEmotionEl = document.getElementById("topEmotion");
    if (topEmotionEl) topEmotionEl.textContent = topEmotion;
    const emotionCountEl = document.getElementById("emotionCount");
    if (emotionCountEl) emotionCountEl.textContent = `${topEmotionCount} Trades`;

    // Streaks & PnL extremes
    const bigProfitEl = document.getElementById("bigProfit");
    if (bigProfitEl) bigProfitEl.textContent = `${currencySymbol}${biggestProfit.toFixed(2)}`;

    const bigLossEl = document.getElementById("bigLoss");
    if (bigLossEl) bigLossEl.textContent = `${currencySymbol}${biggestLoss.toFixed(2)}`;

    const winStreakEl = document.getElementById("winStreak");
    if (winStreakEl) winStreakEl.textContent = winStreak;

    const lossStreakEl = document.getElementById("lossStreak");
    if (lossStreakEl) lossStreakEl.textContent = lossStreak;

    // Strategy & Emotion Tables
    const strategyTable = document.getElementById("strategyTable");
    if (strategyTable) {
        strategyTable.innerHTML = "";
        for (let st in strategyData) {
            strategyTable.innerHTML += `
                <tr>
                    <td><strong>${st}</strong></td>
                    <td style="color:${strategyData[st] >= 0 ? "var(--profit-color)" : "var(--loss-color)"}; font-weight:600;">
                        ${currencySymbol}${strategyData[st].toFixed(2)}
                    </td>
                </tr>
            `;
        }
    }

    const emotionTable = document.getElementById("emotionTable");
    if (emotionTable) {
        emotionTable.innerHTML = "";
        for (let em in emotionData) {
            emotionTable.innerHTML += `
                <tr>
                    <td><strong>${em}</strong></td>
                    <td>${emotionData[em]} Trades</td>
                </tr>
            `;
        }
    }

    // AI Smart Insights
    const insightList = document.getElementById("insightList");
    if (insightList) {
        insightList.innerHTML = "";
        if (trades.length === 0) {
            insightList.innerHTML = "<li>No trades available. Start logging trades to unlock AI insights!</li>";
        } else {
            if (totalProfit > 0) {
                insightList.innerHTML += "<li>✅ <strong>Overall Performance:</strong> Your portfolio is in net profit. Maintain your core discipline.</li>";
            } else {
                insightList.innerHTML += "<li>⚠️ <strong>Overall Performance:</strong> Your portfolio is currently at a loss. Review risk per trade.</li>";
            }

            if (wins >= losses) {
                insightList.innerHTML += `<li>🏆 <strong>Win Rate:</strong> Solid execution! Winning trades count (${wins}) exceeds losing trades (${losses}).</li>`;
            } else {
                insightList.innerHTML += `<li>📉 <strong>Win Rate Alert:</strong> Your losing trades (${losses}) outnumber wins (${wins}). Focus on higher R:R setups.</li>`;
            }

            if (bestTrade) {
                insightList.innerHTML += `<li>🔥 <strong>Top Winner:</strong> ${bestTrade.stock} delivered your best trade (${currencySymbol}${bestTrade.pnl.toFixed(2)}).</li>`;
            }

            if (bestStrategy !== "-") {
                insightList.innerHTML += `<li>🎯 <strong>Core Strategy:</strong> "${bestStrategy}" is your most profitable strategy.</li>`;
            }

            if (topEmotion !== "-") {
                insightList.innerHTML += `<li>😊 <strong>Psychology Trend:</strong> "${topEmotion}" is your predominant trade emotion.</li>`;
            }
        }
    }

    renderCharts(trades, wins, losses);
}

function renderCharts(trades, wins, losses) {
    const isDark = (document.documentElement.getAttribute("data-theme") === "dark");

    // Weekly Chart
    const weeklyCanvas = document.getElementById("weeklyChart");
    if (weeklyCanvas) {
        const week = [0, 0, 0, 0, 0, 0, 0];
        trades.forEach(t => {
            if (t.date) {
                const d = new Date(t.date).getDay();
                week[d] += (parseFloat(t.pnl) || 0);
            }
        });

        if (window.myWeeklyChart) window.myWeeklyChart.destroy();
        window.myWeeklyChart = new Chart(weeklyCanvas, {
            type: "bar",
            data: {
                labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                datasets: [{
                    label: "Weekly P&L",
                    data: week,
                    backgroundColor: week.map(v => v >= 0 ? "#10b981" : "#ef4444"),
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: isDark ? "#94a3b8" : "#475569" } },
                    y: { grid: { color: isDark ? "#1e293b" : "#e2e8f0" }, ticks: { color: isDark ? "#94a3b8" : "#475569" } }
                }
            }
        });
    }

    // Monthly Chart
    const monthlyCanvas = document.getElementById("monthlyChart");
    if (monthlyCanvas) {
        const month = new Array(12).fill(0);
        trades.forEach(t => {
            if (t.date) {
                const m = new Date(t.date).getMonth();
                month[m] += (parseFloat(t.pnl) || 0);
            }
        });

        if (window.myMonthlyChart) window.myMonthlyChart.destroy();
        window.myMonthlyChart = new Chart(monthlyCanvas, {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: "Monthly P&L",
                    data: month,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: isDark ? "#94a3b8" : "#475569" } },
                    y: { grid: { color: isDark ? "#1e293b" : "#e2e8f0" }, ticks: { color: isDark ? "#94a3b8" : "#475569" } }
                }
            }
        });
    }

    // Win/Loss Pie Chart
    const pieCanvas = document.getElementById("pieChart");
    if (pieCanvas) {
        if (window.myPieChart) window.myPieChart.destroy();
        window.myPieChart = new Chart(pieCanvas, {
            type: "doughnut",
            data: {
                labels: ["Winning Trades", "Losing Trades"],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ["#10b981", "#ef4444"],
                    borderWidth: 2,
                    borderColor: isDark ? "#161f30" : "#ffffff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: isDark ? "#f8fafc" : "#0f172a" }
                    }
                }
            }
        });
    }
}