import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Verificador from "../facturacion/Verificador"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code2fa, setCode2fa] = useState("")
  const [show2FA, setShow2FA] = useState(false)
  const [error, setError] = useState(null)
  
  const { user, login, verify2FALogin, loading } = useAuth()
  const navigate = useNavigate()

  // Protección manual: si ya estás logueado (con token), vete a la raíz
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (user && token) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (!show2FA) {
        // PASO 1: Login inicial
        const res = await login(email, password);
        const data = res?.data ? res.data : res;

        if (data?.requires_2fa) {
          setShow2FA(true); // Cambia la vista al input de 6 dígitos
        } else if (res?.success || data?.token) {
          navigate("/facturacion", { replace: true });
        }
      } else {
        // PASO 2: Verificación de código
        await verify2FALogin(email, code2fa);
        navigate("/facturacion", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* IZQUIERDA - LOGIN */}
      <div className="w-1/2 flex items-center justify-center bg-white">

        <Card className="w-full max-w-md">

          <h1 className="text-2xl font-bold text-center mb-2">
            INALTERA
          </h1>

          <h2 className="text-center text-gray-600 mb-6">
            {show2FA ? "Verificación 2FA" : "Iniciar sesión"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {!show2FA ? (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            ) : (
              <>
                <p className="text-center text-sm text-gray-500">
                  Introduce el código 2FA
                </p>

                <Input
                  type="text"
                  placeholder="000000"
                  value={code2fa}
                  onChange={(e) => setCode2fa(e.target.value)}
                  maxLength="6"
                  className="text-center text-lg tracking-widest"
                />
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Cargando..."
                : show2FA
                ? "Verificar"
                : "Entrar"}
            </Button>

            {error && (
              <p className="text-red-500 text-sm text-center">
                {error}
              </p>
            )}

            {!show2FA && (
              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>
                  <Link to="/forgot-password" className="text-blue-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </p>
                <p>
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="text-blue-600 hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            )}

            {show2FA && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShow2FA(false)}
                className="w-full"
              >
                Volver
              </Button>
            )}

          </form>
        </Card>
      </div>

      {/* DERECHA - VERIFICADOR */}
      <div className="w-1/2 bg-gray-50 p-6 overflow-auto">

        <h2 className="text-lg font-semibold mb-4">
          Verificar factura XML
        </h2>

        <Verificador />

      </div>

    </div>
  )
}
