// ==========================================
// TradeTrack Pro - Trade History Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initAuthCheck();
    initTheme();
    initMobileNav();
    loadTrades();
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

const currencySymbol = localStorage.getItem("currency") || "₹";

function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatNotes(notes, index) {
    if (!notes) return '<span class="no-notes">-</span>';
    const limit = 40;
    if (notes.length <= limit) {
        return `<span class="note-text-container">${escapeHTML(notes)}</span>`;
    }
    const visiblePart = notes.substring(0, limit);
    const hiddenPart = notes.substring(limit);
    return `
        <span class="note-text-container">
            <span class="note-visible">${escapeHTML(visiblePart)}</span><span class="note-hidden hidden" id="note-hidden-${index}">${escapeHTML(hiddenPart)}</span><span class="note-ellipsis" id="note-ellipsis-${index}">...</span>
            <button class="view-more-btn" id="note-toggle-${index}" onclick="toggleNote(${index}); event.stopPropagation();">View More</button>
        </span>
    `;
}

window.toggleNote = function(index) {
    const hiddenSpan = document.getElementById(`note-hidden-${index}`);
    const ellipsisSpan = document.getElementById(`note-ellipsis-${index}`);
    const toggleBtn = document.getElementById(`note-toggle-${index}`);
    if (hiddenSpan && ellipsisSpan && toggleBtn) {
        if (hiddenSpan.classList.contains("hidden")) {
            hiddenSpan.classList.remove("hidden");
            ellipsisSpan.classList.add("hidden");
            toggleBtn.textContent = "View Less";
        } else {
            hiddenSpan.classList.add("hidden");
            ellipsisSpan.classList.remove("hidden");
            toggleBtn.textContent = "View More";
        }
    }
};

window.openNotesModal = function(index) {
    const trades = JSON.parse(localStorage.getItem("trades")) || [];
    const trade = trades[index];
    if (!trade) return;
    
    const stockEl = document.getElementById("modalStock");
    if (stockEl) stockEl.textContent = trade.stock || "N/A";

    const badge = document.getElementById("modalTypeBadge");
    if (badge) {
        badge.textContent = trade.type || "BUY";
        badge.className = `badge ${trade.type === "BUY" ? "buy-badge" : "sell-badge"}`;
    }
    
    const entryEl = document.getElementById("modalEntry");
    if (entryEl) entryEl.textContent = currencySymbol + Number(trade.entry || 0).toFixed(2);

    const exitEl = document.getElementById("modalExit");
    if (exitEl) exitEl.textContent = currencySymbol + Number(trade.exit || 0).toFixed(2);

    const qtyEl = document.getElementById("modalQty");
    if (qtyEl) qtyEl.textContent = trade.quantity || 0;
    
    const pnl = Number(trade.pnl) || 0;
    const pnlEl = document.getElementById("modalPnL");
    if (pnlEl) {
        pnlEl.textContent = currencySymbol + pnl.toFixed(2);
        pnlEl.className = `stat-val ${pnl >= 0 ? "profit" : "loss"}`;
    }
    
    const reasonEl = document.getElementById("modalReason");
    if (reasonEl) reasonEl.textContent = trade.strategy || "General Setup";

    const notesEl = document.getElementById("modalNotes");
    if (notesEl) notesEl.textContent = trade.notes || "No additional notes recorded.";
    
    const modal = document.getElementById("notesModal");
    if (modal) {
        modal.classList.remove("hidden");
    }
};

window.closeNotesModal = function() {
    const modal = document.getElementById("notesModal");
    if (modal) {
        modal.classList.add("hidden");
    }
};

function loadTrades() {
    const tradeTable = document.getElementById("tradeTable");
    if (!tradeTable) return;

    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    tradeTable.innerHTML = "";

    if (trades.length === 0) {
        tradeTable.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center; padding: 30px; color: var(--text-muted);">
                    No Trades Found 📭<br><small>Click 'Add Trade' to start tracking your journey.</small>
                </td>
            </tr>
        `;
        return;
    }

    trades.forEach((trade, index) => {
        const pnlVal = Number(trade.pnl) || 0;
        const pnlClass = pnlVal >= 0 ? "profit" : "loss";

        tradeTable.innerHTML += `
        <tr>
            <td>
                <a href="#" style="text-decoration: none; color: var(--accent-blue); font-weight: 600;" onclick="openNotesModal(${index}); return false;">
                    ${escapeHTML(trade.stock)}
                </a>
            </td>
            <td><strong>${trade.type}</strong></td>
            <td>${currencySymbol}${Number(trade.entry || 0).toFixed(2)}</td>
            <td>${currencySymbol}${Number(trade.exit || 0).toFixed(2)}</td>
            <td>${trade.quantity || 0}</td>
            <td class="${pnlClass}">${currencySymbol}${pnlVal.toFixed(2)}</td>
            <td>${escapeHTML(trade.strategy || "-")}</td>
            <td>${escapeHTML(trade.emotion || "-")}</td>
            <td>${trade.date || "-"}</td>
            <td>${formatNotes(trade.notes, index)}</td>
            <td>
                <button class="edit-btn" onclick="editTrade(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTrade(${index})">Delete</button>
            </td>
        </tr>
        `;
    });
}

window.deleteTrade = function(index) {
    if (!confirm("Are you sure you want to delete this trade record?")) {
        return;
    }
    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    trades.splice(index, 1);
    localStorage.setItem("trades", JSON.stringify(trades));
    loadTrades();
};

window.editTrade = function(index) {
    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    localStorage.setItem("editTradeIndex", index);
    localStorage.setItem("editTradeData", JSON.stringify(trades[index]));
    window.location.href = "addTrade.html";
};