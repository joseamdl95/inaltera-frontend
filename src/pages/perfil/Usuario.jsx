import { useEffect, useState } from "react"
import { getMe, updateDatos, updateEmail, updatePassword, enable2FA, verify2FA, disable2FA } from "../../api/user"
import { getBillingStatus, changePlan } from "../../api/billing"

export default function Usuario() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [telefono, setTelefono] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")

  // 🛡️ Estados para 2FA Real
  const [twoFACode, setTwoFACode] = useState("")
  const [twoFAPending, setTwoFAPending] = useState(false)
  const [twoFA, setTwoFA] = useState(false)
  const [qrCode, setQrCode] = useState("") // 🆕 Para guardar la imagen del QR

  const [billing, setBilling] = useState(null)

  useEffect(() => {
    getMe()
      .then((data) => {
        console.log("Datos recibidos de la API:", data);

        const u = data.user;

        setUser(u);
        setEmail(u.email || "");
        setNombre(u.nombre || "");
        setApellidos(u.apellidos || "");
        setTelefono(u.telefono || "");
        setTwoFA(!!u.two_fa_enabled);
      })
      .catch((err) => {
        console.error("Error cargando perfil:", err);
      })
      .finally(() => setLoading(false));
      
      getBillingStatus()
      .then(setBilling)
      .catch(console.error)
  }, []);

  if (loading) return <p>Cargando perfil...</p>
  if (!user) return <p>No hay datos</p>

  //CAMBIAR DATOS
  const handleUpdateDatos = async (e) =>{
    e.preventDefault()
    try{
      await updateDatos({ nombre, apellidos, telefono })
      alert ("✅ Datos actualizados")
    }catch (err) {
      alert(err.message)
    }
  }

  //CAMBIAR EMAIL
  const handleUpdateEmail = async (e) => {
    e.preventDefault()

    try {
      await updateEmail(email)
      alert("✅ Email actualizado")
    } catch (err) {
      alert(err.message)
    }
  }

  //CAMBIAR CONTRASEÑA
  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (password !== password2) {
      alert("Las contraseñas no coinciden")
      return
    }

    try {
      await updatePassword({
        current_password: currentPassword,
        new_password: password
      })

      setCurrentPassword("")
      setPassword("")
      setPassword2("")

      alert("✅ Contraseña actualizada")
    } catch (err) {
      alert(err.message)
    }
  }

  // 🆕 ACTIVAR 2FA REAL
  const handleEnable2FA = async () => {
    try {
      const res = await enable2FA();
      console.log("Respuesta del servidor:", res); // Mira esto en la consola (F12)

      if (res.qr) {
        setQrCode(res.qr); // Aquí guardamos la URL de Google
        setTwoFAPending(true);
      } else {
        alert("El servidor no envió el código QR");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 🆕 VERIFICAR Y CONFIRMAR
  const handleVerify2FA = async () => {
    try {
      await verify2FA(twoFACode)
      setTwoFA(true)
      setTwoFAPending(false)
      setTwoFACode("")
      setQrCode("")
      alert("✅ 2FA activado correctamente")
    } catch (err) {
      alert("Código incorrecto. Reintenta.")
    }
  }

  const handleDisable2FA = async () => {
    if(!confirm("¿Seguro que quieres quitar la protección 2FA?")) return
    try {
      await disable2FA()
      setTwoFA(false)
      alert("2FA desactivado")
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 500, padding: '20px' }}>
      <h1>Mi perfil</h1>

      <h3>Datos Personales</h3>

      <form onSubmit={handleUpdateDatos}>
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

        <button type="submit">Guardar datos</button>
      </form>

      <h3>Datos de acceso</h3>

      <form onSubmit={handleUpdateEmail}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit">Guardar email</button>
      </form>

      <hr />
      <h3>Cambiar contraseña</h3>

      <form onSubmit={handleChangePassword}>
        <div>
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Repetir contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>

        <button type="submit">Cambiar contraseña</button>
      </form>

      <hr />

      <h3>Seguridad (Autenticación en dos pasos)</h3>

      {!twoFA && !twoFAPending && (
        <div style={{ backgroundColor: '#f0f7ff', padding: '15px', borderRadius: '8px' }}>
          <p>Protege tu cuenta con una aplicación de autenticación (Google Authenticator, Authy, etc).</p>
          <button onClick={handleEnable2FA} style={{ backgroundColor: '#007bff', color: 'white' }}>
            Configurar Authenticator
          </button>
        </div>
      )}

      {twoFAPending && (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd' }}>
          <h4>Escanea este código QR</h4>
          {qrCode && <img src={qrCode} alt="QR Code" style={{ margin: '15px 0' }} />}
          <p>Luego, introduce el código de 6 dígitos:</p>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleVerify2FA()
          }}>
            <input
              value={twoFACode}
              placeholder="000000"
              onChange={(e) => setTwoFACode(e.target.value)}
              style={{ fontSize: '20px', textAlign: 'center', width: '150px' }}
            />
            <br /><br />
            <button type="submit" style={{ marginRight: '10px' }}>Verificar y activar</button>
            <button onClick={() => setTwoFAPending(false)} style={{ backgroundColor: '#ccc' }}>Cancelar</button>
          </form>
        </div>
      )}

      {twoFA && (
        <div style={{ backgroundColor: '#e6fffa', padding: '15px', borderRadius: '8px' }}>
          <p>✅ <strong>2FA está activo.</strong> Tu cuenta está protegida.</p>
          <button onClick={handleDisable2FA} style={{ backgroundColor: '#e53e3e', color: 'white' }}>
            Desactivar protección
          </button>
        </div>
      )}

      <hr />
      <h3>Plan y tarifas</h3>

      {billing && (
        <div style={{ marginBottom: 15 }}>
          <p><strong>Plan actual:</strong> {billing.plan}</p>
          <p><strong>Uso:</strong> {billing.usadas} / {billing.limite}</p>
          <p><strong>Estado:</strong> {billing.estado}</p>
        </div>
      )}
      <h4>Cambiar plan</h4>

      <select
        value={billing?.plan || "FREE"}
        onChange={async (e) => {
          const nuevoPlan = e.target.value

          try {
            await changePlan(nuevoPlan)

            const updated = await getBillingStatus()
            setBilling(updated)

            alert(`Plan cambiado a ${nuevoPlan}`)
          } catch (err) {
            console.error(err)
            alert("Error cambiando plan")
          }
        }}
      >
        <option value="FREE">Free (5 facturas)</option>
        <option value="BASIC">Basic (10 facturas - 9€)</option>
        <option value="PRO">Pro (20 facturas - 15€)</option>
      </select>
    </div>
  )
}