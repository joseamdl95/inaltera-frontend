import { apiFetch } from "./client"

export function getBillingStatus() {
  return apiFetch("/billing/status", {
    method: "GET"
  })
}

export function changePlan(plan) {
  return apiFetch("/billing/change-plan", {
    method: "POST",
    body: JSON.stringify({ plan })
  })
}