import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError, apiFetch } from '../api/client'

interface Student {
  id: string
  name: string
}

export default function GroupStudentsPage() {
  const { groupId } = useParams()
  const auth = useAuth()
  const token = auth.user?.access_token

  const { data, error, isLoading } = useQuery({
    queryKey: ['group-students', groupId],
    queryFn: () => apiFetch<Student[]>(`/api/v1/groups/${groupId}/students`, token),
    enabled: !!token && !!groupId,
  })

  return (
    <main>
      <h1>Estudiantes matriculados</h1>
      <p>
        <Link to="/groups">← Volver a grupos</Link>
      </p>
      <p className="subtitle">Seleccione un estudiante para consultar o registrar sus calificaciones.</p>
      {isLoading && <p>Cargando información…</p>}
      {error && (
        <p className="error">
          {error instanceof ApiError ? error.message : 'Error inesperado.'}
        </p>
      )}
      {data && data.length === 0 && <p>El grupo no tiene estudiantes activos.</p>}
      {data && data.length > 0 && (
        <ul>
          {data.map((student) => (
            <li key={student.id}>
              <Link to={`/groups/${groupId}/students/${student.id}`}>{student.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
