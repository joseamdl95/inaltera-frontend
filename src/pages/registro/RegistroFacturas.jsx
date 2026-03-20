import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listarFacturas, emitirFactura, anularFactura, anularBorrador, descargarFactura, descargarXmlFactura, descargarXmlAnulacion } from "../../api/invoices"
import { getBillingStatus } from "../../api/billing"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

export default function RegistroFacturas() {
  
  const [facturas, setFacturas] = useState([])
  const [search, setSearch] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [invoiceToCancel, setInvoiceToCancel] = useState(null)
  const [billing, setBilling] = useState(null)
  const navigate = useNavigate()

  const [logsIntegrity, setLogsIntegrity] = useState(null)
  const [facturasIntegrity, setFacturasIntegrity] = useState(null)

  async function descargarPdf(invoiceId) {
    try {

      const data = await descargarFactura(invoiceId)

      console.log("respuesta backend:", data)

      if (!data || !data.url) {
        throw new Error("URL de descarga no disponible")
      }

      window.open(data.url, "_blank")

    } catch (e) {
      console.error("Error descargando PDF", e)
    }
  }

  async function descargarXml(invoiceId) {
    try {

      const data = await descargarXmlFactura(invoiceId)

      if (!data || !data.url) {
        throw new Error("URL de descarga no disponible")
      }

      window.open(data.url, "_blank")

    } catch (e) {
      console.error("Error descargando XML", e)
    }
  }

  async function descargarXmlAnulacionFactura(invoiceId) {
    try {

      const data = await descargarXmlAnulacion(invoiceId)

      if (!data || !data.url) {
        throw new Error("URL de descarga no disponible")
      }

      window.open(data.url, "_blank")

    } catch (e) {
      console.error("Error descargando XML de anulación", e)
    }
  }

  async function cargar() {
    try {
      const response = await listarFacturas({
        search,
        desde,
        hasta,
        page
      })

      const adaptadas = response.data.map((f) => ({
        id: f.id,
        fecha: f.fecha_emision,
        numero: f.numero,
        cliente_nif: f.cliente_nif,
        total: Number(f.total),
        estado: f.estado,
        pdfDisponible: f.pdf_disponible,
        downloadUrl: f.download_url
      }))


      setFacturas(adaptadas)
      setTotalPages(response.total_pages)

      setLogsIntegrity(response.logs_integrity)
      setFacturasIntegrity(response.facturas_integrity)

    } catch (e) {
      console.error("Error cargando facturas", e)
    }
  }
  useEffect(() => {
    const t = setTimeout(() =>{
      cargar()
    },300)
    
    return() => clearTimeout(t)
  }, [search, desde, hasta, page])

  useEffect(() => {
    getBillingStatus()
      .then(setBilling)
      .catch(console.error)
  }, [])

  async function handleEmitir(invoiceId) {
    const confirmar = confirm("¿Emitir esta factura definitivamente?")
    if (!confirmar) return

    try {
      await emitirFactura(invoiceId)
      alert("Factura emitida correctamente")
      await cargar() // 🔁 refrescar listado
      const updatedBilling = await getBillingStatus()
      setBilling(updatedBilling)
    } catch (e) {
      console.error(e)
      alert("Error al emitir factura")
    }
  }

  async function handleAnular(invoiceId) {
    setInvoiceToCancel(invoiceId)
    setMotivo("")
    setShowModal(true)
  }

  async function handleAnularBorrador(invoiceId) {
    try {
      await anularBorrador(invoiceId)
      alert("Factura anulada correctamente")
      cargar()
    } catch (e) {
      console.error(e)
      alert("Error al anular factura")
    }
    
  }

  async function confirmarAnulacion() {
    if (!motivo.trim()) {
      alert("Debes indicar un motivo")
      return
    }

    try {
      await anularFactura(invoiceToCancel, motivo)
      alert("Factura anulada correctamente")
      setShowModal(false)
      cargar()
    } catch (e) {
      console.error(e)
      alert("Error al anular factura")
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Registro de facturas</h1>

      <div className="flex flex-wrap items-center gap-3">

        {/* 🟢 LOGS */}
        {logsIntegrity !== null && (
          <div className={`
            px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
            ${logsIntegrity ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
          `}>
            {logsIntegrity
              ? "✔ Logs OK"
              : "⚠ Logs comprometidos"}
          </div>
        )}

        {/* 🟢 FACTURAS */}
        {facturasIntegrity !== null && (
          <div className={`
            px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
            ${facturasIntegrity ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
          `}>
            {facturasIntegrity
              ? "✔ Facturas OK"
              : "⚠ Facturas comprometidas"}
          </div>
        )}

        {/* 📊 USO */}
        {billing && (
          <div className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 whitespace-nowrap">
            {billing.usadas} / {billing.limite} usadas
          </div>
        )}

      </div>

      {/* 📋 TABLA */}
      <Card>
        
        {/* 🔎 FILTROS */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">

            {/* 🔎 BUSCAR (2/3) */}
            <div className="col-span-2">
              <Input
                placeholder="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* 📅 FECHAS (1/3 dividido en 2) */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />

              <Input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Número</th>
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-t">

                  <td className="px-3 py-2">{f.fecha}</td>

                  <td className="px-3 py-2 font-medium">{f.numero}</td>

                  <td className="px-3 py-2">{f.cliente_nif}</td>

                  <td className="px-3 py-2">
                    {f.total.toFixed(2)} €
                  </td>

                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${
                        f.estado === "EMITIDA"
                          ? "bg-green-100 text-green-700"
                          : f.estado === "BORRADOR"
                          ? "bg-yellow-100 text-yellow-700"
                          : f.estado === "BORRADOR_ANULADO"
                          ? "bg-red-100 text-red-700"
                          : f.estado === "ANULADA"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}>
                      {f.estado}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex gap-2 flex-wrap">

                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/registro/${f.id}`)}
                      >
                        Ver
                      </Button>

                      {f.estado === "BORRADOR" && (
                        <>
                          <Button
                            onClick={() => handleEmitir(f.id)}
                            disabled={billing && billing.restantes <= 0}
                          >
                            Emitir
                          </Button>

                          <Button
                            onClick={() => handleAnularBorrador(f.id)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Anular Borrador
                          </Button>
                        </>
                      )}

                      {f.estado !== "BORRADOR" && !f.numero.includes("BORRADOR") && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => descargarXml(f.id)}
                          >
                            XML
                          </Button>

                          {f.pdfDisponible && (
                            <Button
                              variant="secondary"
                              onClick={() => descargarPdf(f.id)}
                            >
                              PDF
                            </Button>
                          )}
                        </>
                      )}

                      {f.estado === "EMITIDA" && (
                        <Button
                          onClick={() => handleAnular(f.id)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Anular
                        </Button>
                      )}

                      {f.estado === "ANULADA" && (
                        <Button
                          variant="secondary"
                          onClick={() => descargarXmlAnulacionFactura(f.id)}
                        >
                          XML Anulación
                        </Button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </Card>

      {/* 📄 PAGINACIÓN */}
      <div className="flex items-center justify-between">

        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </Button>

        <span className="text-sm text-gray-500">
          Página {page} de {totalPages}
        </span>

        <Button
          variant="secondary"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </Button>

      </div>

      {/* 🧾 MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

            <h3 className="font-semibold">Motivo de anulación</h3>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>

              <Button
                onClick={confirmarAnulacion}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Confirmar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}