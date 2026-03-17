import { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { crearFactura, emitirFactura, getFacturaByNumero, actualizarFactura, getFacturaById  } from "../../api/invoices"
import { validarNif, validarBase, validarFecha } from "../../utils/validator"
import { getClients } from "../../api/clients"
import { getBillingStatus } from "../../api/billing"
import { getSifs, createSif } from "../../api/sif"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

function normalizarNif(nif) {
  return nif
    ?.toUpperCase()
    .replace(/[\s-]/g, "")
    .trim()
}


export default function EmitirFactura() {

  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  useEffect(() => {
    if (id) {
      cargarFacturaExistente()
    }
  }, [id])

  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [billing, setBilling] = useState(null)

  const [searchParams] = useSearchParams()

  const tipoFromUrl = searchParams.get("tipo")
  const originalFromUrl = searchParams.get("original")

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    getBillingStatus()
      .then(setBilling)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (tipoFromUrl) {
      setTipoFactura(tipoFromUrl)
    }

    if (originalFromUrl) {
      setFacturaRectificadaId(originalFromUrl)
    }
  }, [tipoFromUrl, originalFromUrl])

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
    fetchSifs()
  }, [])

  async function fetchClients() {
    try {
      const data = await getClients()
      setClients(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchSifs() {
    try {
      const res = await getSifs()

      console.log("RESPUESTA COMPLETA:", res)
      console.log("DATA:", res?.data)

      setSifs(res.data)

      const defaultSif = res.data.find(s => s.es_default)
      if (defaultSif) {
        setSelectedSifId(defaultSif.id)
      }

    } catch (err) {
      console.error("ERROR FETCH SIFS:", err)
    }
  }

  const [lines, setLines] = useState([
    {
      concepto: "",
      cantidad: 1,
      precio_unitario: "",
      iva: 21,
      irpf: 0,
    }
  ])

  const addLine = () => {
    setLines([
      ...lines,
      { concepto: "",cantidad: 1, precio_unitario: "", iva: 21, irpf: 0 }
    ])
  }

  const removeLine = (index) => {
    const nuevas = [...lines]
    nuevas.splice(index, 1)
    setLines(nuevas)
  }

  const updateLine = (index, field, value) => {
    const nuevas = [...lines]
    nuevas[index][field] = value
    setLines(nuevas)
  }

  const totalBase = lines.reduce(
    (acc, l) => acc + (Number(l.cantidad || 0) * Number(l.precio_unitario || 0)),
  0
  )

  const totalIva = lines.reduce(
    (acc, l) => acc + Number(l.cantidad || 0) * Number(l.precio_unitario || 0) * 
    Number(l.iva || 0) / 100,0
  )

  const totalIrpf = lines.reduce(
    (acc, l) => acc + Number(l.cantidad || 0) * Number(l.precio_unitario || 0) *
     Number(l.irpf || 0) / 100,0
  )

  const totalFactura = totalBase + totalIva - totalIrpf

  
  const [invoiceId, setInvoiceId] = useState(null)
  const [tipoFactura, setTipoFactura] = useState("F1")
  const [facturaRectificadaId, setFacturaRectificadaId] = useState("")
  const [motivoRectificacion, setMotivoRectificacion] = useState("")
  const [loading, setLoading] = useState(false)
  

  //const cuotaIva = (Number(base) * Number(iva)) / 100
  //const total = Number(base) + cuotaIva

  const [clienteNombre, setClienteNombre] = useState("")
  const [clienteNif, setClienteNif] = useState("")
  const [direccion, setDireccion] = useState("")
  const [codigoPostal, setCodigoPostal] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [provincia, setProvincia] = useState("")
  const [clientePais, setClientePais] = useState("ES")

  const [fechaEmision, setFechaEmision] = useState("")

  const IVAS_VALIDOS = [0, 4, 10, 21]

  const [errores, setErrores] = useState({})

  const [debouncedNumero, setDebouncedNumero] = useState("")

  const [facturaOriginal, setFacturaOriginal] = useState(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedNumero(facturaRectificadaId)
    }, 1000) // espera 500ms
    return () => clearTimeout(timeout)
  }, [facturaRectificadaId])

  const isRectificativa = tipoFactura === "R1" || tipoFactura === "R2"
  const isR2 = tipoFactura === "R2"

  useEffect(() => {
    if (
      isRectificativa &&
      debouncedNumero.trim() &&
      clients.length > 0 // 🔥 CLAVE
    ) {
      cargarFacturaOriginal()
    }
  }, [debouncedNumero, tipoFactura, clients])

  async function handleCrear(e) {
    e.preventDefault()

    const nuevosErrores = {}

    if (!validarFecha(fechaEmision)) {
      nuevosErrores.fechaEmision = "La fecha no puede ser futura"
    }

    if (!validarNif(clienteNif)) {
      nuevosErrores.clienteNif = "DNI, NIE o CIF no válido"
    }

    if (!isR2 && !validarBase(totalBase)) {
      nuevosErrores.base = "La base imponible debe ser mayor que 0"
    }

    if (isRectificativa) {
      if (!facturaRectificadaId.trim()) {
        nuevosErrores.facturaRectificadaId = "Debe indicar la factura original"
      }

      if (!motivoRectificacion.trim()) {
        nuevosErrores.motivoRectificacion = "Debe indicar el motivo de rectificación"
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      alert(
        Object.values(nuevosErrores).join("\n")
      )
      return // ⛔ no se envía
    }

    if (!/^\d{5}$/.test(codigoPostal)) {
      nuevosErrores.codigoPostal = "Código postal no válido"
    }
    
    if (!ciudad.trim()) nuevosErrores.ciudad = "Ciudad obligatoria"
    if (!provincia.trim()) nuevosErrores.provincia = "Provincia obligatoria"


    lines.forEach((line, i) => {
      if (!line.concepto.trim()) {
        nuevosErrores[`line_${i}`] = `Concepto obligatorio en línea ${i + 1}`
      }

      if (!IVAS_VALIDOS.includes(Number(line.iva))) {
        nuevosErrores[`line_${i}`] = `IVA inválido en línea ${i + 1}`
      }

      if (tipoFactura !== "R2" && (Number(line.cantidad) <= 0 || Number(line.precio_unitario) <= 0)) {
        nuevosErrores[`line_${i}`] = `Cantidad o precio inválido en línea ${i + 1}`
      }
    })

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      alert(Object.values(nuevosErrores).join("\n"))
      return
    }

    setErrores({})
    setLoading(true)

    try {
      const direccionCompleta = `${direccion}, ${codigoPostal} ${ciudad} (${provincia})`

      const linesPayload = lines.map(l => ({
        concepto: l.concepto,
        cantidad: Number(l.cantidad || 0),
        precio_unitario: Number(l.precio_unitario || 0),
        iva: Number(l.iva || 0),
        irpf: Number(l.irpf || 0)        
      }))

      let sifIdFinal = selectedSifId

      if (isNewSif) {
        const res = await createSif(nuevoSif)
        sifIdFinal = res.id
      }

      const payload = {
        tipo_factura: tipoFactura,
        factura_rectificada_id: tipoFactura !== "F1" ? facturaRectificadaId : null,
        motivo_rectificacion: tipoFactura !== "F1" ? motivoRectificacion : null,
        sif_id: sifIdFinal,
        cliente_nombre: clienteNombre,
        cliente_nif: clienteNif,
        cliente_pais: clientePais,
        cliente_direccion: direccionCompleta,
        fecha_emision: fechaEmision,
        lines: linesPayload
      }

      let res

      if (isEditing) {
        res = await actualizarFactura(invoiceId, payload)
        alert("Borrador actualizado")
      } else {
        res = await crearFactura(payload)
        alert("Factura creada como BORRADOR")
        setInvoiceId(res.invoice_id)
      }
      
    } catch (err) {
      alert("Error al crear factura")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleEmitir() {
    if (!invoiceId) {
      alert("Primero crea la factura")
      return
    }

    try {
      await emitirFactura(invoiceId)
      alert("Factura EMITIDA correctamente")
      const updatedBilling = await getBillingStatus()
      setBilling(updatedBilling)
    } catch (err) {
      alert("Error al emitir factura")
      console.error(err)
    }
  }

  function parseDireccion(dir) {
    try {
      const partes = dir.split(",")

      const calle = partes[0]?.trim() || ""

      const cpCiudad = partes[1]?.trim() || ""
      const matchCp = cpCiudad.match(/^(\d{5})\s+(.*)$/)

      const codigoPostal = matchCp ? matchCp[1] : ""
      let ciudad = matchCp ? matchCp[2] : ""

      ciudad = ciudad.replace(/\(.*?\)/, "").trim()

      const provinciaMatch = dir.match(/\((.*?)\)/)
      const provincia = provinciaMatch ? provinciaMatch[1] : ""

      return {
        direccion: calle,
        codigoPostal,
        ciudad,
        provincia
      }
    } catch (e) {
      console.error("Error parseando dirección:", dir)
      return {
        direccion: "",
        codigoPostal: "",
        ciudad: "",
        provincia: ""
      }
    }
  }  

  async function cargarFacturaOriginal() {

    try {
      const res = await getFacturaByNumero(facturaRectificadaId)

      const factura = res.invoice
      const lines = res.lines

      // 👇 DATOS CLIENTE
      setClienteNombre(factura.cliente_nombre)
      setClienteNif(factura.cliente_nif)
      setClientePais(factura.cliente_pais)

      const clienteExistente = clients.find(
        c => normalizarNif(c.nif) === normalizarNif(factura.cliente_nif)
      )

      if (clienteExistente) {
        setSelectedClientId(clienteExistente.id)
      } else {
        setSelectedClientId("")
      }


      // ⚠️ tú tienes dirección separada → simplificamos por ahora 
      const dir = factura.cliente_direccion || ""

      const parsed = parseDireccion(dir)

        setDireccion(parsed.direccion)
        setCodigoPostal(parsed.codigoPostal)
        setCiudad(parsed.ciudad)
        setProvincia(parsed.provincia) 

      setFacturaOriginal(factura)

      if (isR2) {
        setSelectedClientId("") // sin seleccionar nada
      }

      // 👇 FECHA
      setFechaEmision(factura.fecha_emision.slice(0,16))

      // 👇 LÍNEAS
      const mappedLines = lines.map(l => ({
        concepto: l.descripcion,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        iva: l.iva_tipo,
        irpf: l.irpf_porcentaje
      }))


      if (tipoFactura === "R1") {
        setLines(mappedLines)
      }

      if (tipoFactura === "R2") {
        setLines([
          {
            concepto: "",
            cantidad: 1,
            precio_unitario: "",
            iva: 21,
            irpf: 0,
          }
        ])
      }

    } catch (err) {
      if (err?.response?.status === 404) {
        alert("Factura no encontrada")
      } else {
        alert("Error cargando factura")
      }

    }
  }

  async function cargarFacturaExistente() {

    const res = await getFacturaById(id)

    const factura = res.invoice
    const lines = res.lines

    setInvoiceId(factura.id)

    setClienteNombre(factura.cliente_nombre)
    setClienteNif(factura.cliente_nif)
    setClientePais(factura.cliente_pais)

    const parsed = parseDireccion(factura.cliente_direccion)

    setDireccion(parsed.direccion)
    setCodigoPostal(parsed.codigoPostal)
    setCiudad(parsed.ciudad)
    setProvincia(parsed.provincia)

    setFechaEmision(factura.fecha_emision.slice(0,16))

    setLines(lines.map(l => ({
      concepto: l.descripcion,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      iva: l.iva_tipo,
      irpf: l.irpf_porcentaje
    })))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Crear factura</h1>


      <form onSubmit={handleCrear}className="space-y-6">
        {/* 🧾 TIPO */}
        <Card>
          <h3 className="font-semibold mb-4">Tipo de factura</h3>

          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={tipoFactura}
            onChange={(e) => setTipoFactura(e.target.value)}
          >
            <option value="F1">Factura normal</option>
            <option value="R1">Rectificativa por sustitución</option>
            <option value="R2">Rectificativa por diferencia</option>
          </select>
        </Card>

        {/* 🧾 RECTIFICATIVA */}
        {tipoFactura !== "F1" && (
          <Card>
            <h3 className="font-semibold mb-4">Factura rectificativa</h3>
            <div className="space-y-4">
              <Input
                type="text"
                value={facturaRectificadaId}
                onChange={(e) => setFacturaRectificadaId(e.target.value)}
                placeholder="Número de factura original (Ej: F-000001)"
                required
              />
              <textarea
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Motivo de rectificación"
                value={motivoRectificacion}
                onChange={(e) => setMotivoRectificacion(e.target.value)}
                required
              />
            </div>
          </Card>
        )}

        {/* 📅 FECHA */}
        <Card>
          <h3 className="font-semibold mb-4">Fecha</h3>
          <Input
            type="datetime-local"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
            required
          />
          {errores.fechaEmision && (
            <p className="text-red-500 text-sm mt-1">
            {errores.fechaEmision}
          </p>
          )}
        </Card>

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
              <Input placeholder="Alias" value={nuevoSif.alias}
                onChange={(e) => setNuevoSif({ ...nuevoSif, alias: e.target.value })}
              />
              <Input placeholder="Software" value={nuevoSif.software_nombre}
                onChange={(e) => setNuevoSif({ ...nuevoSif, software_nombre: e.target.value })}
              />
              <Input  placeholder="Versión" value={nuevoSif.version}
                onChange={(e) => setNuevoSif({ ...nuevoSif, version: e.target.value })}
              />
              <Input
                placeholder="NIF (opcional)" value={nuevoSif.nif} onChange={(e) => setNuevoSif({ ...nuevoSif, nif: e.target.value })}
              />
            </div>
          )}
        </Card>

        {/* 👤 CLIENTE */}
        <Card>
          <h3 className="font-semibold mb-4">Cliente</h3>
          <select
            className="border rounded-lg px-3 py-2 w-full mb-4 disabled:bg-gray-100"
            value={selectedClientId}
            disabled={isR2}
            onChange={(e) => {
              const value = e.target.value
              setSelectedClientId(value)

              // si está vacío → nuevo cliente
              if (!value) {
                setClienteNombre("")
                setClienteNif("")
                setDireccion("")
                setCodigoPostal("")
                setCiudad("")
                setProvincia("")
                return
              }

              // cliente existente
              const cliente = clients.find(c => c.id === value)

              if (cliente) {
                setClienteNombre(cliente.nombre)
                setClienteNif(cliente.nif)

                const parsed = parseDireccion(cliente.direccion || "")

                setDireccion(parsed.direccion)
                setCodigoPostal(parsed.codigoPostal)
                setCiudad(parsed.ciudad)
                setProvincia(parsed.provincia)
              }
            }}
          >
            {!isR2 && <option value="">-- Nuevo cliente --</option>}
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.nif})
              </option>
            ))}
          </select>

          {isR2 && (
            <p className="text-xs text-gray-500 mb-2">
              Datos heredados de la factura original
            </p>
          )}
        
          <div className="grid grid-cols-2 gap-4">
            <label>Cliente / Razón social</label><br />
            <Input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              disabled={isR2}
              required
            />
         
            <label>NIF cliente</label><br />
            <Input
              type="text"
              value={clienteNif}
              onChange={(e) => setClienteNif(e.target.value)}
              disabled={isR2}
              required
            />
            {errores.clienteNif && (
              <small style={{ color: "red" }}>{errores.clienteNif}</small>
            )}
          
            <label>Calle y número</label><br />
            <Input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              disabled={isR2}
              required
            />

            <label>Código postal</label><br />
            <Input
              type="text"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              disabled={isR2}
              required
            />
  
            <label>Ciudad</label><br />
            <Input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              disabled={isR2}
              required
            />
          
            <label>Provincia</label><br />
            <Input
              type="text"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              disabled={isR2}
              required
            />
          </div>
        </Card>  

        {/* 📊 LÍNEAS */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Líneas</h3>
            <Button type="button" onClick={addLine}>+ Añadir</Button>
          </div>

            <div className="space-y-3">
              {lines.map((line, index) => {
                const cantidad = Number(line.cantidad || 0)
                const precio = Number(line.precio_unitario || 0)

                const base = cantidad * precio
                const cuotaIva = base * Number(line.iva || 0) / 100
                const cuotaIrpf = base * Number(line.irpf || 0) / 100
                const totalLinea = base + cuotaIva - cuotaIrpf

                return (
                  <div key={index} className="grid grid-cols-6 gap-2 items-center">
                    
                    <Input
                      placeholder="Servicio/producto"
                      value={line.concepto}
                      onChange={(e)=>updateLine(index,"concepto",e.target.value)}
                    />

                    <Input
                      type="number"
                      min={tipoFactura === "R2" ? undefined : "0"}
                      step="1"
                      value={line.cantidad}
                      onChange={(e)=>updateLine(index,"cantidad",e.target.value)}
                    />            

                    <Input
                      type="number"
                      min={tipoFactura === "R2" ? undefined : "0"}
                      step="0.01"
                      value={line.precio_unitario}
                      onChange={(e)=>updateLine(index,"precio_unitario",e.target.value)}
                    />
                   
                    <Input
                      type="number"
                      value={line.iva}
                      onChange={(e)=>updateLine(index,"iva",e.target.value)}
                    />
                    
                    <Input
                      type="number"
                      value={line.irpf}
                      onChange={(e)=>updateLine(index,"irpf",e.target.value)}
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {totalLinea.toFixed(2)}€
                      </span>

                      {lines.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={()=>removeLine(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* 💰 TOTALES */}
        <Card>
          <h3 className="font-semibold mb-2">Resumen</h3>
          
          <div className="text-sm space-y-1">
            <p>Base: {totalBase.toFixed(2)} €</p>
            <p>IVA: {totalIva.toFixed(2)} €</p>
            <p>IRPF: {totalIrpf.toFixed(2)} €</p>

            <p className="font-bold text-lg mt-2">
              Total: {totalFactura.toFixed(2)} €
            </p>
          </div>
        </Card>

        {/* 🔘 ACCIONES */}
        <div className="flex gap-3 flex-wrap">
          <Button type="submit">
            {isEditing ? "Actualizar borrador" : "Crear borrador"}
          </Button>

          {invoiceId && (
            <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleEmitir}
              disabled={billing && billing.restantes <= 0}
            >
              Emitir factura
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/registro/${invoiceId}`)}
            >
              Ver borrador
            </Button>
            </>
          )}
        </div>

      </form>
      
      {/* 📊 USO */}
      {billing && (
        <p className="text-sm text-gray-500">
          {billing.usadas} / {billing.limite} facturas usadas
        </p>
      )}      
    </div>
  )
}