const BASE_URL = "http://127.0.0.1:5000/api";

// ─── Books ────────────────────────────────────────────────────────────────────
export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books`);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function addBookAPI(book) {
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error("Failed to add book");
  return res.json();
}

export async function deleteBookAPI(id) {
  const res = await fetch(`${BASE_URL}/books/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete book");
  return res.json();
}

export async function addCopiesAPI(id, count) {
  const res = await fetch(`${BASE_URL}/books/${id}/copies`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error("Failed to add copies");
  return res.json();
}

// ─── Members ─────────────────────────────────────────────────────────────────
export async function getMembers() {
  const res = await fetch(`${BASE_URL}/members`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

export async function addMemberAPI(member) {
  const res = await fetch(`${BASE_URL}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!res.ok) throw new Error("Failed to add member");
  return res.json();
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function borrowBookAPI(data) {
  const res = await fetch(`${BASE_URL}/transactions/borrow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to borrow book");
  return res.json();
}

export async function returnBookAPI(data) {
  const res = await fetch(`${BASE_URL}/transactions/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to return book");
  return res.json();
}

export async function payFineAPI(transactionId) {
  const res = await fetch(`${BASE_URL}/transactions/pay-fine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: transactionId }),
  });
  if (!res.ok) throw new Error("Failed to pay fine");
  return res.json();
}