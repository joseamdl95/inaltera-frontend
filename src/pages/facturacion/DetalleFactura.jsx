import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getFacturaById } from "../../api/invoices"
import { emitirFactura, anularFactura, anularBorrador, descargarFactura, descargarXmlFactura, descargarXmlAnulacion } from "../../api/invoices"

import Card from "../../components/common/Card"
import Button from "../../components/common/Button"

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

    function handleRectificativaSustitutiva() {
        navigate(
            `/facturacion/emitir?tipo=R1&original=${invoice.numero}`
        )
    }

    function handleRectificativaDiferencia() {
        navigate(
            `/facturacion/emitir?tipo=R2&original=${invoice.numero}`
        )
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
    <div className="max-w-5xl mx-auto space-y-6">

        {/* 🧾 HEADER */}
        <div className="flex justify-between items-start flex-wrap gap-3">
            <h1 className="text-2xl font-bold">
                Factura {invoice.numero}
            </h1>

            <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${
                invoice.estado === "EMITIDA"
                    ? "bg-green-100 text-green-700"
                    : invoice.estado === "BORRADOR"
                    ? "bg-yellow-100 text-yellow-700"
                    : invoice.estado === "BORRADOR_ANULADO"
                    ? "bg-red-100 text-red-700"
                    : invoice.estado === "ANULADA"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }
            `}>
                {invoice.estado}
            </span>
        </div>

        {/* 👤 DATOS */}
        <Card>
            <h3 className="font-semibold mb-4">Datos de la factura</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">Cliente</span>
                    <p className="font-medium">{invoice.cliente_nombre}</p>
                </div>

                <div>
                    <span className="text-gray-500">NIF</span>
                    <p className="font-medium">{invoice.cliente_nif}</p>
                </div>

                <div>
                    <span className="text-gray-500">Fecha</span>
                    <p className="font-medium">{invoice.fecha_emision}</p>
                </div>

                <div>
                    <span className="text-gray-500">Total</span>
                    <p className="font-bold text-lg">
                        {Number(invoice.total).toFixed(2)} €
                    </p>
                </div>
            </div>
        </Card>

        {/* 📊 LÍNEAS */}
        <Card>
            <h3 className="font-semibold mb-4">Líneas</h3>

            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600">
                <tr>
                    <th className="text-left px-3 py-2">Concepto</th>
                    <th className="text-left px-3 py-2">Cantidad</th>
                    <th className="text-left px-3 py-2">Precio</th>
                    <th className="text-left px-3 py-2">IVA</th>
                    <th className="text-left px-3 py-2">Total</th>
                </tr>
                </thead>

                <tbody>
                    {lines.map((l, i) => {
                        const total =
                        Number(l.base_imponible) +
                        Number(l.iva_cuota) -
                        Number(l.cuota_irpf)

                        return (
                        <tr key={i} className="border-t">
                            <td className="px-3 py-2">{l.descripcion}</td>
                            <td className="px-3 py-2">{Number(l.cantidad)}</td>
                            <td className="px-3 py-2">
                            {Number(l.precio_unitario).toFixed(2)} €
                            </td>
                            <td className="px-3 py-2">
                            {Number(l.iva_tipo)}%
                            </td>
                            <td className="px-3 py-2 font-medium">
                            {total.toFixed(2)} €
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </Card>

        {/* 🔘 ACCIONES */}
        <Card>
            <h3 className="font-semibold mb-4">Acciones</h3>

            <div className="flex gap-3 flex-wrap">

                {invoice.estado === "BORRADOR" && (
                    <>
                        <Button onClick={handleEditar}>
                            Editar
                        </Button>

                        <Button onClick={handleEmitir}>
                            Emitir
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleAnularBorrador}
                        >
                            Anular borrador
                        </Button>
                    </>
                )}

                {invoice.estado === "EMITIDA" && (
                    <>
                        <Button onClick={handlePdf}>
                            PDF
                        </Button>

                        <Button onClick={handleXml}>
                            XML
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleRectificativaSustitutiva}
                        >
                            Rectificativa (Sust.)
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleRectificativaDiferencia}
                        >
                            Rectificativa (Dif.)
                        </Button>

                        <Button
                            onClick={handleAnular}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Anular factura
                        </Button>
                    </>
                )}

                {invoice.estado === "ANULADA" && (
                    <>
                        <Button onClick={handlePdf}>PDF</Button>

                        <Button variant="secondary" onClick={handleXml}>
                            XML
                        </Button>

                        <Button variant="secondary" onClick={handleXmlAnulacion}>
                            XML anulación
                        </Button>
                    </>
                )}

                {invoice.estado === "BORRADOR_ANULADO" && (
                    <p className="text-sm text-gray-500">
                        Borrador anulado
                    </p>
                )}

            </div>
        </Card>

    </div>
  )
}