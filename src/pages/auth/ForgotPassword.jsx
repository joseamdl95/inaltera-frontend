import { useState } from "react"
import { forgotPassword } from "../../api/user"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await forgotPassword(email)
      alert("Revisa tu email (mock): " + res.reset_link)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <h1>Recuperar contraseña</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}