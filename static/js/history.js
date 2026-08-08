/**
 * TradeTrack Pro - Trade History JS
 * Search, filter, sorting, table pagination, edit, and delete functionality
 */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("tradeTableBody");
  const searchInput = document.getElementById("searchTrade");
  const filterTypeSelect = document.getElementById("filterType");
  const filterPnLSelect = document.getElementById("filterPnL");
  const sortSelect = document.getElementById("sortTrades");

  let allTrades = DataStore.getTrades();

  function renderTable() {
    if (!tableBody) return;

    allTrades = DataStore.getTrades();
    let filtered = [...allTrades];

    // Search filter
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    if (searchTerm) {
      filtered = filtered.filter(t => 
        (t.stock && t.stock.toLowerCase().includes(searchTerm)) ||
        (t.strategy && t.strategy.toLowerCase().includes(searchTerm)) ||
        (t.emotion && t.emotion.toLowerCase().includes(searchTerm))
      );
    }

    // Type filter
    const typeVal = filterTypeSelect ? filterTypeSelect.value : "ALL";
    if (typeVal !== "ALL") {
      filtered = filtered.filter(t => t.type === typeVal);
    }

    // PnL filter
    const pnlVal = filterPnLSelect ? filterPnLSelect.value : "ALL";
    if (pnlVal === "PROFIT") {
      filtered = filtered.filter(t => Number(t.pnl) >= 0);
    } else if (pnlVal === "LOSS") {
      filtered = filtered.filter(t => Number(t.pnl) < 0);
    }

    // Sort
    const sortVal = sortSelect ? sortSelect.value : "date-desc";
    filtered.sort((a, b) => {
      if (sortVal === "date-desc") return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortVal === "date-asc") return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortVal === "pnl-desc") return (Number(b.pnl) || 0) - (Number(a.pnl) || 0);
      if (sortVal === "pnl-asc") return (Number(a.pnl) || 0) - (Number(b.pnl) || 0);
      return 0;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2rem;" class="text-muted">
            📭 No trades found matching your filters.
          </td>
        </tr>
      `;
      return;
    }

    const currencySymbol = localStorage.getItem("currency") || "₹";

    window.escapeHTML = function(str) {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    window.formatNotes = function(notes, id) {
      if (!notes) return '<span class="text-gray-400 italic text-xs">-</span>';
      const limit = 50;
      if (notes.length <= limit) {
        return `<span class="text-xs text-gray-700 dark:text-gray-300">${window.escapeHTML(notes)}</span>`;
      }
      const visiblePart = notes.substring(0, limit);
      const hiddenPart = notes.substring(limit);
      return `
        <span class="text-xs text-gray-700 dark:text-gray-300">
          <span>${window.escapeHTML(visiblePart)}</span><span class="hidden" id="note-hidden-${id}">${window.escapeHTML(hiddenPart)}</span><span id="note-ellipsis-${id}">...</span>
          <button class="text-xs font-semibold text-blue-600 dark:text-blue-400 ml-1 underline focus:outline-none view-more-btn" id="note-toggle-${id}" onclick="toggleNote(${id}); event.stopPropagation();">View More</button>
        </span>
      `;
    };

    window.toggleNote = function(id) {
      const hiddenSpan = document.getElementById(`note-hidden-${id}`);
      const ellipsisSpan = document.getElementById(`note-ellipsis-${id}`);
      const toggleBtn = document.getElementById(`note-toggle-${id}`);
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

    filtered.forEach((trade) => {
      const tr = document.createElement("tr");
      const pnl = Number(trade.pnl) || 0;
      const pnlClass = pnl >= 0 ? "text-profit" : "text-loss";
      const typeBadge = trade.type === "BUY" ? "badge-profit" : "badge-loss";
      
      const tradeNotesText = (trade.trade_notes || trade.notes || "").trim();
      const lessonsText = (trade.lessons_learned || "").trim();
      const reasonText = (trade.reason || trade.why_entered || trade.strategy || "").trim();

      tr.innerHTML = `
        <td><strong>${trade.stock || 'N/A'}</strong></td>
        <td><span class="badge ${typeBadge}">${trade.type || 'BUY'}</span></td>
        <td>${currencySymbol}${Number(trade.entry || 0).toFixed(2)}</td>
        <td>${currencySymbol}${Number(trade.exit || 0).toFixed(2)}</td>
        <td>${trade.quantity || 0}</td>
        <td class="${pnlClass} font-semibold">${currencySymbol}${pnl.toFixed(2)}</td>
        <td>${trade.strategy || 'General'}</td>
        <td><span class="badge badge-neutral">${trade.emotion || 'Neutral'}</span></td>
        <td class="text-muted">${trade.date || ''}</td>
        <td>
          <div class="flex flex-col items-start gap-1">
            ${window.formatNotes(tradeNotesText, trade.id)}
            <button class="btn btn-xs btn-secondary view-trade-btn flex items-center gap-1 mt-1" data-id="${trade.id}" title="View Details">
              👁️ <span class="hidden sm:inline">Details</span>
            </button>
          </div>
        </td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-secondary edit-trade-btn" data-id="${trade.id}">✏️ Edit</button>
            <button class="btn btn-sm btn-danger delete-trade-btn" data-id="${trade.id}">🗑️ Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Attach Event Listeners to View, Edit, and Delete buttons
    document.querySelectorAll(".view-trade-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.getAttribute("data-id"));
        const targetTrade = allTrades.find(t => t.id === id);
        if (targetTrade) {
          openTradeModal(targetTrade);
        }
      });
    });

    document.querySelectorAll(".edit-trade-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.getAttribute("data-id"));
        const targetTrade = allTrades.find(t => t.id === id);
        if (targetTrade) {
          localStorage.setItem("editTradeIndex", allTrades.findIndex(t => t.id === id));
          localStorage.setItem("editTradeData", JSON.stringify(targetTrade));
          window.location.href = "/add-trade";
        }
      });
    });

    document.querySelectorAll(".delete-trade-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = Number(e.currentTarget.getAttribute("data-id"));
        if (confirm("Are you sure you want to delete this trade?")) {
          await DataStore.deleteTrade(id);
          showToast("Trade deleted successfully", "info");
          renderTable();
        }
      });
    });
  }

  // Modal Handlers
  const modal = document.getElementById("tradeModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalCloseFooterBtn = document.getElementById("modalCloseFooterBtn");
  const modalEditBtn = document.getElementById("modalEditBtn");

  let activeModalTrade = null;

  function openTradeModal(trade) {
    if (!modal) return;
    activeModalTrade = trade;

    const modalStock = document.getElementById("modalStock");
    const modalTypeBadge = document.getElementById("modalTypeBadge");
    const modalEntry = document.getElementById("modalEntry");
    const modalExit = document.getElementById("modalExit");
    const modalQty = document.getElementById("modalQty");
    const modalPnL = document.getElementById("modalPnL");
    const modalStrategy = document.getElementById("modalStrategy");
    const modalEmotion = document.getElementById("modalEmotion");
    const modalDate = document.getElementById("modalDate");

    const modalReason = document.getElementById("modalReason");
    const modalNotes = document.getElementById("modalNotes");
    const modalLessons = document.getElementById("modalLessons");

    if (modalStock) modalStock.textContent = trade.stock || "N/A";
    if (modalTypeBadge) {
      modalTypeBadge.textContent = trade.type || "BUY";
      modalTypeBadge.className = `badge ${trade.type === "BUY" ? "badge-profit" : "badge-loss"}`;
    }
    if (modalEntry) modalEntry.textContent = `${currencySymbol}${Number(trade.entry || 0).toFixed(2)}`;
    if (modalExit) modalExit.textContent = `${currencySymbol}${Number(trade.exit || 0).toFixed(2)}`;
    if (modalQty) modalQty.textContent = trade.quantity || 0;
    
    const pnl = Number(trade.pnl) || 0;
    if (modalPnL) {
      modalPnL.textContent = `${currencySymbol}${pnl.toFixed(2)}`;
      modalPnL.className = `text-sm font-bold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`;
    }

    if (modalStrategy) modalStrategy.textContent = trade.strategy || "General";
    if (modalEmotion) modalEmotion.textContent = trade.emotion || "Neutral";
    if (modalDate) modalDate.textContent = trade.date || "";

    const tradeNotesText = (trade.trade_notes || trade.notes || "").trim();
    const lessonsText = (trade.lessons_learned || "").trim();
    const reasonText = (trade.reason || trade.why_entered || trade.strategy || "").trim();

    if (modalReason) {
      modalReason.textContent = reasonText || "No entry reason logged";
      modalReason.className = reasonText ? "text-sm text-gray-200 leading-relaxed font-medium" : "text-sm text-gray-500 italic";
    }

    if (modalNotes) {
      modalNotes.textContent = tradeNotesText || "No notes added";
      modalNotes.className = tradeNotesText 
        ? "text-sm text-gray-200 leading-relaxed font-medium whitespace-pre-wrap" 
        : "text-sm text-gray-500 italic";
    }

    if (modalLessons) {
      modalLessons.textContent = lessonsText || "No notes added";
      modalLessons.className = lessonsText 
        ? "text-sm text-gray-200 leading-relaxed font-medium whitespace-pre-wrap" 
        : "text-sm text-gray-500 italic";
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }


  function closeTradeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeTradeModal);
  if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener("click", closeTradeModal);

  if (modalEditBtn) {
    modalEditBtn.addEventListener("click", () => {
      if (activeModalTrade) {
        localStorage.setItem("editTradeData", JSON.stringify(activeModalTrade));
        window.location.href = "/add-trade";
      }
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeTradeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeTradeModal();
    }
  });

  // Attach search & filter change listeners
  [searchInput, filterTypeSelect, filterPnLSelect, sortSelect].forEach(el => {
    if (el) {
      el.addEventListener("input", renderTable);
      el.addEventListener("change", renderTable);
    }
  });

  renderTable();
});

