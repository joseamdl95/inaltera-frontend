import { apiFetch } from "./client"

export function getMe() {
  return apiFetch("/me")
}


export function updateMe(data) {
  return apiFetch("/me", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function updateDatos(data){
  return apiFetch("/user/datos",{
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function updateEmail(email) {
  return apiFetch("/user/email", {
    method: "PUT",
    body: JSON.stringify({ email })
  })
}

export function updatePassword(data) {
  return apiFetch("/user/password", {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function forgotPassword(email) {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  })
}

export function resetPassword(token, password) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password })
  })
}

export function enable2FA() {
  return apiFetch("/user/2fa/enable", { method: "POST" })
}

export function verify2FA(code) {
  return apiFetch("/user/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code })
  })
}

export function disable2FA() {
  return apiFetch("/user/2fa/disable", {
    method: "POST"
  })
}

/*export function getProfile() {
  return apiFetch("/user/profile")
}

export function updateProfile(data) {
  return apiFetch("/user/profile", {
    method: "POST",
    body: JSON.stringify(data),
  })
}*/

