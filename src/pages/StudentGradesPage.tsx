import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError, apiFetch } from '../api/client'

const GRADE_TYPES = [
  { type: 'FOLLOW_UP', label: 'Seguimiento', className: 'panel-follow-up' },
  { type: 'MIDTERM', label: 'Parcial', className: 'panel-midterm' },
] as const

type GradeType = (typeof GRADE_TYPES)[number]['type']

interface StudentGrade {
  id: string
  type: GradeType
  value: number
}

interface RegistrationPeriod {
  type: GradeType
  registrationDateFrom: string
  registrationDateTo: string
  open: boolean
}

interface RegisterGradeForm {
  score: string
}

const dateFormat = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
})

interface SectionProps {
  type: GradeType
  label: string
  className: string
  period?: RegistrationPeriod
  grade?: StudentGrade
  groupId?: string
  studentId?: string
  token?: string
  onRegistered: () => Promise<unknown>
}

function GradeTypeSection({
  type,
  label,
  className,
  period,
  grade,
  groupId,
  studentId,
  token,
  onRegistered,
}: SectionProps) {
  const { register, handleSubmit, reset } = useForm<RegisterGradeForm>()

  const mutation = useMutation({
    mutationFn: (form: RegisterGradeForm) =>
      apiFetch<{ id: string }>('/api/v1/notas-estudiante', token, {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          studentId,
          type,
          score: form.score === '' ? null : Number(form.score),
        }),
      }),
    onSuccess: () => {
      reset({ score: '' })
      return onRegistered()
    },
  })

  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <h2>{label}</h2>
        {period && <span className={`tag ${period.open ? 'open' : 'closed'}`}>{period.open ? 'Abierto' : 'Cerrado'}</span>}
      </div>

      <p className="period">
        {period
          ? `Plazo de registro: del ${dateFormat.format(new Date(period.registrationDateFrom))} al ${dateFormat.format(new Date(period.registrationDateTo))}`
          : 'No se ha definido un plazo de registro.'}
      </p>

      <p className="caption">Calificación registrada</p>
      {grade ? (
        <p className="grade">
          {grade.value.toFixed(1)} <small>/ 5.0</small>
        </p>
      ) : (
        <p className="pending">Aún sin registrar</p>
      )}

      <form onSubmit={handleSubmit((form) => mutation.mutate(form))}>
        <fieldset className="entry">
          <legend>Ingresar nota</legend>
          <label>
            Calificación (0.0 a 5.0)
            <input {...register('score', { required: true })} inputMode="decimal" />
          </label>
          <p>
            <button type="submit" disabled={mutation.isPending}>
              Registrar calificación
            </button>
          </p>
        </fieldset>
      </form>

      {mutation.isError && (
        <p className="error">
          {mutation.error instanceof ApiError ? mutation.error.message : 'Error inesperado.'}
        </p>
      )}
    </section>
  )
}

export default function StudentGradesPage() {
  const { groupId, studentId } = useParams()
  const auth = useAuth()
  const token = auth.user?.access_token
  const queryClient = useQueryClient()
  const gradesKey = ['student-grades', groupId, studentId]

  const grades = useQuery({
    queryKey: gradesKey,
    queryFn: () =>
      apiFetch<StudentGrade[]>(`/api/v1/grupos/${groupId}/estudiantes/${studentId}/notas`, token),
    enabled: !!token && !!groupId && !!studentId,
  })

  const periods = useQuery({
    queryKey: ['registration-periods'],
    queryFn: () => apiFetch<RegistrationPeriod[]>('/api/v1/periodos-registro', token),
    enabled: !!token,
  })

  const error = grades.error ?? periods.error

  return (
    <main>
      <h1>Calificaciones del estudiante</h1>
      <p>
        <Link to={`/grupos/${groupId}`}>← Volver a estudiantes</Link>
      </p>

      {(grades.isLoading || periods.isLoading) && <p>Cargando información…</p>}
      {error && (
        <p className="error">
          {error instanceof ApiError ? error.message : 'Error inesperado.'}
        </p>
      )}

      {grades.data && periods.data && (
        <div className="panels">
          {GRADE_TYPES.map(({ type, label, className }) => (
            <GradeTypeSection
              key={type}
              type={type}
              label={label}
              className={className}
              period={periods.data.find((period) => period.type === type)}
              grade={grades.data.find((grade) => grade.type === type)}
              groupId={groupId}
              studentId={studentId}
              token={token}
              onRegistered={() => queryClient.invalidateQueries({ queryKey: gradesKey })}
            />
          ))}
        </div>
      )}
    </main>
  )
}
