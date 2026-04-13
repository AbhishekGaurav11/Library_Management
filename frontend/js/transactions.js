import { getTransactions, payFineAPI } from "./api.js";

// ─── State ────────────────────────────────────────────────────────────────────
let transactions = [];

// ─── Load ─────────────────────────────────────────────────────────────────────
window.loadTransactions = async function () {
  try {
    transactions = await getTransactions();
  } catch (e) {
    showToast("Could not load transactions from server", "error");
    transactions = [];
  }
  window._transactions = transactions;
  renderTransactions();
  if (window.updateDashboard) window.updateDashboard();
  if (window.renderBooks)     window.renderBooks();      // refresh return buttons
  if (window.renderMembers)   window.renderMembers();    // refresh borrow counts
};

// ─── Render ───────────────────────────────────────────────────────────────────
window.renderTransactions = function () {
  const body  = document.getElementById("tx-body");
  const count = document.getElementById("tx-count");
  if (!body) return;

  if (count) count.textContent = `${transactions.length} total transaction${transactions.length !== 1 ? "s" : ""}`;

  if (transactions.length === 0) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);">No transactions yet.</td></tr>`;
    return;
  }

  const today_ = new Date().toISOString().slice(0, 10);

  // Sort newest first
  const sorted = [...transactions].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  body.innerHTML = sorted.map(t => {
    const book   = (window._books    || []).find(b => String(b.id) === String(t.book_id));
    const member = (window._members  || []).find(m => String(m.id) === String(t.member_id));

    const isReturned = t.returned === true || t.returned === 1 || t.returned === "1";
    const isOverdue  = !isReturned && t.due_date && t.due_date < today_;
    const finePaid   = t.fine_paid === true || t.fine_paid === 1 || t.fine_paid === "1";

    let statusBadge, dueCol, fineCol, actionCol;
    
    if (isReturned) {
      statusBadge = `<span class="tx-badge returned">Returned</span>`;
      dueCol      = `<span style="color:var(--green)">${formatDate(t.return_date)}</span>`;
      
      if (t.fine_amount > 0) {
        if (finePaid) {
          fineCol = `<span style="color:var(--green);font-weight:700;">$${t.fine_amount} (Paid)</span>`;
          actionCol = `<button class="tx-btn receipt" onclick="generateReceipt(${t.id}, '${t.receipt_id}')">Receipt</button>`;
        } else {
          fineCol = `<span style="color:var(--red);font-weight:700;">$${t.fine_amount}</span>`;
          actionCol = `<button class="tx-btn pay" onclick="payFine(${t.id})">Pay Fine</button>`;
        }
      } else {
        fineCol = `<span style="color:var(--green);">No fine</span>`;
        actionCol = `<button class="tx-btn receipt" onclick="generateReceipt(${t.id}, '${t.receipt_id}')">Receipt</button>`;
      }
    } else if (isOverdue) {
      statusBadge = `<span class="tx-badge overdue">Overdue</span>`;
      dueCol      = `<span style="color:var(--red)">${formatDate(t.due_date)}</span>`;
      fineCol     = `<span style="color:var(--red);">Pending</span>`;
      actionCol   = `<span style="color:var(--muted);">—</span>`;
    } else {
      statusBadge = `<span class="tx-badge active">Active</span>`;
      dueCol      = formatDate(t.due_date);
      fineCol     = `<span style="color:var(--muted);">—</span>`;
      actionCol   = `<button class="tx-btn receipt" onclick="generateReceipt(${t.id}, '${t.receipt_id}')">Receipt</button>`;
    }

    return `
      <tr>
        <td><span class="tx-id">${escHtml(String(t.id))}</span></td>
        <td><span class="tx-book">${escHtml(book?.title || `Book #${t.book_id}`)}</span></td>
        <td><span class="tx-member">${escHtml(member?.name || `Member ${t.member_id}`)}</span></td>
        <td><span class="tx-date">${formatDate(t.date)}</span></td>
        <td><span class="tx-date">${dueCol}</span></td>
        <td>${fineCol}</td>
        <td>${actionCol}</td>
        <td>${statusBadge}</td>
      </tr>`;
  }).join("");
};

// ─── Utility ──────────────────────────────────────────────────────────────────
window.payFine = async function (txId) {
  try {
    const tx = (window._transactions || []).find(t => t.id == txId);
    if (!tx) { showToast("Transaction not found", "error"); return; }
    
    await payFineAPI(txId);
    showToast(`Fine of $${tx.fine_amount} paid successfully ✓`, "success");
    await window.loadTransactions();
  } catch (e) {
    showToast("Failed to process fine payment", "error");
  }
};

window.generateReceipt = function (txId, receiptId) {
  const tx = (window._transactions || []).find(t => t.id == txId);
  if (!tx) { showToast("Transaction not found", "error"); return; }

  const book   = (window._books || []).find(b => String(b.id) === String(tx.book_id));
  const member = (window._members || []).find(m => String(m.id) === String(tx.member_id));

  const receiptHtml = `
    <div style="padding: 20px; font-family: Arial; max-width: 500px; margin: 0 auto; border: 1px solid #ccc;">
      <h2 style="text-align: center; margin-bottom: 10px;">📋 LIBRARY RECEIPT</h2>
      <hr>
      <p><strong>Receipt ID:</strong> ${receiptId}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
      <hr>
      <p><strong>Book Title:</strong> ${book?.title || "N/A"}</p>
      <p><strong>Author:</strong> ${book?.author || "N/A"}</p>
      <p><strong>Member:</strong> ${member?.name || "N/A"}</p>
      <p><strong>Member ID:</strong> ${tx.member_id}</p>
      <hr>
      <p><strong>Borrowed Date:</strong> ${formatDate(tx.date)}</p>
      <p><strong>Due Date:</strong> ${formatDate(tx.due_date)}</p>
      ${tx.returned ? `<p><strong>Returned Date:</strong> ${formatDate(tx.return_date)}</p>` : ""}
      <hr>
      ${tx.fine_amount > 0 ? `<p style="color: red;"><strong>Late Fine Charged:</strong> $${tx.fine_amount}</p>` : ""}
      ${tx.fine_paid ? `<p style="color: green;"><strong>Fine Status:</strong> PAID ✓</p>` : ""}
      <hr>
      <p style="text-align: center; font-size: 12px; color: #666;">Thank you for using our library!</p>
    </div>
  `;

  const printWindow = window.open("", "", "width=600, height=700");
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  printWindow.print();
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}