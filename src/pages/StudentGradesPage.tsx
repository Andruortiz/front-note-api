import { useState } from 'react'
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

interface GradeForm {
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
  onChanged: () => Promise<unknown>
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
  onChanged,
}: SectionProps) {
  const { register, handleSubmit, reset } = useForm<GradeForm>()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const gradePath = `/api/v1/groups/${groupId}/students/${studentId}/grades/${type}`

  const saveMutation = useMutation({
    mutationFn: (form: GradeForm) => {
      const score = form.score === '' ? null : Number(form.score)
      if (grade) {
        return apiFetch<unknown>(gradePath, token, { method: 'PUT', body: JSON.stringify({ score }) })
      }
      return apiFetch<unknown>('/api/v1/student-grades', token, {
        method: 'POST',
        body: JSON.stringify({ groupId, studentId, type, score }),
      })
    },
    onSuccess: () => {
      reset({ score: '' })
      return onChanged()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch<void>(gradePath, token, { method: 'DELETE' }),
    onSuccess: () => {
      setConfirmingDelete(false)
      return onChanged()
    },
  })

  const error = saveMutation.error ?? deleteMutation.error

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

      <form onSubmit={handleSubmit((form) => saveMutation.mutate(form))}>
        <fieldset className="entry">
          <legend>Ingresar nota</legend>
          <label>
            Calificación (0.0 a 5.0)
            <input {...register('score', { required: true })} inputMode="decimal" />
          </label>
          <p>
            <button type="submit" disabled={saveMutation.isPending}>
              {grade ? 'Modificar calificación' : 'Registrar calificación'}
            </button>
          </p>
        </fieldset>
      </form>

      {grade && (
        <div className="removal">
          {confirmingDelete ? (
            <p>
              ¿Eliminar la calificación registrada?{' '}
              <button className="danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
                Confirmar
              </button>{' '}
              <button className="secondary" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </button>
            </p>
          ) : (
            <p>
              <button className="danger" onClick={() => setConfirmingDelete(true)}>
                Eliminar calificación
              </button>
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="error">
          {error instanceof ApiError ? error.message : 'Error inesperado.'}
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
      apiFetch<StudentGrade[]>(`/api/v1/groups/${groupId}/students/${studentId}/grades`, token),
    enabled: !!token && !!groupId && !!studentId,
  })

  const periods = useQuery({
    queryKey: ['registration-periods'],
    queryFn: () => apiFetch<RegistrationPeriod[]>('/api/v1/registration-periods', token),
    enabled: !!token,
  })

  const error = grades.error ?? periods.error

  return (
    <main>
      <h1>Calificaciones del estudiante</h1>
      <p>
        <Link to={`/groups/${groupId}`}>← Volver a estudiantes</Link>
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
              onChanged={() => queryClient.invalidateQueries({ queryKey: gradesKey })}
            />
          ))}
        </div>
      )}
    </main>
  )
}
