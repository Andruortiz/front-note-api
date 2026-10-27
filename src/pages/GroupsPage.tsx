import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError, apiFetch } from '../api/client'

interface Group {
  id: string
  name: string
}

export default function GroupsPage() {
  const auth = useAuth()
  const token = auth.user?.access_token

  const { data, error, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiFetch<Group[]>('/api/v1/grupos', token),
    enabled: !!token,
  })

  return (
    <main>
      <h1>Mis grupos</h1>
      {isLoading && <p>Cargando...</p>}
      {error && (
        <p className="error">
          {error instanceof ApiError ? error.message : 'Error inesperado.'}
        </p>
      )}
      {data && data.length === 0 && <p>No tienes grupos asignados.</p>}
      {data && data.length > 0 && (
        <ul>
          {data.map((group) => (
            <li key={group.id}>
              <Link to={`/grupos/${group.id}`}>{group.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
