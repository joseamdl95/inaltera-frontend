import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"

export default function VerificarFactura() {

  const [params] = useSearchParams()
  const payload = params.get("data")

  const [data, setData] = useState(null)

  useEffect(() => {

    fetch(`${import.meta.env.VITE_API_BASE_URL}/public/verificar?data=${encodeURIComponent(payload)}`)
      .then(r => r.json())
      .then(setData)

  }, [])

  if (!data) return <p>Verificando factura...</p>

  return (
    <div>

      <h1>Verificación de factura</h1>

      <h2>Resultados</h2>

      <p>Datos QR coinciden: {data.datos_qr_validos ? "✔" : "❌"}</p>
      <p>Hash válido: {data.hash_valido ? "✔" : "❌"}</p>
      <p>Cadena íntegra: {data.cadena_integra ? "✔" : "❌"}</p>

      <h2>Factura</h2>

      <p>Número: {data.factura.numero}</p>
      <p>Fecha: {data.factura.fecha}</p>
      <p>Total: {data.factura.total} €</p>

      <h2>XML original</h2>

      <pre>{data.xml}</pre>

    </div>
  )
}