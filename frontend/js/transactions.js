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
  if (window.renderBooks)     window.renderBooks();
  if (window.renderMembers)   window.renderMembers();
};

// ─── Render ───────────────────────────────────────────────────────────────────
window.renderTransactions = function () {
  const body  = document.getElementById("tx-body");
  const count = document.getElementById("tx-count");
  if (!body) return;

  if (count) count.textContent = `${transactions.length} total transaction${transactions.length !== 1 ? "s" : ""}`;

  if (transactions.length === 0) {
    body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted);">No transactions yet.</td></tr>`;
    return;
  }

  const today_ = new Date().toISOString().slice(0, 10);
  const sorted = [...transactions].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  body.innerHTML = sorted.map(t => {
    const book   = (window._books   || []).find(b => String(b.id) === String(t.book_id));
    const member = (window._members || []).find(m => String(m.id) === String(t.member_id));

    const isReturned = t.returned === true || t.returned === 1 || t.returned === "1";
    const isOverdue  = !isReturned && t.due_date && t.due_date < today_;
    const finePaid   = t.fine_paid === true || t.fine_paid === 1 || t.fine_paid === "1";

    let statusBadge, dueCol, fineCol, actionCol;

    if (isReturned) {
      statusBadge = `<span class="tx-badge returned">Returned</span>`;
      dueCol      = `<span style="color:var(--green)">${formatDate(t.return_date)}</span>`;

      if (t.fine_amount > 0) {
        if (finePaid) {
          fineCol   = `<span style="color:var(--green);font-weight:700;">₹${t.fine_amount} (Paid)</span>`;
          actionCol = `<button class="tx-btn receipt" onclick="generateReceipt(${t.id}, '${t.receipt_id}')">Receipt</button>`;
        } else {
          fineCol   = `<span style="color:var(--red);font-weight:700;">₹${t.fine_amount}</span>`;
          actionCol = `<button class="tx-btn pay" onclick="payFine(${t.id})">Pay Fine</button>`;
        }
      } else {
        fineCol   = `<span style="color:var(--green);">No fine</span>`;
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

// ─── Pay Fine ─────────────────────────────────────────────────────────────────
window.payFine = async function (txId) {
  try {
    const tx = (window._transactions || []).find(t => t.id == txId);
    if (!tx) { showToast("Transaction not found", "error"); return; }

    const fineAmount = parseFloat(tx.fine_amount) || 0;
    const paymentMethod = await showPaymentMethodModal(fineAmount);
    if (!paymentMethod) { showToast("Payment cancelled", "info"); return; }

    await payFineAPI(txId, paymentMethod);
    showToast(`Fine of ₹${fineAmount.toFixed(2)} paid via ${paymentMethod} ✓`, "success");
    await window.loadTransactions();
  } catch (e) {
    showToast(`Error: ${e.message}`, "error");
  }
};

// ─── Payment Method Modal ─────────────────────────────────────────────────────
window.showPaymentMethodModal = function (fineAmount) {
  return new Promise((resolve) => {
    const numAmount = parseFloat(fineAmount) || 0;
    const modalWrapper = document.createElement('div');
    const modalId = 'payment-modal-' + Date.now();
    modalWrapper.id = modalId;
    modalWrapper.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 9999;
    `;

    const upiString = `upi://pay?pa=gauravgheura@okicici&pn=Biblio&am=${numAmount}&tn=Library%20Fine`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    modalWrapper.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-height: 90vh; overflow-y: auto;">
        <h3 style="margin: 0 0 20px 0; color: #333; font-family: Arial;">💳 Select Payment Method</h3>
        <p style="margin: 0 0 25px 0; color: #666; font-size: 14px;">
          Fine Amount: <strong style="color: #e74c3c; font-size: 20px;">₹${numAmount.toFixed(2)}</strong>
        </p>
        <div style="margin-bottom: 25px;">
          <div style="display: block; margin-bottom: 15px; padding: 15px; border: 2px solid #ddd; border-radius: 10px; cursor: pointer;" id="upi-option-${modalId}">
            <label style="display: flex; align-items: center; cursor: pointer; user-select: none;">
              <input type="radio" name="payment_method_${modalId}" value="Online Transfer" checked style="margin-right: 12px; cursor: pointer; width: 18px; height: 18px;">
              <span style="color: #333; font-size: 15px; font-weight: 600;">🏦 Online Transfer (UPI)</span>
            </label>
            <div style="margin-top: 12px; text-align: center; background: #f9f9f9; padding: 15px; border-radius: 8px;">
              <img src="${qrCodeUrl}" alt="UPI QR Code" style="width: 160px; height: 160px; margin: 0 auto; display: block; border: 2px solid #ddd; border-radius: 5px;"/>
              <p style="margin: 12px 0 5px 0; font-size: 12px; color: #666; font-weight: 600;">📱 Scan with any UPI app</p>
              <p style="margin: 0; font-size: 11px; color: #999;">gauravgheura@okicici</p>
            </div>
          </div>
          <div style="display: block; padding: 15px; border: 2px solid #ddd; border-radius: 10px; cursor: pointer;" id="cash-option-${modalId}">
            <label style="display: flex; align-items: center; cursor: pointer; user-select: none;">
              <input type="radio" name="payment_method_${modalId}" value="Cash" style="margin-right: 12px; cursor: pointer; width: 18px; height: 18px;">
              <span style="color: #333; font-size: 15px; font-weight: 600;">💵 Cash Payment</span>
            </label>
            <p style="margin: 8px 0 0 30px; font-size: 12px; color: #999;">Pay at counter</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="btn-cancel-${modalId}" style="flex: 1; padding: 12px; border: none; background: #e0e0e0; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Cancel</button>
          <button id="btn-confirm-${modalId}" style="flex: 1; padding: 12px; border: none; background: #34d399; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Confirm Payment</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalWrapper);

    const upiRadio  = document.querySelector(`input[value="Online Transfer"][name="payment_method_${modalId}"]`);
    const cashRadio = document.querySelector(`input[value="Cash"][name="payment_method_${modalId}"]`);

    upiRadio.addEventListener('change', () => {
      document.getElementById(`upi-option-${modalId}`).style.borderColor  = '#34d399';
      document.getElementById(`cash-option-${modalId}`).style.borderColor = '#ddd';
    });
    cashRadio.addEventListener('change', () => {
      document.getElementById(`cash-option-${modalId}`).style.borderColor = '#34d399';
      document.getElementById(`upi-option-${modalId}`).style.borderColor  = '#ddd';
    });

    document.getElementById(`btn-confirm-${modalId}`).addEventListener('click', () => {
      const selected = document.querySelector(`input[name="payment_method_${modalId}"]:checked`);
      modalWrapper.remove();
      resolve(selected ? selected.value : null);
    });

    document.getElementById(`btn-cancel-${modalId}`).addEventListener('click', () => {
      modalWrapper.remove();
      resolve(null);
    });

    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) { modalWrapper.remove(); resolve(null); }
    });
  });
};

// ─── Receipt ──────────────────────────────────────────────────────────────────
window.generateReceipt = function (txId, receiptId) {
  const tx = (window._transactions || []).find(t => t.id == txId);
  if (!tx) { showToast("Transaction not found", "error"); return; }

  const book   = (window._books   || []).find(b => String(b.id) === String(tx.book_id));
  const member = (window._members || []).find(m => String(m.id) === String(tx.member_id));

  const receiptHtml = `
    <div style="padding: 20px; font-family: Arial; max-width: 500px; margin: 0 auto; border: 1px solid #ccc;">
      <h2 style="text-align: center; margin-bottom: 10px;">📋 LIBRARY FINE RECEIPT (₹)</h2>
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
      ${tx.fine_amount > 0 ? `<p style="color: red;"><strong>Late Fine Charged:</strong> ₹${parseFloat(tx.fine_amount).toFixed(2)}</p>` : ""}
      ${tx.fine_paid ? `
        <p style="color: green;"><strong>Fine Status:</strong> PAID ✓</p>
        <p><strong>Payment Method:</strong> ${tx.payment_method || "—"}</p>
        <p><strong>Payment Date:</strong> ${tx.payment_date ? formatDate(tx.payment_date) : "—"}</p>
      ` : ""}
      <hr>
      <p style="text-align: center; font-size: 12px; color: #666;">Thank you for using our library!</p>
    </div>
  `;

  const printWindow = window.open("", "", "width=600,height=700");
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  printWindow.print();
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}