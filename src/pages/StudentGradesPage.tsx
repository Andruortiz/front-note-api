import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError, apiFetch } from '../api/client'

interface StudentGrade {
  id: string
  gradeId: string
  value: number
}

interface RegisterGradeForm {
  score: string
}

export default function StudentGradesPage() {
  const { groupId, studentId } = useParams()
  const auth = useAuth()
  const token = auth.user?.access_token
  const queryClient = useQueryClient()
  const queryKey = ['student-grades', groupId, studentId]

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      apiFetch<StudentGrade[]>(`/api/v1/grupos/${groupId}/estudiantes/${studentId}/notas`, token),
    enabled: !!token && !!groupId && !!studentId,
  })

  const { register, handleSubmit, reset } = useForm<RegisterGradeForm>()

  const mutation = useMutation({
    mutationFn: (form: RegisterGradeForm) =>
      apiFetch<{ id: string }>('/api/v1/notas-estudiante', token, {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          studentId,
          score: form.score === '' ? null : Number(form.score),
        }),
      }),
    onSuccess: () => {
      reset({ score: '' })
      return queryClient.invalidateQueries({ queryKey })
    },
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

      <h2>Agregar nota</h2>
      <form onSubmit={handleSubmit((form) => mutation.mutate(form))}>
        <label>
          Nota (0.00 a 5.00):
          <input {...register('score', { required: true })} inputMode="decimal" />
        </label>
        <p>
          <button type="submit" disabled={mutation.isPending}>
            Registrar
          </button>
        </p>
      </form>
      {mutation.isError && (
        <p className="error">
          {mutation.error instanceof ApiError ? mutation.error.message : 'Error inesperado.'}
        </p>
      )}
    </main>
  )
}
