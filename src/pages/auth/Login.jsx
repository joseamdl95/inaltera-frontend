import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

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
    <div style={{ maxWidth: 400, margin: "60px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h1 style={{ textAlign: "center" }}>INALTERA</h1>
      <h2 style={{ textAlign: "center" }}>{show2FA ? "Verificación 2FA" : "Iniciar Sesión"}</h2>

      {/* Cambiado de div a form con preventDefault para evitar recargas */}
      <form 
        onSubmit={handleSubmit} 
        style={{ marginTop: "20px" }}
      >
        {!show2FA ? (
          <>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: "100%", padding: "10px", marginBottom: "10px", display: "block" }}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: "100%", padding: "10px", marginBottom: "10px", display: "block" }}
            />
          </>
        ) : (
          <>
            <p style={{ textAlign: "center" }}>Introduce el código de tu aplicación de autenticación</p>
            <input 
              type="text" 
              placeholder="000000" 
              value={code2fa} 
              onChange={(e) => setCode2fa(e.target.value)} 
              maxLength="6"
              style={{ width: "100%", padding: "10px", marginBottom: "10px", display: "block", textAlign: "center", fontSize: "20px" }}
            />
          </>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Cargando..." : (show2FA ? "Verificar" : "Entrar")}
        </button>

        {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}

        {/* --- ENLACES RECUPERADOS --- */}
        {!show2FA && (
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
            <p>
              <Link to="/forgot-password" style={{ color: "#007bff", textDecoration: "none" }}>¿Olvidaste tu contraseña?</Link>
            </p>
            <p style={{ marginTop: "10px" }}>
              ¿No tienes cuenta? <Link to="/register" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>Regístrate aquí</Link>
            </p>
          </div>
        )}

        {show2FA && (
          <button 
            type="button"
            onClick={() => setShow2FA(false)} 
            style={{ width: "100%", marginTop: "10px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
          >
            Volver al login
          </button>
        )}
      </form>
    </div>
  )
}
