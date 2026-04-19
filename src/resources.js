export const frequencyOptions = [
  { value: 'weekly', labelKey: 'resources.frequency.weekly' },
  { value: 'monthly', labelKey: 'resources.frequency.monthly' },
  { value: 'yearly', labelKey: 'resources.frequency.yearly' },
]

export const datePolicyOptions = [
  { value: 'same_day', labelKey: 'resources.datePolicy.sameDay' },
  { value: 'last_day_of_month', labelKey: 'resources.datePolicy.lastDayOfMonth' },
  { value: 'first_business_day', labelKey: 'resources.datePolicy.firstBusinessDay' },
  { value: 'last_business_day', labelKey: 'resources.datePolicy.lastBusinessDay' },
]

export const resources = [
  {
    key: 'categories',
    labelKey: 'resources.categories.label',
    singularKey: 'resources.categories.singular',
    endpoint: '/categories',
    idParam: 'category_id',
    descriptionKey: 'resources.categories.description',
    fields: [
      { name: 'name', labelKey: 'resources.fields.name', type: 'text', required: true },
      { name: 'icon_html', labelKey: 'resources.fields.iconHtml', type: 'text', required: true },
      { name: 'color', labelKey: 'resources.fields.color', type: 'color', required: true, defaultValue: '#00aeef' },
    ],
  },
  {
    key: 'expenses',
    labelKey: 'resources.expenses.label',
    singularKey: 'resources.expenses.singular',
    endpoint: '/expenses',
    idParam: 'expense_id',
    descriptionKey: 'resources.expenses.description',
    fields: [
      { name: 'date', labelKey: 'resources.fields.date', type: 'date', required: true },
      { name: 'label', labelKey: 'resources.fields.label', type: 'text', required: true },
      { name: 'amount_cents', labelKey: 'resources.fields.amount', type: 'money', required: true },
      { name: 'category_id', labelKey: 'resources.fields.category', type: 'select', source: 'categories', required: true },
      { name: 'bank_account_id', labelKey: 'resources.fields.bankAccount', type: 'select', source: 'bankAccounts', required: true },
    ],
  },
  {
    key: 'recurringExpenses',
    labelKey: 'resources.recurringExpenses.label',
    singularKey: 'resources.recurringExpenses.singular',
    endpoint: '/recurring-expenses',
    idParam: 'recurring_expense_id',
    descriptionKey: 'resources.recurringExpenses.description',
    fields: [
      { name: 'label', labelKey: 'resources.fields.label', type: 'text', required: true },
      { name: 'amount_cents', labelKey: 'resources.fields.amount', type: 'money', required: true },
      { name: 'is_active', labelKey: 'resources.fields.isActive', type: 'boolean', required: true, defaultValue: true },
      {
        name: 'date_policy',
        labelKey: 'resources.fields.datePolicy',
        type: 'static-select',
        required: true,
        defaultValue: 'same_day',
        options: datePolicyOptions,
      },
      {
        name: 'frequency',
        labelKey: 'resources.fields.frequency',
        type: 'static-select',
        required: true,
        defaultValue: 'monthly',
        options: frequencyOptions,
      },
      { name: 'category_id', labelKey: 'resources.fields.category', type: 'select', source: 'categories', required: true },
      { name: 'bank_account_id', labelKey: 'resources.fields.bankAccount', type: 'select', source: 'bankAccounts', required: true },
    ],
  },
  {
    key: 'incomes',
    labelKey: 'resources.incomes.label',
    singularKey: 'resources.incomes.singular',
    endpoint: '/incomes',
    idParam: 'income_id',
    descriptionKey: 'resources.incomes.description',
    fields: [
      { name: 'date', labelKey: 'resources.fields.date', type: 'date', required: true },
      { name: 'label', labelKey: 'resources.fields.label', type: 'text', required: true },
      { name: 'amount_cents', labelKey: 'resources.fields.amount', type: 'money', required: true },
      { name: 'category_id', labelKey: 'resources.fields.category', type: 'select', source: 'categories', optional: true },
      { name: 'bank_account_id', labelKey: 'resources.fields.bankAccount', type: 'select', source: 'bankAccounts', required: true },
    ],
  },
  {
    key: 'recurringIncomes',
    labelKey: 'resources.recurringIncomes.label',
    singularKey: 'resources.recurringIncomes.singular',
    endpoint: '/recurring-incomes',
    idParam: 'recurring_income_id',
    descriptionKey: 'resources.recurringIncomes.description',
    fields: [
      { name: 'label', labelKey: 'resources.fields.label', type: 'text', required: true },
      { name: 'amount_cents', labelKey: 'resources.fields.amount', type: 'money', required: true },
      { name: 'is_active', labelKey: 'resources.fields.isActive', type: 'boolean', required: true, defaultValue: true },
      {
        name: 'date_policy',
        labelKey: 'resources.fields.datePolicy',
        type: 'static-select',
        required: true,
        defaultValue: 'same_day',
        options: datePolicyOptions,
      },
      {
        name: 'frequency',
        labelKey: 'resources.fields.frequency',
        type: 'static-select',
        required: true,
        defaultValue: 'monthly',
        options: frequencyOptions,
      },
      { name: 'bank_account_id', labelKey: 'resources.fields.bankAccount', type: 'select', source: 'bankAccounts', required: true },
    ],
  },
  {
    key: 'bankAccounts',
    labelKey: 'resources.bankAccounts.label',
    singularKey: 'resources.bankAccounts.singular',
    endpoint: '/bank-accounts',
    idParam: 'bank_account_id',
    descriptionKey: 'resources.bankAccounts.description',
    fields: [
      { name: 'label', labelKey: 'resources.fields.label', type: 'text', required: true },
      { name: 'currency', labelKey: 'resources.fields.currency', type: 'text', required: true, defaultValue: 'CHF' },
      { name: 'account_type_id', labelKey: 'resources.fields.accountType', type: 'select', source: 'accountTypes', required: true },
    ],
  },
  {
    key: 'accountTypes',
    labelKey: 'resources.accountTypes.label',
    singularKey: 'resources.accountTypes.singular',
    endpoint: '/account-types',
    idParam: 'account_type_id',
    descriptionKey: 'resources.accountTypes.description',
    fields: [{ name: 'name', labelKey: 'resources.fields.name', type: 'text', required: true }],
  },
]

export const resourceByKey = Object.fromEntries(resources.map((resource) => [resource.key, resource]))

export function translateResource(resource, t) {
  return {
    ...resource,
    label: t(resource.labelKey),
    singular: t(resource.singularKey),
    description: t(resource.descriptionKey),
    fields: resource.fields.map((field) => ({
      ...field,
      label: t(field.labelKey),
      falseLabel: field.type === 'boolean' ? t('common.no') : undefined,
      trueLabel: field.type === 'boolean' ? t('common.yes') : undefined,
      options: field.options?.map((option) => ({
        ...option,
        label: t(option.labelKey),
      })),
    })),
  }
}

export function getTranslatedResources(t) {
  return resources.map((resource) => translateResource(resource, t))
}

export function getTranslatedResourceByKey(t) {
  return Object.fromEntries(getTranslatedResources(t).map((resource) => [resource.key, resource]))
}

export function getHomePages(t) {
  return [
    {
      key: 'stats',
      label: t('resources.stats.label'),
      countLabel: '7',
      description: t('resources.stats.description'),
    },
    ...getTranslatedResources(t),
  ]
}

export const homePages = [
  {
    key: 'stats',
    labelKey: 'resources.stats.label',
    countLabel: '7',
    descriptionKey: 'resources.stats.description',
  },
  ...resources,
]
