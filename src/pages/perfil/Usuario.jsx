import { useEffect, useState } from "react"
import { getMe, updateDatos, updateEmail, updatePassword, enable2FA, verify2FA, disable2FA } from "../../api/user"
import { getBillingStatus, changePlan } from "../../api/billing"

import Card from "../../components/common/Card"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"

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
    <div className="max-w-5xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Mi perfil</h1>

      {/* 👤 DATOS PERSONALES */}
      <Card>
        <h3 className="font-semibold mb-4">Datos Personales</h3>
      
        <form onSubmit={handleUpdateDatos} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Nombre</label><br />
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Apellidos</label><br />
              <Input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Teléfono (opcional)</label><br />
              <Input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div> 
          </div>
          
          <Button type="submit">Guardar datos</Button>
        </form>
      </Card>

      <h2>Datos de acceso</h2>

      {/* 🔐 EMAIL */}
      <Card>
        <h3 className="font-semibold mb-4">Email</h3>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit">
            Guardar email
          </Button>
        </form>
      </Card>

      {/* 🔑 PASSWORD */}
      <Card>
        <h3 className="font-semibold mb-4">Cambiar contraseña</h3>

        <form onSubmit={handleChangePassword} className="space-y-4">

          <Input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Repetir contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />

          <Button type="submit">
            Cambiar contraseña
          </Button>

        </form>
      </Card>

      {/* 🛡️ 2FA */}
      <Card>
        <h3 className="font-semibold mb-4">
          Seguridad (2FA)
        </h3>
        
        {!twoFA && !twoFAPending && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Protege tu cuenta con una aplicación de autenticación (Google Authenticator, Authy, etc).
            </p>

            <Button onClick={handleEnable2FA}>
              Configurar Authenticator
            </Button>
          </div>
        )}

        {twoFAPending && (
          <div className="text-center space-y-4">
            <h4 className="font-medium">
              Escanea el código QR
            </h4>
            {qrCode && (
              <img
                src={qrCode}
                className="mx-auto"
              />
            )}
            <p>Luego, introduce el código de 6 dígitos:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleVerify2FA()
              }}
              className="space-y-3"
            >
              <Input
                value={twoFACode}
                placeholder="000000"
                onChange={(e) => setTwoFACode(e.target.value)}
                className="text-center tracking-widest text-lg"
              />
              
              <div className="flex gap-2 justify-center">
                <Button type="submit">
                  Verificar
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTwoFAPending(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {twoFA && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center">
            <span className="text-sm">
              ✅ 2FA activo
            </span>

            <Button
              variant="danger"
              onClick={handleDisable2FA}
            >
              Desactivar
            </Button>
          </div>
        )}
      </Card>
      
      {/* 💳 PLAN */}
      <Card>
        <h3 className="font-semibold mb-4">Plan y tarifas</h3>

        {billing && (
          <div className="text-sm space-y-1 mb-4">
            <p><strong>Plan actual:</strong> {billing.plan}</p>
            <p><strong>Uso:</strong> {billing.usadas} / {billing.limite}</p>
            <p><strong>Estado:</strong> {billing.estado}</p>
          </div>
        )}

        <h4 className="font-medium">Cambiar plan</h4>

        <select
          className="border rounded-lg px-3 py-2 w-full"
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
      </Card>

    </div>
  )
}