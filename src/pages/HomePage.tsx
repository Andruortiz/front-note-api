import { Navigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

export default function HomePage() {
  const auth = useAuth()

  if (auth.isLoading) return <p>Cargando información…</p>
  if (auth.isAuthenticated) return <Navigate to="/groups" replace />

  return (
    <div className="page">
      <div className="topline" />
      <header>
        <span className="brand">
          <span className="monogram">SR</span>
          Sistema de Registro de Notas
        </span>
        <button className="outline" onClick={() => auth.signinRedirect()}>
          Iniciar sesión
        </button>
      </header>

      <main className="hero">
        <p className="kicker">REGISTRO ACADÉMICO INSTITUCIONAL</p>
        <div className="rule" />
        <h1>Registro oficial de calificaciones</h1>
        <p className="lead">
          Sistema destinado al registro de las calificaciones de seguimiento y de parcial de los estudiantes, por
          grupo y período académico, a cargo del personal docente autorizado.
        </p>
        {auth.error && <p className="error">Error de autenticación: {auth.error.message}</p>}
        <button onClick={() => auth.signinRedirect()}>Iniciar sesión</button>
        <ul className="seals">
          <li>Registro oficial</li>
          <li>Acceso restringido</li>
          <li>Información confidencial</li>
        </ul>
      </main>

      <footer>
        <span>Reglamento académico</span>
        <span>Política de tratamiento de datos</span>
        <span>Términos de uso</span>
      </footer>
    </div>
  )
}
