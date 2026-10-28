export class ApiError extends Error {
    status: number
    code: string

    constructor(status: number, code: string, message: string) {
        super(message)
        this.status = status
        this.code = code
    }
}

export async function apiFetch<T>(
    path: string,
    token: string | undefined,
    init: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init.headers,
        },
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(response.status, body?.code ?? 'UNKNOWN', body?.message ?? response.statusText)
    }
    if (response.status === 204) {
        return undefined as T
    }
    return response.json()
}