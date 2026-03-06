import { apiFetch } from "./client"

// 🔹 Obtener clientes
export const getClients = () => {
  return apiFetch("/clients")
}

// 🔹 Crear cliente
export const createClient = (data) => {
  return apiFetch("/clients", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
// modificar dtos de cliente
export const updateClient = (id, data) => {
  return apiFetch(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}