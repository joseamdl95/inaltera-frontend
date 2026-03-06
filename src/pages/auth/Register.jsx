import { useState, useEffect  } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../../api/auth"
import { useAuth } from "../../context/AuthContext"

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
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Crear cuenta</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>   

        <div>
          <label>Nombre</label><br />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Apellidos</label><br />
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Teléfono (opcional)</label><br />
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div> 

        <div>
          <label>Contraseña</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Repetir contraseña</label><br />
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        <br />
        <button disabled={loading}>
          Crear cuenta
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}
