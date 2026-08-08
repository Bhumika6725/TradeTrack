/**
 * TradeTrack Pro - Dashboard JS
 * Dynamic summary statistics, Chart.js Weekly Performance bar chart, recent trades list, and trading tips
 */

document.addEventListener("DOMContentLoaded", () => {
  const trades = DataStore.getTrades();
  const user = AuthManager.getCurrentUser();

  // 1. Welcome Header & Date
  const welcomeText = document.getElementById("welcomeText");
  const todayDate = document.getElementById("todayDate");
  if (welcomeText) welcomeText.textContent = `Welcome back, ${user.fullName || 'Trader'} 👋`;
  if (todayDate) todayDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // 2. Metrics calculation
  let totalTrades = trades.length;
  let netProfit = 0;
  let todayProfit = 0;
  let wins = 0;
  let losses = 0;
  let biggestProfit = 0;
  let biggestLoss = 0;
  let stockProfit = {};
  let strategyProfit = {};
  const todayStr = new Date().toISOString().split("T")[0];

  trades.forEach(trade => {
    const pnl = Number(trade.pnl) || 0;
    netProfit += pnl;

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

  // Calculate Win Rate
  const winRate = totalTrades === 0 ? 0 : ((wins / totalTrades) * 100).toFixed(1);

  // Best Stock & Strategy
  let bestStock = "-";
  let maxStockProfit = -Infinity;
  for (let s in stockProfit) {
    if (stockProfit[s] > maxStockProfit) {
      maxStockProfit = stockProfit[s];
      bestStock = s;
    }
  }

  let bestStrategy = "-";
  let maxStratProfit = -Infinity;
  for (let st in strategyProfit) {
    if (strategyProfit[st] > maxStratProfit) {
      maxStratProfit = strategyProfit[st];
      bestStrategy = st;
    }
  }

  // Populate Dashboard Summary Cards
  const elTotalTrades = document.getElementById("totalTrades");
  const elNetProfit = document.getElementById("netProfit");
  const elTodayProfit = document.getElementById("todayProfit");
  const elWinRate = document.getElementById("winRate");
  const elBestStock = document.getElementById("bestStock");
  const elBestStrategy = document.getElementById("bestStrategy");
  const elBigProfit = document.getElementById("bigProfit");
  const elBigLoss = document.getElementById("bigLoss");

  if (elTotalTrades) elTotalTrades.textContent = totalTrades;
  if (elNetProfit) {
    elNetProfit.textContent = `₹${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    elNetProfit.className = `card-value ${netProfit >= 0 ? 'text-profit' : 'text-loss'}`;
  }
  if (elTodayProfit) {
    elTodayProfit.textContent = `₹${todayProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    elTodayProfit.className = `card-value ${todayProfit >= 0 ? 'text-profit' : 'text-loss'}`;
  }
  if (elWinRate) elWinRate.textContent = `${winRate}%`;

  if (elBestStock) elBestStock.textContent = bestStock;
  if (elBestStrategy) elBestStrategy.textContent = bestStrategy;
  if (elBigProfit) elBigProfit.textContent = `₹${biggestProfit.toFixed(2)}`;
  if (elBigLoss) elBigLoss.textContent = `₹${biggestLoss.toFixed(2)}`;

  // 3. Render Recent Trades Table
  const recentTable = document.getElementById("recentTradesTable");
  if (recentTable) {
    recentTable.innerHTML = "";
    if (trades.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem;" class="text-muted">No trades recorded yet. Start by logging your first trade! 📈</td></tr>`;
    } else {
      const recentTrades = trades.slice(-5).reverse();
      recentTrades.forEach(trade => {
        const tr = document.createElement("tr");
        const pnlClass = trade.pnl >= 0 ? "text-profit" : "text-loss";
        const badgeClass = trade.type === "BUY" ? "badge-profit" : "badge-loss";
        tr.innerHTML = `
          <td><strong>${trade.stock || 'N/A'}</strong></td>
          <td><span class="badge ${badgeClass}">${trade.type || 'BUY'}</span></td>
          <td class="${pnlClass} font-semibold">₹${Number(trade.pnl).toFixed(2)}</td>
          <td>${trade.strategy || 'General'}</td>
          <td class="text-muted">${trade.date || ''}</td>
        `;
        recentTable.appendChild(tr);
      });
    }
  }

  // 4. Render Weekly Chart
  const weeklyCanvas = document.getElementById("weeklyChart");
  if (weeklyCanvas && typeof Chart !== "undefined") {
    const dayPnL = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    trades.forEach(t => {
      if (t.date) {
        const d = new Date(t.date).getDay();
        dayPnL[d] += Number(t.pnl) || 0;
      }
    });

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";

    new Chart(weeklyCanvas, {
      type: "bar",
      data: {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [{
          label: "PnL (₹)",
          data: dayPnL,
          backgroundColor: dayPnL.map(val => val >= 0 ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)"),
          borderColor: dayPnL.map(val => val >= 0 ? "#10b981" : "#ef4444"),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` PnL: ₹${context.raw.toFixed(2)}`
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  }

  // 5. Random Trading Tip
  const tips = [
    "Always define your Risk-to-Reward ratio (aim for 1:2 minimum) before entering a trade.",
    "Never risk more than 1-2% of your total trading capital on a single trade.",
    "Stick strictly to your Stop Loss. Protective stops preserve your long-term survival.",
    "Avoid revenge trading after a loss. Step back, clear your mind, and evaluate your plan.",
    "Quality of execution beats quantity of trades. Patience is key in trading.",
    "Keep emotions out of execution. Execute trades like a business rule set.",
    "Always journal entry, exit, strategy, and emotion to identify bad trading habits."
  ];

  const tradingTipEl = document.getElementById("tradingTip");
  if (tradingTipEl) {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tradingTipEl.textContent = `💡 Trading Rule: "${randomTip}"`;
  }
});
