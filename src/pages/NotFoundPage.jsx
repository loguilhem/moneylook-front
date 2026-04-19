import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="page-shell">
      <h1>Page introuvable</h1>
      <p>L’URL demandée ne correspond à aucune page de l’application.</p>
      <Link to="/">Retour à l’accueil</Link>
    </main>
  )
}

export default NotFoundPage