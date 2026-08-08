/**
 * TradeTrack Pro - Main Application Utilities & Global Handlers
 * Theme Switcher, Mobile Navigation Drawer, Toast Notifications, API Sync
 */

// ==========================================
// Theme Manager (Dark / Light Mode)
// ==========================================
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem("tradetrack_theme") || 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    this.setTheme(savedTheme);

    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => this.toggleTheme());
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("tradetrack_theme", theme);
    this.updateToggleUI(theme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    this.setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode 🌓`, "info");
  },

  updateToggleUI(theme) {
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      const icon = btn.querySelector(".theme-icon");
      const text = btn.querySelector(".theme-text");
      if (theme === "dark") {
        if (icon) icon.textContent = "☀️";
        if (text) text.textContent = "Light";
      } else {
        if (icon) icon.textContent = "🌙";
        if (text) text.textContent = "Dark";
      }
    });
  }
};

// ==========================================
// Mobile Navigation Drawer Manager
// ==========================================
const MobileNavManager = {
  init() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const drawer = document.getElementById("mobileDrawer");
    const closeBtn = document.getElementById("mobileDrawerClose");

    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", () => {
        drawer.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener("click", () => {
        drawer.classList.remove("open");
        document.body.style.overflow = "";
      });
    }

    if (drawer) {
      drawer.addEventListener("click", (e) => {
        if (e.target === drawer) {
          drawer.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    }
  }
};

// ==========================================
// Toast Notification Helper
// ==========================================
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// Data Store (API + LocalStorage Sync)
// ==========================================
const DataStore = {
  getTrades() {
    try {
      const local = localStorage.getItem("trades");
      if (local) return JSON.parse(local);
    } catch (e) {
      console.error("LocalStorage parse error", e);
    }
    return [];
  },

  setTrades(trades) {
    localStorage.setItem("trades", JSON.stringify(trades));
  },

  async syncWithBackend() {
    try {
      const res = await fetch("/api/trades");
      const data = await res.json();
      if (data.success && Array.isArray(data.trades) && data.trades.length > 0) {
        this.setTrades(data.trades);
      } else {
        // Push local trades to backend if backend empty
        const local = this.getTrades();
        if (local.length > 0) {
          await fetch("/api/trades/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(local)
          });
        }
      }
    } catch (err) {
      console.log("Offline mode or backend API unreachable, using LocalStorage.");
    }
  },

  async saveTrade(trade) {
    let trades = this.getTrades();
    const existingIndex = trades.findIndex(t => t.id === trade.id);
    if (existingIndex !== -1) {
      trades[existingIndex] = trade;
    } else {
      trades.push(trade);
    }
    this.setTrades(trades);

    try {
      await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trade)
      });
    } catch (err) {
      console.log("Saved trade locally");
    }
  },

  async deleteTrade(tradeId) {
    let trades = this.getTrades();
    trades = trades.filter(t => t.id !== tradeId);
    this.setTrades(trades);

    try {
      await fetch(`/api/trades/${tradeId}`, { method: "DELETE" });
    } catch (err) {
      console.log("Deleted trade locally");
    }
  }
};

// ==========================================
// Authentication Helper
// ==========================================
const AuthManager = {
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || { username: "Trader", fullName: "Trader" };
    } catch (e) {
      return { username: "Trader", fullName: "Trader" };
    }
  },

  checkAuth(protectedPages = ["/dashboard", "/add-trade", "/history", "/analytics", "/risk-calculator", "/settings"]) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const path = window.location.pathname;
    const isProtected = protectedPages.some(p => path.endsWith(p));

    if (isProtected && !isLoggedIn) {
      localStorage.setItem("authMessage", "Please login first to continue.");
      window.location.href = "/";
    }
  },

  logout() {
    if (confirm("Are you sure you want to log out of TradeTrack Pro?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("editTradeIndex");
      localStorage.removeItem("editTradeData");
      window.location.href = "/";
    }
  }
};

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  MobileNavManager.init();
  AuthManager.checkAuth();
  DataStore.syncWithBackend();
});
