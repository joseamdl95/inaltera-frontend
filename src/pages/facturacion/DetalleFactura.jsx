import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getFacturaById } from "../../api/invoices"

export default function DetalleFactura() {

  const { id } = useParams()

  const [factura, setFactura] = useState(null)

  useEffect(() => {
    cargarFactura()
  }, [])

  async function cargarFactura() {
    try {
      const res = await getFacturaById(id)
      setFactura(res.invoice)
    } catch (err) {
      console.error(err)
    }
  }

  if (!factura) {
    return <p>Cargando factura...</p>
  }

  return (
    <div>
      <h1>Factura {factura.numero}</h1>

      <p><strong>Cliente:</strong> {factura.cliente_nombre}</p>
      <p><strong>NIF:</strong> {factura.cliente_nif}</p>
      <p><strong>Fecha:</strong> {factura.fecha_emision}</p>
      <p><strong>Estado:</strong> {factura.estado}</p>
    </div>
  )
}