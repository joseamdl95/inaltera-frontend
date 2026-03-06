import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { resetPassword } from "../../api/user"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get("token")
    
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !password2) {
        alert("Rellena todos los campos")
        return
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres")
        return
    }

    if (password !== password2) {
        alert("Las contraseñas no coinciden")
        return
    }

    try {
        await resetPassword(token, password)
        alert("Contraseña actualizada. Redirigiendo al login...")
        window.location.href = "/login"
    } catch (err) {
        alert(err.message)
    }
    }

  return (
    <div>
      <h1>Nueva contraseña</h1>

      <form onSubmit={handleSubmit}>
        <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <input
            type="password"
            placeholder="Repetir contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
        />

        <button type="submit">Guardar</button>
      </form>
    </div>
  )
}