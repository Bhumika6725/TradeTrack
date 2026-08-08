// ==========================================
// TradeTrack Pro
// Trade History
// ==========================================
// ==============================
// Apply Saved Theme
// ==============================

if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href = "index.html";

}
const tradeTable = document.getElementById("tradeTable");

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
    const limit = 50;
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
    
    document.getElementById("modalStock").textContent = trade.stock || "N/A";
    const badge = document.getElementById("modalTypeBadge");
    if (badge) {
        badge.textContent = trade.type || "BUY";
        badge.className = `badge ${trade.type === "BUY" ? "buy-badge" : "sell-badge"}`;
    }
    
    document.getElementById("modalEntry").textContent = currencySymbol + Number(trade.entry || 0).toFixed(2);
    document.getElementById("modalExit").textContent = currencySymbol + Number(trade.exit || 0).toFixed(2);
    document.getElementById("modalQty").textContent = trade.quantity || 0;
    
    const pnl = Number(trade.pnl) || 0;
    const pnlEl = document.getElementById("modalPnL");
    if (pnlEl) {
        pnlEl.textContent = currencySymbol + pnl.toFixed(2);
        pnlEl.className = `stat-val ${pnl >= 0 ? "profit" : "loss"}`;
    }
    
    document.getElementById("modalReason").textContent = trade.strategy || "General";
    document.getElementById("modalNotes").textContent = trade.notes || "No notes added";
    document.getElementById("modalLessons").textContent = trade.emotion || "Neutral";
    
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

// =========================
// Load Trades
// =========================

function loadTrades() {

    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    tradeTable.innerHTML = "";

    if (trades.length === 0) {

        tradeTable.innerHTML = `
            <tr>
                <td colspan="15">No Trades Found 📭</td>
            </tr>
        `;

        return;
    }

    trades.forEach((trade, index) => {

        const pnlClass = trade.pnl >= 0 ? "profit" : "loss";

        tradeTable.innerHTML += `

        <tr>

            <td>
                <a href="#" style="text-decoration: none; color: #2563eb; font-weight: 600;" onclick="openNotesModal(${index}); return false;">
                    ${trade.stock}
                </a>
            </td>

            <td>${trade.type}</td>

            <td>${currencySymbol}${trade.entry}</td>

            <td>${currencySymbol}${trade.exit}</td>

            <td>${trade.quantity}</td>


            <td class="${pnlClass}">
                ${currencySymbol}${trade.pnl}
            </td>

            <td>${trade.strategy}</td>

            <td>${trade.emotion}</td>

            <td>${trade.date}</td>

            <td>
                ${formatNotes(trade.notes, index)}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editTrade(${index})">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTrade(${index})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// =========================
// Delete Trade
// =========================

function deleteTrade(index) {

    if (!confirm("Delete this trade?")) {

        return;

    }

    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    trades.splice(index, 1);

    localStorage.setItem("trades", JSON.stringify(trades));

    loadTrades();

}

// =========================
// Edit Trade
// =========================

function editTrade(index) {

    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    localStorage.setItem("editTradeIndex", index);

    localStorage.setItem("editTradeData", JSON.stringify(trades[index]));

    alert("Opening trade for editing...");

    window.location.href = "addTrade.html";

}

// =========================
// Load Page
// =========================

loadTrades();