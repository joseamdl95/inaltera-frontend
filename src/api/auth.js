import { apiFetch } from "./client"

export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function registerUser(data) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

