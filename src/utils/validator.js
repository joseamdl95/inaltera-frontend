// =======================
// VALIDACIÓN NIF / NIE / CIF (ESPAÑA)
// =======================

const letrasDni = "TRWAGMYFPDXBNJZSQVHLCKE"

// ---------- DNI ----------
function validarDni(dni) {
  const match = dni.match(/^(\d{8})([A-Z])$/)
  if (!match) return false

  const numero = parseInt(match[1], 10)
  const letra = match[2]

  return letrasDni[numero % 23] === letra
}

// ---------- NIE ----------
function validarNie(nie) {
  const match = nie.match(/^([XYZ])(\d{7})([A-Z])$/)
  if (!match) return false

  const letraInicial = match[1]
  const numero = match[2]
  const letra = match[3]

  const mapa = { X: "0", Y: "1", Z: "2" }
  const numeroCompleto = parseInt(mapa[letraInicial] + numero, 10)

  return letrasDni[numeroCompleto % 23] === letra
}

// ---------- CIF ----------
function validarCif(cif) {
  return /^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(cif)
}

// ---------- VALIDADOR GENERAL ----------
export function validarNif(nif) {
  if (!nif) return false

  const value = nif.toUpperCase().trim()

  return (
    validarDni(value) ||
    validarNie(value) ||
    validarCif(value)
  )
}

// ---------- OTRAS VALIDACIONES ----------
export function validarBase(base) {
  return !isNaN(base) && Number(base) > 0
}

export function validarFecha(fecha) {
  if (!fecha) return false
  return new Date(fecha) <= new Date()
}

export function validarCP(cp) {
  return /^\d{5}$/.test(cp)
}