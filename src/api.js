// This module fetches your precomputed completeness JSON (from your backend endpoints).

const BASE_URL = "http://localhost:3000"; // adjust to backend URL if needed

export async function fetchCompleteness() {
  const res = await fetch(`${BASE_URL}/completeness`);
  if (!res.ok) {
    throw new Error(`Failed to fetch completeness: ${res.status}`);
  }
  const data = await res.json();
  // Expect: [{ type: "User", field: "email", value: 0.92 }, ...]
  return data;
}
