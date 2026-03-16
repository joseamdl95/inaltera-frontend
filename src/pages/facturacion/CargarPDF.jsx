import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { importarFacturaPDF, emitirFactura } from "../../api/invoices" 
import { getBillingStatus } from "../../api/billing"
import { getSifs, createSif } from "../../api/sif"

export default function CargarPDF() {
  const navigate = useNavigate()
  const [archivo, setArchivo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [invoiceId, setInvoiceId] = useState(null) // Para guardar el ID de la factura creada
  const [mensaje, setMensaje] = useState("")
  const [billing, setBilling] = useState(null)
  const [sifs, setSifs] = useState([])
  const [selectedSifId, setSelectedSifId] = useState("")
  const [isNewSif, setIsNewSif] = useState(false)

  const [nuevoSif, setNuevoSif] = useState({
    alias: "",
    software_nombre: "",
    version: "",
    nif: ""
  })

  useEffect(() => {
    getBillingStatus()
      .then(setBilling)
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetchSifs()
  }, [])

  async function fetchSifs() {
    try {
      const res = await getSifs()
      setSifs(res.data)

      const defaultSif = res.data.find(s => s.es_default)
      if (defaultSif) {
        setSelectedSifId(defaultSif.id)
      }
    } catch (err) {
      console.error("ERROR FETCH SIFS:", err)
    }
  }

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0])
    setInvoiceId(null) // Resetear si cambia el archivo
    setMensaje("")
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!archivo) return alert("Selecciona un archivo PDF")

    setLoading(true)
    try {
      let sifIdFinal = selectedSifId

      if (isNewSif) {
        const resSif = await createSif(nuevoSif)
        sifIdFinal = resSif.id
      }

      const res = await importarFacturaPDF(archivo, sifIdFinal)
      
      console.log("Respuesta del servidor:", res); // Ahora verás que trae 'invoice_id'

      // CAMBIO AQUÍ: Usar res.invoice_id en lugar de res.id
      if (res && res.invoice_id) {
        setInvoiceId(res.invoice_id) 
        setMensaje("Factura importada como BORRADOR. Puedes emitirla ahora o revisarla antes desde su detalle.")
      } else {
        alert("No se recibió el ID de la factura")
      }
    } catch (e) {
      alert("Error al subir el PDF")
    } finally {
      setLoading(false)
    }
  }

  const handleEmitir = async () => {
    if (!invoiceId) return

    setLoading(true)
    try {
      // Llamada al endpoint de emisión que revisamos antes
      await emitirFactura(invoiceId)
      alert("¡Factura emitida legalmente y PDF sellado!")
      const updatedBilling = await getBillingStatus()
      setBilling(updatedBilling)
      
      // Limpiar estado tras éxito
      setInvoiceId(null)
      setArchivo(null)
      setMensaje("Factura completada con éxito.")
    } catch (error) {
      console.error(error)
      alert("Error al emitir la factura")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h1>Cargar factura PDF</h1>

      {billing && (
        <div style={{ marginBottom: 20 }}>
          {billing.usadas} / {billing.limite} facturas usadas
        </div>
      )}

      {!invoiceId ? (
        <form onSubmit={handleUpload}>

          <div>
            <label>Sistema de facturación (SIF)</label><br />
            <select
              value={selectedSifId}
              onChange={(e) => {
                const value = e.target.value

                if (value === "new") {
                  setIsNewSif(true)
                  setSelectedSifId("")
                } else {
                  setIsNewSif(false)
                  setSelectedSifId(value)
                }
              }}
            >
              <option value="">-- Seleccionar SIF --</option>

              {sifs.map(s => (
                <option key={s.id} value={s.id}>
                  {s.alias} ({s.software_nombre} v{s.version})
                </option>
              ))}

              <option value="new">+ Nuevo SIF</option>
            </select>

            {isNewSif && (
              <div>
                <input
                  placeholder="Alias"
                  value={nuevoSif.alias}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, alias: e.target.value })
                  }
                />

                <input
                  placeholder="Software"
                  value={nuevoSif.software_nombre}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, software_nombre: e.target.value })
                  }
                />

                <input
                  placeholder="Versión"
                  value={nuevoSif.version}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, version: e.target.value })
                  }
                />

                <input
                  placeholder="NIF (opcional)"
                  value={nuevoSif.nif}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, nif: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading}
          />
          {archivo && <p>Archivo seleccionado: {archivo.name}</p>}
          <br />
          <button type="submit" disabled={loading || !archivo}>
            {loading ? "Procesando IA..." : "Cargar e Importar PDF"}
          </button>
        </form>
      ) : (
        <div style={{ backgroundColor: "#f0f9ff", padding: "15px", borderRadius: "5px" }}>
          <p style={{ color: "#0369a1" }}>{mensaje}</p>
          
          <button 
            onClick={handleEmitir} 
            disabled={loading || billing && billing.restantes <= 0}
            style={{ backgroundColor: "#16a34a", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}
          >
            {loading ? "Sellando y Registrando..." : "Sellar y Emitir Factura"}
          </button>

          <button
            onClick={() => navigate(`/registro/${invoiceId}`)}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            Ir al borrador
          </button>

          <button 
            onClick={() => { setInvoiceId(null); setArchivo(null); }} 
            style={{ marginLeft: "10px", background: "none", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}