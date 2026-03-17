import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Verificador from "../facturacion/Verificador"

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
    <div style={{ display: "flex", height: "100vh" }}>

      {/* IZQUIERDA - LOGIN */}
      <div style={{
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRight: "1px solid #eee"
      }}>

        <div style={{
          width: 350,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8
        }}>

          <h1 style={{ textAlign: "center" }}>INALTERA</h1>
          <h2 style={{ textAlign: "center" }}>
            {show2FA ? "Verificación 2FA" : "Iniciar Sesión"}
          </h2>

          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>

            {!show2FA ? (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: 10, marginBottom: 10 }}
                />

                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: 10, marginBottom: 10 }}
                />
              </>
            ) : (
              <>
                <p style={{ textAlign: "center" }}>
                  Introduce el código 2FA
                </p>

                <input
                  type="text"
                  placeholder="000000"
                  value={code2fa}
                  onChange={(e) => setCode2fa(e.target.value)}
                  maxLength="6"
                  style={{
                    width: "100%",
                    padding: 10,
                    marginBottom: 10,
                    textAlign: "center",
                    fontSize: 20
                  }}
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4
              }}
            >
              {loading ? "Cargando..." : (show2FA ? "Verificar" : "Entrar")}
            </button>

            {error && (
              <p style={{ color: "red", textAlign: "center", marginTop: 10 }}>
                {error}
              </p>
            )}

            {!show2FA && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <p>
                  <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                </p>
                <p>
                  ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
                </p>
              </div>
            )}

            {show2FA && (
              <button
                type="button"
                onClick={() => setShow2FA(false)}
                style={{ marginTop: 10 }}
              >
                Volver
              </button>
            )}

          </form>
        </div>
      </div>

      {/* DERECHA - VERIFICADOR */}
      <div style={{
        width: "50%",
        padding: 30,
        overflow: "auto",
        background: "#f7f7f7"
      }}>

        <h2 style={{ marginBottom: 20 }}>
          Verificar factura XML
        </h2>

        <Verificador />

      </div>

    </div>
  )
}
