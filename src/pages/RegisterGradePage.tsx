import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from 'react-oidc-context'
import { ApiError, apiFetch } from '../api/client'

interface RegisterGradeForm {
  gradeId: string
  studentId: string
  score: string
}

interface RegisterGradeResponse {
  id: string
}

export default function RegisterGradePage() {
  const auth = useAuth()
  const { register, handleSubmit, reset } = useForm<RegisterGradeForm>()

  const mutation = useMutation({
    mutationFn: (form: RegisterGradeForm) =>
      apiFetch<RegisterGradeResponse>('/api/v1/notas-estudiante', auth.user?.access_token, {
        method: 'POST',
        body: JSON.stringify({
          gradeId: form.gradeId,
          studentId: form.studentId,
          score: form.score === '' ? null : Number(form.score),
        }),
      }),
    onSuccess: () => reset({ score: '' }),
  })

  return (
    <main>
      <h1>Registrar nota</h1>
      <form onSubmit={handleSubmit((form) => mutation.mutate(form))}>
        <p>
          <label>
            Evaluación (id):{' '}
            <input {...register('gradeId', { required: true })} />
          </label>
        </p>
        <p>
          <label>
            Estudiante (id):{' '}
            <input {...register('studentId', { required: true })} />
          </label>
        </p>
        <p>
          <label>
            Nota (0.00 a 5.00):{' '}
            <input {...register('score', { required: true })} inputMode="decimal" />
          </label>
        </p>
        <button type="submit" disabled={mutation.isPending}>
          Registrar
        </button>
      </form>

      {mutation.isSuccess && <p className="success">Nota registrada. Id: {mutation.data.id}</p>}
      {mutation.isError && (
        <p className="error">
          {mutation.error instanceof ApiError ? mutation.error.message : 'Error inesperado.'}
        </p>
      )}
    </main>
  )
}
