export const frequencyOptions = [
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'annuel', label: 'Annuel' },
]

export const resources = [
  {
    key: 'categories',
    label: 'Catégories',
    singular: 'catégorie',
    endpoint: '/categories',
    idParam: 'category_id',
    description: 'Classer les dépenses avec couleur et icône.',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'icon_html', label: 'Icône HTML', type: 'text', required: true },
      { name: 'color', label: 'Couleur', type: 'color', required: true, defaultValue: '#00aeef' },
    ],
  },
  {
    key: 'expenses',
    label: 'Dépenses',
    singular: 'dépense',
    endpoint: '/expenses',
    idParam: 'expense_id',
    description: 'Suivre les sorties, catégories et comptes concernés.',
    fields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'label', label: 'Libellé', type: 'text', required: true },
      { name: 'amount_cents', label: 'Montant (centimes)', type: 'number', required: true },
      { name: 'category_id', label: 'Catégorie', type: 'select', source: 'categories', required: true },
      { name: 'bank_account_id', label: 'Compte', type: 'select', source: 'bankAccounts', required: true },
      { name: 'recurring_expense_id', label: 'Dépense récurrente', type: 'select', source: 'recurringExpenses', optional: true },
    ],
  },
  {
    key: 'recurringExpenses',
    label: 'Dépenses récurrentes',
    singular: 'dépense récurrente',
    endpoint: '/recurring-expenses',
    idParam: 'recurring_expense_id',
    description: 'Gérer les charges qui reviennent selon une fréquence.',
    fields: [
      { name: 'label', label: 'Libellé', type: 'text', required: true },
      { name: 'amount_cents', label: 'Montant (centimes)', type: 'number', required: true },
      { name: 'start_date', label: 'Début', type: 'date', required: true },
      { name: 'end_date', label: 'Fin', type: 'date', optional: true },
      {
        name: 'frequency',
        label: 'Fréquence',
        type: 'static-select',
        required: true,
        defaultValue: 'mensuel',
        options: frequencyOptions,
      },
      { name: 'category_id', label: 'Catégorie', type: 'select', source: 'categories', required: true },
      { name: 'bank_account_id', label: 'Compte', type: 'select', source: 'bankAccounts', required: true },
    ],
  },
  {
    key: 'incomes',
    label: 'Revenus',
    singular: 'revenu',
    endpoint: '/incomes',
    idParam: 'income_id',
    description: 'Enregistrer les entrées et le compte associé.',
    fields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'label', label: 'Libellé', type: 'text', required: true },
      { name: 'amount_cents', label: 'Montant (centimes)', type: 'number', required: true },
      { name: 'category_id', label: 'Catégorie', type: 'select', source: 'categories', optional: true },
      { name: 'bank_account_id', label: 'Compte', type: 'select', source: 'bankAccounts', required: true },
      { name: 'recurring_income_id', label: 'Revenu récurrent', type: 'select', source: 'recurringIncomes', optional: true },
    ],
  },
  {
    key: 'recurringIncomes',
    label: 'Revenus récurrents',
    singular: 'revenu récurrent',
    endpoint: '/recurring-incomes',
    idParam: 'recurring_income_id',
    description: 'Gérer les entrées qui reviennent selon une fréquence.',
    fields: [
      { name: 'label', label: 'Libellé', type: 'text', required: true },
      { name: 'amount_cents', label: 'Montant (centimes)', type: 'number', required: true },
      { name: 'start_date', label: 'Début', type: 'date', required: true },
      { name: 'end_date', label: 'Fin', type: 'date', optional: true },
      {
        name: 'frequency',
        label: 'Fréquence',
        type: 'static-select',
        required: true,
        defaultValue: 'mensuel',
        options: frequencyOptions,
      },
      { name: 'bank_account_id', label: 'Compte', type: 'select', source: 'bankAccounts', required: true },
    ],
  },
  {
    key: 'bankAccounts',
    label: 'Comptes bancaires',
    singular: 'compte bancaire',
    endpoint: '/bank-accounts',
    idParam: 'bank_account_id',
    description: 'Lister les comptes et leur devise.',
    fields: [
      { name: 'label', label: 'Libellé', type: 'text', required: true },
      { name: 'currency', label: 'Devise', type: 'text', required: true, defaultValue: 'CHF' },
      { name: 'account_type_id', label: 'Type de compte', type: 'select', source: 'accountTypes', required: true },
    ],
  },
  {
    key: 'accountTypes',
    label: 'Types de compte',
    singular: 'type de compte',
    endpoint: '/account-types',
    idParam: 'account_type_id',
    description: 'Définir les familles de comptes.',
    fields: [{ name: 'name', label: 'Nom', type: 'text', required: true }],
  },
]

export const resourceByKey = Object.fromEntries(resources.map((resource) => [resource.key, resource]))

export const homePages = [
  {
    key: 'stats',
    label: 'Stats',
    countLabel: '7',
    description: 'Afficher les totaux, la balance et les répartitions sur une seule page.',
  },
  ...resources,
]
