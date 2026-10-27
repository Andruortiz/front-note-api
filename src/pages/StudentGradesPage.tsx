import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError, apiFetch } from '../api/client'

interface StudentGrade {
  id: string
  gradeId: string
  value: number
}

export default function StudentGradesPage() {
  const { groupId, studentId } = useParams()
  const auth = useAuth()
  const token = auth.user?.access_token

  const { data, error, isLoading } = useQuery({
    queryKey: ['student-grades', groupId, studentId],
    queryFn: () =>
      apiFetch<StudentGrade[]>(`/api/v1/grupos/${groupId}/estudiantes/${studentId}/notas`, token),
    enabled: !!token && !!groupId && !!studentId,
  })

  return (
    <main>
      <h1>Notas del estudiante</h1>
      <p>
        <Link to={`/grupos/${groupId}`}>Volver a estudiantes</Link>
      </p>
      {isLoading && <p>Cargando...</p>}
      {error && (
        <p className="error">
          {error instanceof ApiError ? error.message : 'Error inesperado.'}
        </p>
      )}
      {data && data.length === 0 && <p>El estudiante no tiene notas registradas.</p>}
      {data && data.length > 0 && (
        <ul>
          {data.map((grade) => (
            <li key={grade.id}>{grade.value.toFixed(2)}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
