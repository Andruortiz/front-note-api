import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

export default function AppLayout() {
  const auth = useAuth()

  if (auth.isLoading) return <p>Cargando información…</p>
  if (!auth.isAuthenticated) return <Navigate to="/" replace />

  return (
    <div>
      <div className="topline" />
      <header>
        <span className="brand">
          <span className="monogram">SR</span>
          Sistema de Registro de Notas
        </span>
        <nav>
          <Link to="/groups">Grupos</Link>
        </nav>
        <span>Docente: {auth.user?.profile.preferred_username}</span>
        <button className="outline" onClick={() => auth.signoutRedirect()}>
          Cerrar sesión
        </button>
      </header>
      <Outlet />
    </div>
  )
}
