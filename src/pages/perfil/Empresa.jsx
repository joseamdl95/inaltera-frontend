import { useEffect, useState } from "react"
import { getCompany, updateCompany, createCompany, uploadLogo } from "../../api/company"
import { validarNif, validarCP } from "../../utils/validator"
import { getSifs, createSif, updateSif, setDefaultSif } from "../../api/sif"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

export default function Empresa() {
  const [hasCompany, setHasCompany] = useState(false)

  const [empresa, setEmpresa] = useState({
    razon_social: "",
    nif: "",
    pais: "ES",
  })

  const [logoUrl, setLogoUrl] = useState(null)

  // Estados individuales para la dirección
  const [calle, setCalle] = useState("")
  const [codigoPostal, setCodigoPostal] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [provincia, setProvincia] = useState("")

  useEffect(() => {
    getCompany().then((data) => {
      if (data?.id) {
        setHasCompany(true)
        setEmpresa({
          razon_social: data.razon_social,
          nif: data.nif,
          pais: data.pais ?? "ES",
        })

        setLogoUrl(data.logo_url)

        // --- LÓGICA DE DESMONTAJE (REVERSE PARSE) ---
        if (data.direccion) {
          // Separamos por comas: "Calle Mayor 12, 28001 Madrid, (Madrid)"
          const partes = data.direccion.split(",").map(p => p.trim())
          
          // 1. La primera parte siempre es la Calle
          setCalle(partes[0] || "")

          // 2. La segunda parte suele ser "CP Ciudad" (Ej: "28001 Madrid")
          if (partes[1]) {
            const matchCP = partes[1].match(/^(\d{5})\s+(.*)$/)
            if (matchCP) {
              setCodigoPostal(matchCP[1])
              setCiudad(matchCP[2])
            } else {
              setCiudad(partes[1]) // Por si no hay CP
            }
          }

          // 3. La tercera parte es la Provincia: "(Madrid)" -> "Madrid"
          if (partes[2]) {
            setProvincia(partes[2].replace(/[()]/g, ""))
          }
        }
      }
    })
  }, [])

  const [sifs, setSifs] = useState([])
  const [editingSif, setEditingSif] = useState(null)
  const [nuevoSif, setNuevoSif] = useState({
    alias: "",
    software_nombre: "",
    version: "",
    nif: ""
  })

  useEffect(() => {
    fetchSifs()
  }, [])

  async function fetchSifs() {
    const res = await getSifs()
    setSifs(res.data)
  }

  const [showUploader, setShowUploader] = useState(false)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleLogoUpload(file)
  }

  async function handleLogoUpload(file) {
    if (!file) return

    try {
      const res = await uploadLogo(file)

      setLogoUrl(res.logo_url)

      alert("Logo subido correctamente")

    } catch (err) {
      console.error(err)
      alert("Error subiendo logo")
    }
  }

  const handleEmpresaChange = (e) => {
    setEmpresa({
      ...empresa,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // --- LÓGICA DE MONTAJE ---
    // Unimos los campos en el formato: "Calle, CP Ciudad, (Provincia)"
    const direccionCompleta = [
      calle,
      `${codigoPostal} ${ciudad}`.trim(),
      provincia ? `(${provincia})` : null
    ]
    .filter(Boolean)
    .join(", ")

    const payload = {
      razon_social: empresa.razon_social,
      nif: empresa.nif,
      pais: empresa.pais,
      direccion: direccionCompleta,
    }

    if (!validarNif(empresa.nif)) {
      alert("El NIF no tiene un formato válido")
      return
    }

    if (codigoPostal && !validarCP(codigoPostal)) {
      alert("El código postal debe tener 5 dígitos")
      return
    }

    try {
      if (hasCompany) {
        await updateCompany(payload)
      } else {
        await createCompany(payload)
        setHasCompany(true)
      }
      alert("Datos de la empresa guardados correctamente")
    } catch (e) {
      alert(e.message || "Error guardando datos de la empresa")
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 🖼 LOGO */}
      <Card>

        <div className="flex flex-col items-center gap-4">

          <h3 className="font-semibold">Logo de empresa</h3>

          {/* 🖼 PREVIEW */}
          {logoUrl && !showUploader && (
            <>
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <img
                  src={logoUrl + "?t=" + Date.now()}
                  className="h-32 object-contain"
                />
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowUploader(true)}
              >
                Cambiar logo
              </Button>
            </>
          )}

          {/* 📂 UPLOADER */}
          {(!logoUrl || showUploader) && (
            <label
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`w-full max-w-md flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition
              ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              <span className="text-sm text-gray-600 text-center">
                Haz clic o arrastra tu logo aquí
              </span>

              <span className="text-xs text-gray-400 mt-1">
                PNG o JPG recomendado
              </span>

              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handleLogoUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          )}

          {/* 🔙 CANCELAR */}
          {showUploader && logoUrl && (
            <Button
              variant="secondary"
              onClick={() => setShowUploader(false)}
            >
              Cancelar
            </Button>
          )}

        </div>

      </Card>

      {/* 🏢 EMPRESA */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">
          {hasCompany ? "Datos fiscales" : "Crear empresa"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Razón social</label><br />
            <Input 
              name="razon_social" 
              value={empresa.razon_social} 
              onChange={handleEmpresaChange} 
              required  
            />
          </div>

          <div>
            <label>NIF</label><br />
            <Input 
              name="nif" 
              value={empresa.nif} 
              onChange={handleEmpresaChange}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Calle</label><br />
              <Input 
                value={calle} 
                onChange={e => setCalle(e.target.value)} 
                placeholder="Calle Mayor 12 3ºA"
                required
              />
            </div>

            <div>
              <label>C.P.</label><br />
              <Input 
                style={{ width: "80px" }}
                value={codigoPostal} 
                onChange={(e) => setCodigoPostal(e.target.value)} 
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Ciudad</label><br />
              <Input 
                style={{ width: "100%" }}
                value={ciudad} 
                onChange={(e) => setCiudad(e.target.value)} 
                required
              />
            </div>
          
            <div>
              <label>Provincia</label><br />
              <Input 
                value={provincia} 
                onChange={(e) => setProvincia(e.target.value)} 
                required
              />
            </div>
          </div>

          <Button type="submit">
            {hasCompany ? "Guardar cambios" : "Crear empresa"}
          </Button>
        </form>
      </Card>

      {/* ⚙️ SIFS */}
      <Card>
        <h3 className="font-semibold mb-4">
          Sistemas de facturación (SIF)
        </h3>

        <div className="space-y-3">

          {sifs.map(s => (
            <div
              key={s.id}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{s.alias}</div>
                  <div className="text-sm text-gray-500">
                    {s.software_nombre} v{s.version}
                  </div>
                </div>

                {s.es_default && (
                  <span className="text-green-600 text-sm font-medium">
                    ✔ Predeterminado
                  </span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {!s.es_default && (
                  <Button
                    variant="secondary"
                    onClick={() => setDefaultSif(s.id).then(fetchSifs)}
                  >
                    Hacer predeterminado
                  </Button>
                )}

                {s.software_nombre !== "InAltera" && (
                  <Button
                    variant="secondary"
                    onClick={() => setEditingSif(s)}
                  >
                    Editar
                  </Button>
                )}
              </div>

              {/* EDIT */}
              {editingSif?.id === s.id && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Input
                    value={editingSif.alias}
                    onChange={e => setEditingSif({ ...editingSif, alias: e.target.value })}
                    placeholder="Alias"
                  />

                  <Input
                    value={editingSif.version}
                    onChange={e => setEditingSif({ ...editingSif, version: e.target.value })}
                    placeholder="Versión"
                  />

                  <Input
                    value={editingSif.nif || ""}
                    onChange={e => setEditingSif({ ...editingSif, nif: e.target.value })}
                    placeholder="NIF"
                  />

                  <Button
                    onClick={async () => {
                      await updateSif(s.id, editingSif)
                      setEditingSif(null)
                      fetchSifs()
                    }}
                  >
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ➕ NUEVO SIF */}
      <Card>
        <h3 className="font-semibold mb-4">Nuevo SIF</h3>

        <div className="grid grid-cols-4 gap-3">

          <Input
            placeholder="Alias"
            value={nuevoSif.alias}
            onChange={e => setNuevoSif({ ...nuevoSif, alias: e.target.value })}
          />

          <Input
            placeholder="Software"
            value={nuevoSif.software_nombre}
            onChange={e => setNuevoSif({ ...nuevoSif, software_nombre: e.target.value })}
          />

          <Input
            placeholder="Versión"
            value={nuevoSif.version}
            onChange={e => setNuevoSif({ ...nuevoSif, version: e.target.value })}
          />

          <Input
            placeholder="NIF"
            value={nuevoSif.nif}
            onChange={e => setNuevoSif({ ...nuevoSif, nif: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <Button
            onClick={async () => {
              await createSif(nuevoSif)
              setNuevoSif({ alias: "", software_nombre: "", version: "", nif: "" })
              fetchSifs()
            }}
          >
            Crear SIF
          </Button>
        </div>
      </Card>

    </div>
  )
}