import { useState } from "react"
import { forgotPassword } from "../../api/user"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <Card className="w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-2">
          Recuperar contraseña
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Introduce tu email y te enviaremos un enlace
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Enviar enlace
          </Button>

        </form>

      </Card>

    </div>
  )
}