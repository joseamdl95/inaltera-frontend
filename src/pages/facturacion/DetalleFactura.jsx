import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getFacturaById } from "../../api/invoices"
import { emitirFactura, anularFactura, anularBorrador, descargarFactura, descargarXmlFactura, descargarXmlAnulacion } from "../../api/invoices"

export default function DetalleFactura() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [invoice, setInvoice] = useState(null)
    const [lines, setLines] = useState([])

    useEffect(() => {
        if (id) {
            cargarFactura()
        }
    }, [id])

    async function cargarFactura() {
        const res = await getFacturaById(id)
       
        setInvoice(res.invoice)
        setLines(res.lines)
    }

    if (!invoice) return <p>Cargando...</p>

    function handleEditar() {
        navigate(`/facturacion/editar/${invoice.id}`)
    }

    async function handleEmitir() {
        const confirmar = confirm("¿Emitir esta factura definitivamente?")
        if (!confirmar) return

        await emitirFactura(invoice.id)
        alert("Factura emitida")
        cargarFactura()
    }

    async function handleAnular() {
        const motivo = prompt("Motivo de anulación")
        if (!motivo) return

        await anularFactura(invoice.id, motivo)
        alert("Factura anulada")
        cargarFactura()
    }

    async function handleAnularBorrador() {
        const confirmar = confirm("¿Anular este borrador?")
        if (!confirmar) return

        await anularBorrador(invoice.id)
        alert("Borrador anulado")
        cargarFactura()
    }

    async function handlePdf() {
        const res = await descargarFactura(invoice.id)
        window.open(res.url, "_blank")
    }

    async function handleXml() {
        const res = await descargarXmlFactura(invoice.id)
        window.open(res.url, "_blank")
    }

    async function handleXmlAnulacion() {
        const res = await descargarXmlAnulacion(invoice.id)
        window.open(res.url, "_blank")
    }

  return (
    <div>

      <h1>Factura {invoice.numero}</h1>

      <p>
        Estado: 
        <strong style={{ marginLeft: 5 }}>
            {invoice.estado}
        </strong>
    </p>

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
            Number(l.base_imponible) +
            Number(l.iva_cuota) -
            Number(l.cuota_irpf)

            return (
              <tr key={i}>
                <td>{l.descripcion}</td>
                <td>{Number(l.cantidad)}</td>
                <td>{Number(l.precio_unitario).toFixed(2)}€</td>
                <td>{Number(l.iva_tipo)}%</td>
                <td>{total.toFixed(2)}€</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h3>Total factura: {Number(invoice.total).toFixed(2)}€</h3>

      <h2>Acciones</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: 20, flexWrap: "wrap" }}>

        {invoice.estado === "BORRADOR" && (
            <>
            <button onClick={handleEditar}>
                Editar borrador
            </button>

            <button onClick={handleEmitir}>
                Emitir factura
            </button>

            <button onClick={handleAnularBorrador}>
                Anular borrador
            </button>
            </>
        )}

        {invoice.estado === "EMITIDA" && (
            <>
            <button onClick={handlePdf}>
                Descargar PDF
            </button>

            <button onClick={handleXml}>
                Descargar XML
            </button>

            <button
                onClick={handleAnular}
                style={{ backgroundColor: "#c0392b", color: "white" }}
            >
                Anular factura
            </button>
            </>
        )}

        {invoice.estado === "ANULADA" && (
            <button onClick={handleXmlAnulacion}>
            XML anulación
            </button>
        )}

        {invoice.estado === "BORRADOR_ANULADO" && (
            <p>Borrador anulado</p>
        )}

        </div>

    </div>
  )
}