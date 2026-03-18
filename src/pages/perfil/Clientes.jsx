import { useEffect, useState } from "react"
import { getClients, createClient, updateClient } from "../../api/clients"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import Table from "../../components/common/Table"

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

  const columns = [
    {
      header: "Nombre",
      render: (c) =>
        editingId === c.id ? (
          <Input
            value={editForm.nombre}
            onChange={(e) =>
              setEditForm({ ...editForm, nombre: e.target.value })
            }
          />
        ) : (
          <span className="font-medium">{c.nombre}</span>
        )
    },
    {
      header: "NIF",
      render: (c) =>
        editingId === c.id ? (
          <Input
            value={editForm.nif}
            onChange={(e) =>
              setEditForm({ ...editForm, nif: e.target.value })
            }
          />
        ) : (
          c.nif
        )
    },
    {
      header: "Dirección",
      render: (c) =>
        editingId === c.id ? (
          <div className="space-y-2">
            <Input placeholder="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} />
            <Input placeholder="CP" value={cp} onChange={(e) => setCp(e.target.value)} />
            <Input placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            <Input placeholder="Provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
          </div>
        ) : (
          c.direccion
        )
    },
    {
      header: "Acciones",
      render: (c) =>
        editingId === c.id ? (
          <div className="flex gap-2">
            <Button onClick={handleUpdate}>
              Guardar
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => handleEdit(c)}
          >
            Editar
          </Button>
        )
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Clientes</h1>

      {/* 🔹 FORMULARIO */}
      <Card>
        <h3 className="font-semibold mb-4">Nuevo cliente</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">

          <Input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <Input
            placeholder="NIF"
            value={form.nif}
            onChange={(e) => setForm({ ...form, nif: e.target.value })}
          />

          <Input
            placeholder="Calle"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
          />

          <Input
            placeholder="Código postal"
            value={cp}
            onChange={(e) => setCp(e.target.value)}
          />

          <Input
            placeholder="Ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
          />

          <Input
            placeholder="Provincia"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          />

          <div className="col-span-2">
            <Button type="submit">
              Crear cliente
            </Button>
          </div>

        </form>
      </Card>

      {/* 🔹 TABLA */}
      <Card>
        <Table columns={columns} data={clients} />
      </Card>

    </div>
  )
}