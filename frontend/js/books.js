import { getBooks, addBookAPI, deleteBookAPI, addCopiesAPI, borrowBookAPI, returnBookAPI } from "./api.js";

// ─── State ────────────────────────────────────────────────────────────────────
let books = [];
let pendingBookId = null;

// ─── Genre styling map ────────────────────────────────────────────────────────
const GENRE_STYLES = {
  "Sci-Fi":      { tag: "rgba(129,140,248,0.15)", tagColor: "#818cf8", strip: "#818cf8", icon: "🚀" },
  "Fantasy":     { tag: "rgba(167,139,250,0.15)", tagColor: "#a78bfa", strip: "#a78bfa", icon: "🧙" },
  "Classic":     { tag: "rgba(251,191,36,0.15)",  tagColor: "#fbbf24", strip: "#fbbf24", icon: "📜" },
  "Non-Fiction": { tag: "rgba(52,211,153,0.15)",  tagColor: "#34d399", strip: "#34d399", icon: "🔬" },
};

function genreStyle(genre) {
  return GENRE_STYLES[genre] || { tag: "rgba(156,163,175,0.15)", tagColor: "#9ca3af", strip: "#9ca3af", icon: "📚" };
}

// ─── Load ─────────────────────────────────────────────────────────────────────
window.loadBooks = async function () {
  try {
    books = await getBooks();
  } catch (e) {
    showToast("Could not load books from server", "error");
    books = [];
  }
  window._books = books;
  renderBooks();
  updateDashboard();
};

// ─── Render ───────────────────────────────────────────────────────────────────
window.renderBooks = function () {
  const query  = (document.getElementById("book-search")?.value || "").toLowerCase();
  const genre  = document.getElementById("genre-filter")?.value || "All";

  const filtered = books.filter(b => {
    const matchGenre  = genre === "All" || b.genre === genre;
    const matchSearch = !query ||
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      (b.genre || "").toLowerCase().includes(query);
    return matchGenre && matchSearch;
  });

  const countEl = document.getElementById("books-count");
  if (countEl) countEl.textContent = `${filtered.length} title${filtered.length !== 1 ? "s" : ""} found`;

  const grid = document.getElementById("books-grid");
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--muted);font-size:15px;">No books match your search.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(b => {
    const gs     = genreStyle(b.genre);
    const avail  = Number(b.available);
    const copies = Number(b.copies);
    const pct    = copies > 0 ? Math.round((avail / copies) * 100) : 0;
    const allOut = avail <= 0;

    const actionBtn = allOut
      ? `<button class="btn-out" disabled>All Copies Out</button>`
      : `<button class="btn-borrow" onclick="openBorrow(${b.id})">Borrow</button>`;

    const hasActive = (window._transactions || []).some(
      t => String(t.book_id) === String(b.id) && !(t.returned === true || t.returned === 1 || t.returned === "1")
    );
    const returnBtn = hasActive
      ? `<button class="btn-return" onclick="openReturn(${b.id})">Return</button>`
      : `<button class="btn-out" disabled style="flex:0.6">Return</button>`;

    return `
      <div class="book-card">
        <div class="book-top-strip" style="background:${gs.strip}"></div>
        <div class="book-body">
          <div class="book-icon-row">
            <button class="btn-icon add-copies" title="Add copies" onclick="openAddCopies(${b.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button class="btn-icon delete" title="Delete book" onclick="openDeleteBook(${b.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
          <div class="book-row">
            <div class="book-thumb" style="background:${gs.tag}; font-size:26px;">${gs.icon}</div>
            <div class="book-info" style="min-width:0;flex:1">
              <div class="title" title="${escHtml(b.title)}">${escHtml(b.title)}</div>
              <div class="meta">${escHtml(b.author)} · ${b.year || "—"}</div>
              <span class="genre-tag" style="background:${gs.tag};color:${gs.tagColor}">${escHtml(b.genre)}</span>
            </div>
          </div>
          <div class="avail-section">
            <div class="avail-row">
              <span class="avail-label">Availability</span>
              <span class="avail-count" style="color:${avail > 0 ? "var(--green)" : "var(--red)"}">${avail}/${copies}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%;background:${avail > 0 ? "var(--green)" : "var(--red)"}"></div>
            </div>
          </div>
          <div class="book-actions">
            ${actionBtn}
            ${returnBtn}
          </div>
        </div>
      </div>`;
  }).join("");
};

// ─── Add Book ─────────────────────────────────────────────────────────────────
window.openAddBook = function () {
  document.getElementById("nb-title").value  = "";
  document.getElementById("nb-author").value = "";
  document.getElementById("nb-year").value   = "";
  document.getElementById("nb-copies").value = "1";
  document.getElementById("add-modal").style.display = "flex";
};

window.addBook = async function () {
  const title  = document.getElementById("nb-title").value.trim();
  const author = document.getElementById("nb-author").value.trim();
  const genre  = document.getElementById("nb-genre").value;
  const year   = document.getElementById("nb-year").value;
  const copies = parseInt(document.getElementById("nb-copies").value) || 1;

  if (!title || !author) { showToast("Title and author are required", "error"); return; }

  try {
    await addBookAPI({ title, author, genre, year, copies, available: copies });
    closeModal("add-modal");
    showToast(`"${title}" added to catalog ✓`, "success");
    await window.loadBooks();
  } catch (e) {
    showToast("Failed to add book", "error");
  }
};

// ─── Delete Book ──────────────────────────────────────────────────────────────
window.openDeleteBook = function (id) {
  pendingBookId = id;
  const book = books.find(b => b.id == id);
  const infoEl = document.getElementById("delete-info");
  if (infoEl && book) {
    infoEl.textContent = `Are you sure you want to permanently delete "${book.title}" by ${book.author}? This cannot be undone.`;
  }
  document.getElementById("delete-modal").style.display = "flex";
};

window.confirmDeleteBook = async function () {
  if (!pendingBookId) return;
  const book = books.find(b => b.id == pendingBookId);
  try {
    await deleteBookAPI(pendingBookId);
    closeModal("delete-modal");
    showToast(`"${book?.title || "Book"}" deleted`, "success");
    pendingBookId = null;
    await window.loadBooks();
  } catch (e) {
    showToast("Failed to delete book", "error");
  }
};

// ─── Add Copies ───────────────────────────────────────────────────────────────
window.openAddCopies = function (id) {
  pendingBookId = id;
  const book = books.find(b => b.id == id);
  document.getElementById("copies-input").value = 1;
  const titleEl = document.getElementById("copies-title");
  if (titleEl && book) titleEl.textContent = `Add Copies — ${book.title}`;
  const infoEl = document.getElementById("copies-info");
  if (infoEl && book) infoEl.textContent = `Currently ${book.copies} total copies, ${book.available} available.`;
  document.getElementById("copies-modal").style.display = "flex";
};

window.stepCopies = function (delta) {
  const inp = document.getElementById("copies-input");
  inp.value = Math.max(1, Math.min(50, (parseInt(inp.value) || 1) + delta));
};

window.confirmAddCopies = async function () {
  if (!pendingBookId) return;
  const count = parseInt(document.getElementById("copies-input").value) || 1;
  const book  = books.find(b => b.id == pendingBookId);
  try {
    await addCopiesAPI(pendingBookId, count);
    closeModal("copies-modal");
    showToast(`${count} cop${count > 1 ? "ies" : "y"} added to "${book?.title}"`, "success");
    pendingBookId = null;
    await window.loadBooks();
  } catch (e) {
    showToast("Failed to add copies", "error");
  }
};

// ─── Borrow ───────────────────────────────────────────────────────────────────
window.openBorrow = function (bookId) {
  pendingBookId = bookId;
  const book = books.find(b => b.id == bookId);

  const titleEl = document.getElementById("borrow-title");
  if (titleEl && book) titleEl.textContent = `Borrow — ${book.title}`;

  // Set default due date to 14 days from today
  const dueDateInput = document.getElementById("borrow-due-date");
  if (dueDateInput) {
    dueDateInput.value = daysFromNow(14);
    dueDateInput.min   = daysFromNow(1);   // can't set due date in the past
  }

  const infoEl = document.getElementById("borrow-info");
  if (infoEl) infoEl.textContent = "Default loan period is 14 days. You can adjust the due date above.";

  // Populate member dropdown (active members only)
  const sel = document.getElementById("borrow-member");
  sel.innerHTML = `<option value="">— Choose a member —</option>`;
  (window._members || [])
    .filter(m => m.active === true || m.active === 1 || m.active === "1")
    .forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.name;
      sel.appendChild(opt);
    });

  document.getElementById("borrow-modal").style.display = "flex";
};

window.confirmBorrow = async function () {
  const memberId = document.getElementById("borrow-member").value;
  const dueDate  = document.getElementById("borrow-due-date")?.value;

  if (!memberId) { showToast("Please select a member", "error"); return; }
  if (!dueDate)  { showToast("Please set a due date", "error"); return; }
  if (dueDate <= today()) { showToast("Due date must be in the future", "error"); return; }
  if (!pendingBookId) return;

  const tx = {
    id:        "T" + Date.now(),
    book_id:   pendingBookId,
    member_id: memberId,
    date:      today(),
    due_date:  dueDate,
  };

  try {
    await borrowBookAPI(tx);
    closeModal("borrow-modal");
    const book = books.find(b => b.id == pendingBookId);
    showToast(`"${book?.title}" borrowed successfully ✓`, "success");
    pendingBookId = null;
    await window.loadBooks();
    if (window.loadTransactions) await window.loadTransactions();
  } catch (e) {
    showToast("Failed to borrow book", "error");
  }
};

// ─── Return ───────────────────────────────────────────────────────────────────
window.openReturn = function (bookId) {
  pendingBookId = bookId;
  const book = books.find(b => b.id == bookId);

  const titleEl = document.getElementById("return-title");
  if (titleEl && book) titleEl.textContent = `Return — ${book.title}`;

  // Find active transactions for this book and list borrowers
  const activeTxs = (window._transactions || []).filter(
    t => String(t.book_id) === String(bookId) &&
         !(t.returned === true || t.returned === 1 || t.returned === "1")
  );

  const sel = document.getElementById("return-member");
  sel.innerHTML = `<option value="">— Who is returning? —</option>`;
  activeTxs.forEach(t => {
    const member = (window._members || []).find(m => String(m.id) === String(t.member_id));
    const opt    = document.createElement("option");
    opt.value    = t.id;    // transaction ID used to mark return
    opt.textContent = member ? member.name : `Member ${t.member_id}`;
    sel.appendChild(opt);
  });

  document.getElementById("return-modal").style.display = "flex";
};

window.confirmReturn = async function () {
  const txId = document.getElementById("return-member").value;
  if (!txId) { showToast("Please select who is returning", "error"); return; }

  try {
    await returnBookAPI({ id: txId, bookId: pendingBookId });
    closeModal("return-modal");
    const book = books.find(b => b.id == pendingBookId);
    showToast(`"${book?.title}" returned successfully ✓`, "success");
    pendingBookId = null;
    await window.loadBooks();
    if (window.loadTransactions) await window.loadTransactions();
  } catch (e) {
    showToast("Failed to return book", "error");
  }
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
window.updateDashboard = function () {
  const total  = books.reduce((s, b) => s + Number(b.copies), 0);
  const avail  = books.reduce((s, b) => s + Number(b.available), 0);
  const loaned = total - avail;

  const txs     = window._transactions || [];
  const today_  = today();
  const overdue = txs.filter(
    t => !(t.returned === true || t.returned === 1 || t.returned === "1") &&
         t.due_date && t.due_date < today_
  ).length;

  // Total fines collected (paid only)
  const totalFines = txs
    .filter(t => t.fine_paid === true || t.fine_paid === 1 || t.fine_paid === "1")
    .reduce((s, t) => s + (parseFloat(t.fine_amount) || 0), 0);

  // Unique genres
  const genres = new Set(books.map(b => b.genre).filter(Boolean));

  // Active members
  const activeMembers = (window._members || []).filter(
    m => m.active === true || m.active === 1 || m.active === "1"
  ).length;

  setText("stat-total",        total);
  setText("stat-titles",       `${books.length} unique title${books.length !== 1 ? "s" : ""}`);
  setText("stat-avail",        avail);
  setText("stat-loans",        loaned);
  setText("stat-overdue",      overdue);
  setText("stat-overdue-sub",  overdue > 0 ? `${overdue} item${overdue > 1 ? "s" : ""} past due` : "all loans on time");
  setText("stat-members",      activeMembers);
  setText("stat-fines",        `₹${totalFines.toFixed(2)}`);
  setText("stat-genres",       genres.size);
  setText("stat-transactions", txs.length);

  const dateEl = document.getElementById("dash-date");
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  renderGenreBars();
  renderActivity();
};

function renderGenreBars() {
  const container = document.getElementById("genre-bars");
  if (!container) return;

  const counts = {};
  books.forEach(b => { counts[b.genre] = (counts[b.genre] || 0) + Number(b.copies); });
  const max    = Math.max(...Object.values(counts), 1);
  const colors = { "Sci-Fi": "#818cf8", "Fantasy": "#a78bfa", "Classic": "#fbbf24", "Non-Fiction": "#34d399" };

  container.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => `
      <div class="genre-row">
        <div class="genre-row-top">
          <span>${genre}</span>
          <span>${count} cop${count !== 1 ? "ies" : "y"}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.round((count / max) * 100)}%;background:${colors[genre] || "#6b7280"}"></div>
        </div>
      </div>`)
    .join("");
}

function renderActivity() {
  const container = document.getElementById("activity-feed");
  if (!container) return;

  const txs = [...(window._transactions || [])]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 8);

  if (txs.length === 0) {
    container.innerHTML = `<div style="color:var(--muted);font-size:13px;text-align:center;padding:24px 0;">No recent activity</div>`;
    return;
  }

  container.innerHTML = txs.map(t => {
    const book   = books.find(b => String(b.id) === String(t.book_id));
    const member = (window._members || []).find(m => String(m.id) === String(t.member_id));
    const isRet  = t.returned === true || t.returned === 1 || t.returned === "1";
    const color  = isRet ? "var(--green)" : "var(--yellow)";
    const label  = isRet ? "Returned" : "Borrowed";
    const date   = formatDate(t.return_date || t.date);

    return `
      <div class="activity-item">
        <div class="dot" style="background:${color}"></div>
        <div style="flex:1;min-width:0">
          <div class="book-name">${escHtml(book?.title || `Book #${t.book_id}`)}</div>
          <div class="member-name">${label} · ${escHtml(member?.name || `Member ${t.member_id}`)}</div>
        </div>
        <div class="date">${date}</div>
      </div>`;
  }).join("");
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}