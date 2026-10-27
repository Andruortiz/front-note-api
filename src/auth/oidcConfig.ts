import type { AuthProviderProps } from 'react-oidc-context'

export const oidcConfig: AuthProviderProps = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: 'notes-frontend',
    redirect_uri: window.location.origin,
    onSigninCallback: () =>
        window.history.replaceState({}, document.title, window.location.pathname),
}