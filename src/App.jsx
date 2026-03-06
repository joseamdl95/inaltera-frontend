/*import { useAuth } from "./context/AuthContext"
import Login from "./pages/auth/Login"
import AppRouter from "./routes/AppRouter"

export default function App() {
  const { user } = useAuth()

  if (!user) {
    return <Login />
  }

  return <AppRouter />
}*/
import AppRouter from "./routes/AppRouter"

export default function App() {
  return <AppRouter />
}
