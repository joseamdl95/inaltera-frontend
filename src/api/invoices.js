import { apiFetch } from "./client"

// Listar facturas
export function listarFacturas(filtros = {}) {
  const params = new URLSearchParams()

  Object.entries(filtros).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })

  const query = params.toString()
  const url = query ? `/invoices?${query}` : "/invoices"

  return apiFetch(url)
}


// Crear factura BORRADOR
export function crearFactura(data) {
  return apiFetch("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Emitir factura
export function emitirFactura(invoiceId) {
  return apiFetch("/invoices/emit", {
    method: "POST",
    body: JSON.stringify({ invoice_id: invoiceId }),
  })
}
//Subir factura PDF
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function cargarFacturaPDF(file) {
  const token = localStorage.getItem("token")

  const formData = new FormData()
  formData.append("pdf", file)

  const response = await fetch(
    `${API_BASE_URL}/invoices/upload-pdf`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error("Error al subir PDF")
  }

  return response.json()
}

//Anular Factura
export function anularFactura(invoiceId, motivo) {
  return apiFetch("/invoices/anular", {
    method: "POST",
    body: JSON.stringify({
      invoice_id: invoiceId,
      motivo: motivo
    })
  })
}

//Anular Borrador
export function anularBorrador(invoiceId) {
  return apiFetch("/invoices/anularBorrador", {
    method: "POST",
    body: JSON.stringify({
      invoice_id: invoiceId,
    })
  })
}

export function getFacturaByNumero(numero) {
  return apiFetch(`/invoices/numero/${numero}`)
}

export async function importarFacturaPDF(file, sifId) {
  const formData = new FormData()

  formData.append("pdf", file)
  formData.append("sif_id", sifId) // 👈 AÑADIR ESTO

  const data = await apiFetch("/invoices/import-pdf", {
    method: "POST",
    body: formData
  })

  return data
}

export function descargarFactura(id) {
  return apiFetch(`/invoices/download?id=${id}`, {
    method: "GET",
    responseType: "blob",
  })
}

export function descargarXmlFactura(id) {
  return apiFetch(`/invoices/download-xml?id=${id}`, {
    method: "GET",
    responseType: "blob",
  })
}

export function descargarXmlAnulacion(id) {
  return apiFetch(`/invoices/download-xml-anulacion?id=${id}`, {
    method: "GET",
    responseType: "blob",
  })
}