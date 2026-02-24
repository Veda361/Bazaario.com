import { auth } from "./firebase";

const API_BASE = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
  let headers = { ...options.headers };

  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "API Error");
  }

  return response.json();
}