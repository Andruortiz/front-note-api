import { useAuth } from 'react-oidc-context'

export default function App() {
  const auth = useAuth()

  if (auth.isLoading) return <p>Cargando...</p>
  if (auth.error) return <p>Error: {auth.error.message}</p>
  if (!auth.isAuthenticated) {
    return <button onClick={() => auth.signinRedirect()}>Iniciar sesión</button>
  }

  return (
      <div>
        <p>Hola, {auth.user?.profile.preferred_username}</p>
        <button onClick={() => auth.signoutRedirect()}>Salir</button>
      </div>
  )
} 