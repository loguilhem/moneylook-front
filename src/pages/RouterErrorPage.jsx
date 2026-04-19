import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

function RouterErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <main className="page-shell">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>
          {typeof error.data === 'string'
            ? error.data
            : 'Une erreur de navigation est survenue.'}
        </p>
        <Link to="/">Retour à l’accueil</Link>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <h1>Erreur inattendue</h1>
      <p>Une erreur est survenue dans l’application.</p>
      <Link to="/">Retour à l’accueil</Link>
    </main>
  )
}

export default RouterErrorPage