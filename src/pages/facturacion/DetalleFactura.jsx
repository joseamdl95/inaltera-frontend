import { useParams } from "react-router-dom"

export default function DetalleFactura() {

  const { id } = useParams()

  return (
    <div>
      <h1>Detalle de factura</h1>
      <p>ID factura: {id}</p>
    </div>
  )
}