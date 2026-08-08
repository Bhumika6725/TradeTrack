/**
 * TradeTrack Pro - Analytics JS
 * Chart.js Integration (Weekly, Monthly, Win/Loss Pie), Metrics, Win/Loss Streaks, Smart AI Insights
 */

document.addEventListener("DOMContentLoaded", () => {
  const trades = DataStore.getTrades();
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";

  // 1. Calculations
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;
  let bestTrade = null;
  let worstTrade = null;
  let stockCount = {};
  let strategyData = {};
  let emotionData = {};
  let dayData = {};
  let monthData = new Array(12).fill(0);
  let weekData = new Array(7).fill(0);

  let winStreak = 0;
  let lossStreak = 0;
  let currentWin = 0;
  let currentLoss = 0;

  trades.forEach(trade => {
    const pnl = Number(trade.pnl) || 0;
    totalProfit += pnl;

    if (pnl >= 0) {
      wins++;
      currentWin++;
      currentLoss = 0;
      if (currentWin > winStreak) winStreak = currentWin;
    } else {
      losses++;
      currentLoss++;
      currentWin = 0;
      if (currentLoss > lossStreak) lossStreak = currentLoss;
    }

    if (!bestTrade || pnl > Number(bestTrade.pnl)) bestTrade = trade;
    if (!worstTrade || pnl < Number(worstTrade.pnl)) worstTrade = trade;

    if (trade.stock) stockCount[trade.stock] = (stockCount[trade.stock] || 0) + 1;
    if (trade.strategy) strategyData[trade.strategy] = (strategyData[trade.strategy] || 0) + pnl;
    if (trade.emotion) emotionData[trade.emotion] = (emotionData[trade.emotion] || 0) + 1;

    if (trade.date) {
      const d = new Date(trade.date);
      if (!isNaN(d.getTime())) {
        dayData[d.toLocaleDateString("en-US", { weekday: "long" })] = (dayData[d.toLocaleDateString("en-US", { weekday: "long" })] || 0) + pnl;
        weekData[d.getDay()] += pnl;
        monthData[d.getMonth()] += pnl;
      }
    }
  });

  const totalTrades = trades.length;
  const winRateVal = totalTrades === 0 ? "0%" : `${((wins / totalTrades) * 100).toFixed(1)}%`;
  const avgProfitVal = totalTrades === 0 ? "₹0.00" : `₹${(totalProfit / totalTrades).toFixed(2)}`;

  // Populate Metric Cards
  const setEl = (id, val, pnlColor = false) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = val;
      if (pnlColor && typeof val === "string" && val.includes("₹")) {
        const num = parseFloat(val.replace("₹", "").replace(/,/g, ""));
        el.className = `card-value ${num >= 0 ? 'text-profit' : 'text-loss'}`;
      }
    }
  };

  setEl("totalTrades", totalTrades);
  setEl("winningTrades", wins);
  setEl("losingTrades", losses);
  setEl("winRate", winRateVal);
  setEl("netProfit", `₹${totalProfit.toFixed(2)}`, true);
  setEl("avgProfit", avgProfitVal);

  setEl("bestStock", bestTrade ? bestTrade.stock : "-");
  setEl("bestStockProfit", bestTrade ? `₹${Number(bestTrade.pnl).toFixed(2)}` : "₹0.00", true);
  setEl("worstStock", worstTrade ? worstTrade.stock : "-");
  setEl("worstStockLoss", worstTrade ? `₹${Number(worstTrade.pnl).toFixed(2)}` : "₹0.00", true);

  // Most Traded Stock
  let mostStock = "-";
  let mostCount = 0;
  for (let s in stockCount) {
    if (stockCount[s] > mostCount) {
      mostCount = stockCount[s];
      mostStock = s;
    }
  }
  setEl("mostTraded", mostStock);
  setEl("tradeCount", `${mostCount} Trades`);

  // Streaks
  setEl("winStreak", winStreak);
  setEl("lossStreak", lossStreak);

  // 2. Charts Initialization
  if (typeof Chart !== "undefined") {
    // Weekly Chart
    const weeklyCanvas = document.getElementById("weeklyChart");
    if (weeklyCanvas) {
      new Chart(weeklyCanvas, {
        type: "bar",
        data: {
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [{
            label: "Weekly Profit (₹)",
            data: weekData,
            backgroundColor: weekData.map(v => v >= 0 ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)"),
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { color: textColor } }, y: { ticks: { color: textColor }, grid: { color: gridColor } } }
        }
      });
    }

    // Monthly Chart
    const monthlyCanvas = document.getElementById("monthlyChart");
    if (monthlyCanvas) {
      new Chart(monthlyCanvas, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [{
            label: "Monthly PnL (₹)",
            data: monthData,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.35,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { color: textColor } }, y: { ticks: { color: textColor }, grid: { color: gridColor } } }
        }
      });
    }

    // Pie Chart
    const pieCanvas = document.getElementById("pieChart");
    if (pieCanvas) {
      new Chart(pieCanvas, {
        type: "doughnut",
        data: {
          labels: ["Winning Trades", "Losing Trades"],
          datasets: [{
            data: [wins, losses],
            backgroundColor: ["#10b981", "#ef4444"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor } } }
        }
      });
    }
  }

  // 3. Render Strategy Table
  const stratTable = document.getElementById("strategyTableBody");
  if (stratTable) {
    stratTable.innerHTML = "";
    const stratKeys = Object.keys(strategyData);
    if (stratKeys.length === 0) {
      stratTable.innerHTML = `<tr><td colspan="2" class="text-muted text-center">No strategy data yet</td></tr>`;
    } else {
      stratKeys.forEach(st => {
        const val = strategyData[st];
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${st}</strong></td>
          <td class="${val >= 0 ? 'text-profit' : 'text-loss'} font-semibold">₹${val.toFixed(2)}</td>
        `;
        stratTable.appendChild(tr);
      });
    }
  }

  // 4. Render Emotion Table
  const emotionTable = document.getElementById("emotionTableBody");
  if (emotionTable) {
    emotionTable.innerHTML = "";
    const emotionKeys = Object.keys(emotionData);
    if (emotionKeys.length === 0) {
      emotionTable.innerHTML = `<tr><td colspan="2" class="text-muted text-center">No emotion data logged</td></tr>`;
    } else {
      emotionKeys.forEach(em => {
        const count = emotionData[em];
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span class="badge badge-neutral">${em}</span></td>
          <td><strong>${count} trades</strong></td>
        `;
        emotionTable.appendChild(tr);
      });
    }
  }

  // 5. Smart AI Insights Generator
  const insightList = document.getElementById("insightList");
  if (insightList) {
    insightList.innerHTML = "";
    if (trades.length === 0) {
      insightList.innerHTML = `<li class="text-muted">No trade logs available to generate smart insights.</li>`;
    } else {
      const insights = [];

      if (totalProfit > 0) {
        insights.push(`<li>✅ <strong>Overall Profitability:</strong> Your journal shows a positive net PnL of ₹${totalProfit.toFixed(2)}. Excellent discipline!</li>`);
      } else {
        insights.push(`<li>⚠️ <strong>Overall Drawdown:</strong> Current net PnL is in loss (-₹${Math.abs(totalProfit).toFixed(2)}). Re-assess your stop loss rules.</li>`);
      }

      if (wins >= losses) {
        insights.push(`<li>🏆 <strong>Win Consistency:</strong> Winning trades (${wins}) outnumber losing trades (${losses}). Maintain your high probability setups.</li>`);
      } else {
        insights.push(`<li>📉 <strong>Win Rate Alert:</strong> Win rate is at ${winRateVal}. Ensure your risk-reward ratio is at least 1:2 to stay profitable.</li>`);
      }

      if (bestTrade) {
        insights.push(`<li>🔥 <strong>Top Performer:</strong> Best trade was <strong>${bestTrade.stock}</strong> yielding +₹${Number(bestTrade.pnl).toFixed(2)}.</li>`);
      }

      if (winStreak > 2) {
        insights.push(`<li>⚡ <strong>Hot Streak:</strong> Longest winning streak is <strong>${winStreak} consecutive trades</strong>. Beware of overconfidence!</li>`);
      }

      insightList.innerHTML = insights.join("");
    }
  }
});
