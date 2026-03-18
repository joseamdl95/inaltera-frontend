import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { importarFacturaPDF, emitirFactura } from "../../api/invoices" 
import { getBillingStatus } from "../../api/billing"
import { getSifs, createSif } from "../../api/sif"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

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

  const [dragging, setDragging] = useState(false)

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

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]

    if (file && file.type === "application/pdf") {
      setArchivo(file)
    } else {
      alert("Solo se permiten PDFs")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Importar factura desde PDF</h1>

      {/* 📊 USO */}
      {billing && (
        <p className="text-sm text-gray-500">
        {billing.usadas} / {billing.limite} facturas usadas
      </p>
      )}

      {!invoiceId ? (
        <form onSubmit={handleUpload}  className="space-y-6">

          {/* 🧩 SIF */}
          <Card>
            <h3 className="font-semibold mb-4">Sistema de facturación</h3>
            <select
              className="border rounded-lg px-3 py-2 w-full"
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
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Input
                  placeholder="Alias"
                  value={nuevoSif.alias}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, alias: e.target.value })
                  }
                />

                <Input
                  placeholder="Software"
                  value={nuevoSif.software_nombre}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, software_nombre: e.target.value })
                  }
                />

                <Input
                  placeholder="Versión"
                  value={nuevoSif.version}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, version: e.target.value })
                  }
                />

                <Input
                  placeholder="NIF (opcional)"
                  value={nuevoSif.nif}
                  onChange={(e) =>
                    setNuevoSif({ ...nuevoSif, nif: e.target.value })
                  }
                />
              </div>
            )}
          </Card>

          {/* 📄 PDF */}
          <Card>
            <h3 className="font-semibold mb-4">Archivo PDF</h3>

            <label 
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                setDragging(false)
                handleDrop(e)
              }}
              onDragOver={handleDragOver}
              className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition
                ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              `}
            >

              <span className="text-sm text-gray-600">
                Haz clic para subir un PDF
              </span>

              <span className="text-xs text-gray-400 mt-1">
                o arrástralo aquí
              </span>

              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>

            {archivo && (
              <div className="mt-3 text-sm text-green-600">
                ✔ {archivo.name}
              </div>
            )}
          </Card>

          {/* 🔘 ACCIÓN */}
          <Button type="submit" disabled={loading || !archivo}>
            {loading ? "Procesando IA..." : "Cargar e Importar PDF"}
          </Button>
        </form>
      ) : (
        <Card>
          <p className="text-blue-700 mb-4">{mensaje}</p>

          <div className="flex gap-3 flex-wrap">
          
            <Button 
              onClick={handleEmitir} 
              disabled={loading || billing && billing.restantes <= 0}
              style={{ backgroundColor: "#16a34a", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}
            >
              {loading ? "Sellando y Registrando..." : "Sellar y Emitir Factura"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate(`/registro/${invoiceId}`)}
            >
              Ir al borrador
            </Button>

            <Button 
              variant="secondary"
              onClick={() => { setInvoiceId(null); setArchivo(null); }} 
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}