import { useEffect, useState } from "react"
import { getClients, createClient, updateClient } from "../../api/clients"

export default function Clientes() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    nombre: "",
    nif: "",
    direccion: ""
  })

  const [form, setForm] = useState({
    nombre: "",
    nif: "",
    direccion: ""
  })

  const [calle, setCalle] = useState("")
  const [cp, setCp] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [provincia, setProvincia] = useState("")

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 CREAR
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const direccion = [
        calle,
        `${cp} ${ciudad}`.trim(),
        provincia ? `(${provincia})` : null
      ]
        .filter(Boolean)
        .join(", ")

      await createClient({
        nombre: form.nombre,
        nif: form.nif,
        direccion
      })

      setForm({ nombre: "", nif: "" })
      setCalle("")
      setCp("")
      setCiudad("")
      setProvincia("")

      fetchClients()
    } catch (error) {
      console.error(error)
    }
  }

  // 🔹 ACTIVAR EDICIÓN
  const handleEdit = (client) => {
    setEditingId(client.id)

    setEditForm({
      nombre: client.nombre,
      nif: client.nif
    })

    if (client.direccion) {
      const partes = client.direccion.split(",").map(p => p.trim())

      // 🏠 Calle
      setCalle(partes[0] || "")

      // 📍 CP + Ciudad (+ posible provincia)
      if (partes[1]) {
        const match = partes[1].match(/^(\d{5})\s+(.*)$/)

        if (match) {
          setCp(match[1])

          let ciudadTexto = match[2]

          // quitar (Provincia) si viene pegada
          ciudadTexto = ciudadTexto.replace(/\(.*?\)/, "").trim()

          setCiudad(ciudadTexto)
        } else {
          setCiudad(partes[1])
        }
      }

      // 🗺️ Provincia (buscar en TODO el string)
      const matchProvincia = client.direccion.match(/\((.*?)\)/)
      if (matchProvincia) {
        setProvincia(matchProvincia[1])
      } else {
        setProvincia("")
      }
    }
  }

  // 🔹 GUARDAR EDICIÓN
  const handleUpdate = async () => {
    try {
      const direccion = [
        calle,
        `${cp} ${ciudad}`.trim(),
        provincia ? `(${provincia})` : null
      ]
        .filter(Boolean)
        .join(", ")

      await updateClient(editingId, {
        nombre: editForm.nombre,
        nif: editForm.nif,
        direccion
      })

      setEditingId(null)
      fetchClients()
    } catch (error) {
      console.error(error)
    }
  }

  // 🔹 CANCELAR
  const handleCancel = () => {
    setEditingId(null)
    setEditForm({
      nombre: "",
      nif: "",
      direccion: ""
    })
  }

  if (loading) return <p>Cargando clientes...</p>

  return (
    <div>
      <h2>Clientes</h2>

      {/* 🔹 FORMULARIO CREAR */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          placeholder="NIF"
          value={form.nif}
          onChange={(e) => setForm({ ...form, nif: e.target.value })}
        />

        <input
          placeholder="Calle"
          value={calle}
          onChange={(e) => setCalle(e.target.value)}
        />

        <input
          placeholder="CP"
          value={cp}
          onChange={(e) => setCp(e.target.value)}
        />

        <input
          placeholder="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        />

        <input
          placeholder="Provincia"
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
        />

        <button type="submit">Crear</button>
      </form>

      {/* 🔹 TABLA */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>NIF</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              {editingId === c.id ? (
                <>
                  <td>
                    <input
                      value={editForm.nombre}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nombre: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editForm.nif}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nif: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Calle"
                      value={calle}
                      onChange={(e) => setCalle(e.target.value)}
                    />

                    <input
                      placeholder="CP"
                      value={cp}
                      onChange={(e) => setCp(e.target.value)}
                    />

                    <input
                      placeholder="Ciudad"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                    />

                    <input
                      placeholder="Provincia"
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={handleUpdate}>Guardar</button>
                    <button onClick={handleCancel}>Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{c.nombre}</td>
                  <td>{c.nif}</td>
                  <td>{c.direccion}</td>
                  <td>
                    <button onClick={() => handleEdit(c)}>
                      Editar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}