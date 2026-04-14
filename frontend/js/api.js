// Dynamically determine API base URL
const BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    // Browser environment
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      return window.location.protocol + '//' + window.location.hostname + ':5000/api';
    } else {
      // Production: use same origin as frontend
      return window.location.origin + '/api';
    }
  }
  return '/api'; // Fallback
})();

// ─── Books ────────────────────────────────────────────────────────────────────
export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function addBookAPI(book) {
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to add book");
  return res.json();
}

export async function deleteBookAPI(id) {
  const res = await fetch(`${BASE_URL}/books/${id}`, { 
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to delete book");
  return res.json();
}

export async function addCopiesAPI(id, count) {
  const res = await fetch(`${BASE_URL}/books/${id}/copies`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to add copies");
  return res.json();
}

// ─── Members ─────────────────────────────────────────────────────────────────
export async function getMembers() {
  const res = await fetch(`${BASE_URL}/members`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

export async function addMemberAPI(member) {
  const res = await fetch(`${BASE_URL}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to add member");
  return res.json();
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function borrowBookAPI(data) {
  const res = await fetch(`${BASE_URL}/transactions/borrow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to borrow book");
  return res.json();
}

export async function returnBookAPI(data) {
  const res = await fetch(`${BASE_URL}/transactions/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to return book");
  return res.json();
}

export async function payFineAPI(transactionId, paymentMethod) {
  const res = await fetch(`${BASE_URL}/transactions/pay-fine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: transactionId, paymentMethod }),
    credentials: 'include'
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to pay fine");
  }
  
  return data;
}