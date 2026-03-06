const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token")

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || error.message || "Error API")
  }

  // 👇 CLAVE
  if (options.responseType === "blob") {
    return response
  }

  return response.json()
}