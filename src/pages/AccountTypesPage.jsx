import ResourceFormModal from '../components/resource/ResourceFormModal'
import ResourceImportModal from '../components/resource/ResourceImportModal'
import ResourceList from '../components/resource/ResourceList'
import ResourcePageHeader from '../components/resource/ResourcePageHeader'
import { useResourceCrud } from '../hooks/useResourceCrud'

function AccountTypesPage() {
  const crud = useResourceCrud('accountTypes')

  return (
    <main className="page-shell">
      <ResourcePageHeader
        canImport={crud.canImport}
        loading={crud.loading}
        resource={crud.resource}
        onCreate={crud.openCreateForm}
        onImport={crud.openImport}
        onReload={crud.onReload}
      />

      {crud.error ? <p className="alert">{crud.error}</p> : null}

      <ResourceList
        columns={crud.columns}
        data={crud.data}
        deletingId={crud.deletingId}
        formId={crud.quickCreateFormId}
        loading={crud.loading}
        lookups={crud.lookups}
        quickForm={crud.quickForm}
        quickSaving={crud.quickSaving}
        resource={crud.resource}
        onDelete={crud.deleteItem}
        onEdit={crud.openEditForm}
        onQuickChange={crud.updateQuickField}
        onQuickSubmit={crud.submitQuickCreate}
      />

      {crud.isFormOpen ? (
        <ResourceFormModal
          editingId={crud.editingId}
          form={crud.form}
          lookups={crud.lookups}
          resource={crud.resource}
          saving={crud.saving}
          onChange={crud.updateField}
          onClose={crud.closeForm}
          onSubmit={crud.submitForm}
        />
      ) : null}

      {crud.isImportOpen ? (
        <ResourceImportModal
          importing={crud.importing}
          resource={crud.resource}
          summary={crud.importSummary}
          onClose={crud.closeImport}
          onImport={crud.importFile}
        />
      ) : null}
    </main>
  )
}

export default AccountTypesPage
