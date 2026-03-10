
import { useEffect, useState } from "react"
import { listarFacturas, emitirFactura, anularFactura, anularBorrador, descargarFactura, descargarXmlFactura, descargarXmlAnulacion } from "../../api/invoices"
import { getBillingStatus } from "../../api/billing"

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

  const [logsIntegrity, setLogsIntegrity] = useState(null)
  const [facturasIntegrity, setFacturasIntegrity] = useState(null)

  async function descargarPdf(invoiceId) {
    try {

      const res = await descargarFactura(invoiceId)

      if (!data.url) {
        throw new Error("URL de descarga no disponible")
      }

      window.open(data.url, "_blank")

    } catch (e) {
      console.error("Error descargando PDF", e)
    }
  }

  async function descargarXml(invoiceId) {
    try {

      const res = await descargarXmlFactura(invoiceId)

      if (!data.url) {
        throw new Error("URL de descarga no disponible")
      }

      window.open(data.url, "_blank")

    } catch (e) {
      console.error("Error descargando XML", e)
    }
  }

  async function descargarXmlAnulacionFactura(invoiceId) {
    try {

      const res = await descargarXmlAnulacion(invoiceId)

      if (!data.url) {
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
    <div>
      <h1>Registro de facturas</h1>

      {logsIntegrity !== null && (
        <div style={{
          padding: "8px 12px",
          marginBottom: 15,
          borderRadius: 6,
          backgroundColor: logsIntegrity ? "#e8f5e9" : "#ffebee",
          color: logsIntegrity ? "#2e7d32" : "#c62828",
          fontWeight: "bold"
        }}>
          {logsIntegrity
            ? "✔ Integridad de registros verificada"
            : "⚠ Integridad de logs comprometida"}
        </div>
      )}

      {facturasIntegrity !== null && (
        <div style={{
          padding: "8px 12px",
          marginBottom: 15,
          borderRadius: 6,
          backgroundColor: facturasIntegrity ? "#e8f5e9" : "#ffebee",
          color: facturasIntegrity ? "#2e7d32" : "#c62828",
          fontWeight: "bold"
        }}>
          {facturasIntegrity
            ? "✔ Integridad de cadena de facturas verificada"
            : "⚠ Integridad de facturación comprometida"}
        </div>
      )}

      {billing && (
        <div style={{ marginBottom: 20 }}>
          <strong>
            {billing.usadas} / {billing.limite} facturas usadas este mes
          </strong>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Número</th>
            <th>NIF de Cliente</th>
            <th>Total (€)</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {facturas.map((f) => (
            <tr key={f.id}>
              <td>{f.fecha}</td>
              <td>{f.numero}</td>
              <td>{f.cliente_nif}</td>
              <td>{f.total.toFixed(2)}</td>
              <td>{f.estado}</td>
              <td>
                {f.estado === "BORRADOR" && (
                  <>
                    <button disabled={billing && billing.restantes <= 0} onClick={() => handleEmitir(f.id)}>
                      
                      Emitir
                    </button>
                  
                    <button onClick={() => handleAnularBorrador(f.id)}>
                      Anular Borrador
                    </button>
                  </>
                )}
                {f.estado !== "BORRADOR" && !f.numero.includes("BORRADOR") && (
                  <>
                    <button onClick={() => descargarXml(f.id)}>
                      Descargar XML
                    </button>

                    {f.pdfDisponible && (
                      <button onClick={() => descargarPdf(f.id)}>
                        Descargar PDF
                      </button>
                    )}

                  </>

                )}
                {f.estado === "EMITIDA"  && (
                  <>
                    
                    <button 
                      onClick={() => handleAnular(f.id)}
                      style={{ marginLeft: 8, backgroundColor: "#c0392b", color: "white" }}
                    >
                      Anular
                    </button>
                  </>
                )}

                {f.estado === "ANULADA" && (
                  <button onClick={() => descargarXmlAnulacionFactura(f.id)}>
                    XML Anulación
                  </button>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}>
        <button 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>

        <span style={{ margin: "0 10px" }}>
           Página {page} de {totalPages}
        </span>

        <button 
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
      {showModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
             width: 400
            }}>
              <h3>Motivo de anulación</h3>

              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                style={{ width: "100%", marginBottom: 10 }}
              />

              <div style={{ textAlign: "right" }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ marginRight: 10 }}
                >
                  Cancelar
                </button>

                <button 
                  onClick={confirmarAnulacion}
                  style={{ backgroundColor: "#c0392b", color: "white" }}
                >
                  Confirmar Anulación
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}