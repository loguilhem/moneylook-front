import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CrudPage from '../pages/CrudPage'
import { getTranslatedResourceByKey, resourceByKey } from '../resources'
import { useAppContext } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

function normalizeResourceKey(routeKey) {
  const mapping = {
    'account-types': 'accountTypes',
    'bank-accounts': 'bankAccounts',
    'categories': 'categories',
    'expenses': 'expenses',
    'incomes': 'incomes',
    'recurring-expenses': 'recurringExpenses',
    'recurring-incomes': 'recurringIncomes',
  }

  return mapping[routeKey] ?? routeKey
}

function ResourcePage() {
  const { resourceKey } = useParams()
  const { store, loading, error, loadAll, saveResource, deleteResource } = useAppContext()
  const { t } = useTranslation()

  const normalizedKey = useMemo(() => normalizeResourceKey(resourceKey), [resourceKey])
  const translatedResourceByKey = useMemo(() => getTranslatedResourceByKey(t), [t])
  const resource = translatedResourceByKey[normalizedKey]

  if (!resourceByKey[normalizedKey]) {
    return (
      <main className="page-shell">
        <p className="alert">{t('resources.notFound')}</p>
      </main>
    )
  }

  return (
    <CrudPage
      data={store[resource.key] ?? []}
      error={error}
      loading={loading}
      lookups={store}
      resource={resource}
      onDelete={deleteResource}
      onReload={loadAll}
      onSave={saveResource}
    />
  )
}

export default ResourcePage
