import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getFacturaById } from "../../api/invoices"

export default function DetalleFactura() {

  const { id } = useParams()

  const [invoice, setInvoice] = useState(null)
  const [lines, setLines] = useState([])

  useEffect(() => {
    cargarFactura()
  }, [])

  async function cargarFactura() {
    const res = await getFacturaById(id)
    console.log("RESPUESTA API", res)
    setInvoice(res.invoice)
    setLines(res.lines)
  }

  if (!invoice) return <p>Cargando...</p>

  return (
    <div>

      <h1>Factura {invoice.numero}</h1>

      <p>Cliente: {invoice.cliente_nombre}</p>
      <p>NIF: {invoice.cliente_nif}</p>
      <p>Fecha: {invoice.fecha_emision}</p>
      <p>Estado: {invoice.estado}</p>

      <h2>Líneas</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>IVA</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {lines.map((l, i) => {

            const total =
              l.base_imponible +
              l.iva_cuota -
              l.cuota_irpf

            return (
              <tr key={i}>
                <td>{l.descripcion}</td>
                <td>{l.cantidad}</td>
                <td>{l.precio_unitario}</td>
                <td>{l.iva_tipo}%</td>
                <td>{total.toFixed(2)}€</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h3>Total factura: {invoice.total}€</h3>

    </div>
  )
}