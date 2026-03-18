import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { resetPassword } from "../../api/user"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <Card className="w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-2">
          Recuperar contraseña
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Te enviaremos un enlace para restablecerla
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" className="w-full">
            Enviar
          </Button>

        </form>

      </Card>

    </div>
  )
}