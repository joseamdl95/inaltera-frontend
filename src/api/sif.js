import { apiFetch } from "./client"

export async function getSifs() {
  const res = await apiFetch("/sif")
  console.log("API RAW:", res)
  return res
}

export function createSif(data) {
  return apiFetch("/sif", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

// ✅ EDITAR
export function updateSif(id, data) {
  return apiFetch(`/sif/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

// ✅ SET DEFAULT
export function setDefaultSif(id) {
  return apiFetch(`/sif/${id}/default`, {
    method: "POST"
  })
}