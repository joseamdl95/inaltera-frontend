import { useEffect, useState } from "react"
import { getCompany, updateCompany, createCompany } from "../../api/company"
import { validarNif, validarCP } from "../../utils/validator"
import { getSifs, createSif, updateSif, setDefaultSif } from "../../api/sif"

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

  async function handleLogoUpload(file) {
    if (!file) return

    const formData = new FormData()
    formData.append("logo", file)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      })

      if (!res.ok) throw new Error("Error subiendo logo")

      const data = await res.json()

      setLogoUrl(data.logo_url)

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
    <div style={{ maxWidth: 600 }}>
      
      <div>
      <label>Logo empresa</label><br />

      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => handleLogoUpload(e.target.files[0])}
      />

      {/* PREVIEW */}
      {logoUrl && (
        <div style={{ marginTop: 10 }}>
          <img 
            src={logoUrl} 
            style={{ height: 80, objectFit: "contain" }}
          />
        </div>
      )}
    </div>

      <h1>
        {hasCompany ? "Datos fiscales (empresa)" : "Crear empresa"}
      </h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Razón social</label><br />
          <input 
            name="razon_social" 
            value={empresa.razon_social} 
            onChange={handleEmpresaChange} 
            required  
          />
        </div>

        <div>
          <label>NIF</label><br />
          <input 
            name="nif" 
            value={empresa.nif} 
            onChange={handleEmpresaChange}
            required 
          />
        </div>

        <div>
          <label>Calle</label><br />
          <input 
            value={calle} 
            onChange={e => setCalle(e.target.value)} 
            placeholder="Calle Mayor 12, 3ºA"
            required
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div>
            <label>C.P.</label><br />
            <input 
              style={{ width: "80px" }}
              value={codigoPostal} 
              onChange={(e) => setCodigoPostal(e.target.value)} 
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Ciudad</label><br />
            <input 
              style={{ width: "100%" }}
              value={ciudad} 
              onChange={(e) => setCiudad(e.target.value)} 
              required
            />
          </div>
        </div>

        <div>
          <label>Provincia</label><br />
          <input 
            value={provincia} 
            onChange={(e) => setProvincia(e.target.value)} 
            required
          />
        </div>

        <br />
        <button type="submit">
          {hasCompany ? "Guardar cambios" : "Crear empresa"}
        </button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h2>Sistemas de facturación (SIF)</h2>

      {/* LISTADO */}
      {sifs.map(s => (
        <div key={s.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          
          <strong>{s.alias}</strong>  
          <div>{s.software_nombre} v{s.version}</div>

          {s.es_default && (
            <div style={{ color: "green" }}>✔ Predeterminado</div>
          )}

          {/* BOTONES */}
          <div style={{ marginTop: 5 }}>
            
            {!s.es_default && (
              <button onClick={() => setDefaultSif(s.id).then(fetchSifs)}>
                Hacer Predeterminado
              </button>
            )}

            {/* NO editable si es sistema */}
            {s.software_nombre !== "InAltera" && (
              <button onClick={() => setEditingSif(s)}>
                Editar
              </button>
            )}
          </div>

          {/* EDITAR */}
          {editingSif?.id === s.id && (
            <div style={{ marginTop: 10 }}>
              <input
                value={editingSif.alias}
                onChange={e => setEditingSif({ ...editingSif, alias: e.target.value })}
                placeholder="Alias"
              />

              <input
                value={editingSif.version}
                onChange={e => setEditingSif({ ...editingSif, version: e.target.value })}
                placeholder="Versión"
              />

              <input
                value={editingSif.nif || ""}
                onChange={e => setEditingSif({ ...editingSif, nif: e.target.value })}
                placeholder="NIF"
              />

              <button
                onClick={async () => {
                  await updateSif(s.id, editingSif)
                  setEditingSif(null)
                  fetchSifs()
                }}
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      ))}

      {/* NUEVO SIF */}
      <h3>Nuevo SIF</h3>

      <input
        placeholder="Alias"
        value={nuevoSif.alias}
        onChange={e => setNuevoSif({ ...nuevoSif, alias: e.target.value })}
      />

      <input
        placeholder="Software"
        value={nuevoSif.software_nombre}
        onChange={e => setNuevoSif({ ...nuevoSif, software_nombre: e.target.value })}
      />

      <input
        placeholder="Versión"
        value={nuevoSif.version}
        onChange={e => setNuevoSif({ ...nuevoSif, version: e.target.value })}
      />

      <input
        placeholder="NIF"
        value={nuevoSif.nif}
        onChange={e => setNuevoSif({ ...nuevoSif, nif: e.target.value })}
      />

      <button
        onClick={async () => {
          await createSif(nuevoSif)
          setNuevoSif({ alias: "", software_nombre: "", version: "", nif: "" })
          fetchSifs()
        }}
      >
        Crear SIF
      </button>
          </div>
        )
}