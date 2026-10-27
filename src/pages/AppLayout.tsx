import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

export default function AppLayout() {
  const auth = useAuth()

  if (auth.isLoading) return <p>Cargando...</p>
  if (!auth.isAuthenticated) return <Navigate to="/" replace />

  return (
    <div>
      <header>
        <span>Usuario: {auth.user?.profile.preferred_username}</span>
        <nav>
          <Link to="/grupos">Grupos</Link>
        </nav>
        <button onClick={() => auth.signoutRedirect()}>Salir</button>
      </header>
      <hr />
      <Outlet />
    </div>
  )
}
