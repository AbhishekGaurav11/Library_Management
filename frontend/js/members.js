import { getMembers, addMemberAPI } from "./api.js";

// ─── State ────────────────────────────────────────────────────────────────────
let members = [];

// ─── Avatar palette ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#818cf8","#a78bfa","#34d399","#fbbf24","#f87171",
  "#60a5fa","#fb923c","#e879f9","#2dd4bf","#f472b6",
];

function avatarColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Load ─────────────────────────────────────────────────────────────────────
window.loadMembers = async function () {
  try {
    members = await getMembers();
  } catch (e) {
    showToast("Could not load members from server", "error");
    members = [];
  }
  window._members = members;
  renderMembers();
  if (window.updateDashboard) window.updateDashboard();
};

// ─── Render ───────────────────────────────────────────────────────────────────
window.renderMembers = function () {
  const list = document.getElementById("member-list");
  if (!list) return;

  const countEl = document.getElementById("member-count");
  if (countEl) countEl.textContent = `${members.length} registered member${members.length !== 1 ? "s" : ""}`;

  if (members.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--muted);font-size:15px;">No members yet. Add one to get started.</div>`;
    return;
  }

  list.innerHTML = members.map(m => {
    const txs        = (window._transactions || []).filter(t => String(t.member_id) === String(m.id));
    const totalBorrow = txs.length;
    const active_    = m.active === true || m.active === 1 || m.active === "1";
    const color      = avatarColor(m.name || "?");
    const inits      = initials(m.name || "?");
    const joined     = m.joined
      ? new Date(m.joined).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
      : "—";

    return `
      <div class="member-card">
        <div class="avatar" style="background:${color}">${inits}</div>
        <div style="flex:1;min-width:0">
          <div class="member-name">${escHtml(m.name)}</div>
          <div class="member-email">${escHtml(m.email)}</div>
        </div>
        <div class="member-stat" style="margin-right:8px">
          <div class="val">${totalBorrow}</div>
          <div class="lbl">Borrows</div>
        </div>
        <div class="member-stat" style="margin-right:16px">
          <div class="val">${joined}</div>
          <div class="lbl">Joined</div>
        </div>
        <span class="badge ${active_ ? "active" : "inactive"}">${active_ ? "Active" : "Inactive"}</span>
      </div>`;
  }).join("");
};

// ─── Add Member ───────────────────────────────────────────────────────────────
window.openAddMember = function () {
  document.getElementById("nm-name").value   = "";
  document.getElementById("nm-email").value  = "";
  document.getElementById("nm-status").value = "true";
  document.getElementById("add-member-modal").style.display = "flex";
};

window.addMember = async function () {
  const name   = document.getElementById("nm-name").value.trim();
  const email  = document.getElementById("nm-email").value.trim();
  const active = document.getElementById("nm-status").value === "true";

  if (!name)  { showToast("Name is required", "error");  return; }
  if (!email) { showToast("Email is required", "error"); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email", "error"); return;
  }

  const member = {
    id:     "M" + Math.random().toString(36).substr(2, 8),
    name,
    email,
    joined: new Date().toISOString().slice(0, 10),
    active,
  };

  try {
    await addMemberAPI(member);
    closeModal("add-member-modal");
    showToast(`${name} added as a member ✓`, "success");
    await window.loadMembers();
  } catch (e) {
    showToast("Failed to add member", "error");
  }
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}