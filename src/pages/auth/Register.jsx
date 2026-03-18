import { useState, useEffect  } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../../api/auth"
import { useAuth } from "../../context/AuthContext"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

export default function Register() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [telefono, setTelefono] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate("/crear-factura", { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (password !== password2) {
      alert("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      await registerUser({ email, nombre, apellidos, telefono, password })
      alert("Cuenta creada correctamente. Ahora puedes iniciar sesión.")
      navigate("/login")
    } catch (e) {
      alert("Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <Card className="w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-2">
          Crear cuenta
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Empieza a usar Inaltera
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            <Input
              type="text"
              placeholder="Apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
          </div>

          <Input
            type="text"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Repetir contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>

        </form>

        <div className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </div>

      </Card>

    </div>
  )
}
