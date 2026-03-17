import { apiFetch } from "./client"

// Obtener empresa del usuario
export function getCompany() {
  return apiFetch("/company")
}

//Crear empresa
export function createCompany(data) {
  return apiFetch("/company", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Actualizar empresa
export function updateCompany(data) {
  return apiFetch("/company", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

//subir Logo 
export function uploadLogo(file) {
  const formData = new FormData()
  formData.append("logo", file)

  return apiFetch("/company/upload-logo", {
    method: "POST",
    body: formData
  })
}
