import { Navigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

export default function HomePage() {
  const auth = useAuth()

  if (auth.isLoading) return <p>Cargando...</p>
  if (auth.isAuthenticated) return <Navigate to="/notas" replace />

  return (
    <main>
      <h1>Registro de notas</h1>
      <p>Sistema para registrar las notas de los estudiantes.</p>
      {auth.error && <p className="error">Error: {auth.error.message}</p>}
      <button onClick={() => auth.signinRedirect()}>Iniciar sesión</button>
    </main>
  )
}
