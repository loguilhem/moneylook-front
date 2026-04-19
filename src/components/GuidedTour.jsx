import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

export const TOUR_COMPLETED_KEY = 'moneylook-guided-tour-completed'

function getTourSteps(t) {
  return [
    {
      path: '/',
      target: '[data-tour="brand"]',
      title: t('tour.steps.welcome.title'),
      body: t('tour.steps.welcome.body'),
      demoRows: [
        { label: t('resources.stats.label'), value: '7' },
        { label: t('resources.expenses.label'), value: '24' },
        { label: t('resources.incomes.label'), value: '5' },
      ],
    },
    {
      path: '/',
      target: '[data-tour="nav-home"]',
      title: t('tour.steps.home.title'),
      body: t('tour.steps.home.body'),
      demoRows: [
        { label: t('resources.bankAccounts.label'), value: '3' },
        { label: t('resources.categories.label'), value: '12' },
        { label: t('resources.recurringExpenses.label'), value: '8' },
      ],
    },
    {
      path: '/stats',
      target: '[data-tour="nav-stats"]',
      title: t('tour.steps.stats.title'),
      body: t('tour.steps.stats.body'),
      demoRows: [
        { label: t('stats.cards.totalIncome'), value: '5 200.00 CHF', tone: 'positive' },
        { label: t('stats.cards.totalExpense'), value: '3 940.00 CHF', tone: 'negative' },
        { label: t('stats.cards.currentBalance'), value: '1 260.00 CHF', tone: 'positive' },
      ],
    },
    {
      path: '/stats',
      target: '[data-tour="app-content"]',
      title: t('stats.monthlyAccountEvolution.title'),
      body: t('tour.steps.statsPage.body'),
      demoRows: [
        { label: t('stats.expenseDistribution.title'), value: 'Courses 28 %, Logement 25 %' },
        { label: t('stats.bankAccounts.title'), value: 'Compte courant +1 260.00 CHF' },
        { label: t('stats.annual.title'), value: 'Janvier -> Décembre' },
      ],
    },
    {
      path: '/resource/expenses',
      target: '[data-tour="nav-expenses"]',
      title: t('tour.steps.expenses.title'),
      body: t('tour.steps.expenses.body'),
      demoRows: [
        { label: 'Migros Lausanne', value: '84.35 CHF' },
        { label: 'Restaurant du Lac', value: '42.00 CHF' },
        { label: 'Train régional', value: '16.20 CHF' },
      ],
    },
    {
      path: '/resource/incomes',
      target: '[data-tour="nav-incomes"]',
      title: t('tour.steps.incomes.title'),
      body: t('tour.steps.incomes.body'),
      demoRows: [
        { label: 'Salaire', value: '4 800.00 CHF', tone: 'positive' },
        { label: 'Remboursement', value: '120.00 CHF', tone: 'positive' },
        { label: 'Vente occasion', value: '80.00 CHF', tone: 'positive' },
      ],
    },
    {
      path: '/resource/categories',
      target: '[data-tour="app-content"]',
      title: t('resources.categories.label'),
      body: t('resources.categories.description'),
      demoRows: [
        { label: 'Courses', value: '#00aeef' },
        { label: 'Logement', value: '#11b69a' },
        { label: 'Restaurants', value: '#f4a261' },
      ],
    },
    {
      path: '/resource/recurring-expenses',
      target: '[data-tour="app-content"]',
      title: t('resources.recurringExpenses.label'),
      body: t('resources.recurringExpenses.description'),
      demoRows: [
        { label: 'Loyer', value: '1 450.00 CHF' },
        { label: 'Assurance', value: '129.90 CHF' },
        { label: 'Abonnement mobile', value: '29.90 CHF' },
      ],
    },
    {
      path: '/resource/recurring-incomes',
      target: '[data-tour="app-content"]',
      title: t('resources.recurringIncomes.label'),
      body: t('resources.recurringIncomes.description'),
      demoRows: [
        { label: 'Salaire', value: '4 800.00 CHF', tone: 'positive' },
        { label: 'Allocation', value: '250.00 CHF', tone: 'positive' },
        { label: 'Revenu locatif', value: '900.00 CHF', tone: 'positive' },
      ],
    },
    {
      path: '/resource/bank-accounts',
      target: '[data-tour="app-content"]',
      title: t('resources.bankAccounts.label'),
      body: t('resources.bankAccounts.description'),
      demoRows: [
        { label: 'Compte courant', value: '2 340.00 CHF' },
        { label: 'Épargne', value: '12 500.00 CHF' },
        { label: 'Carte commune', value: '760.00 CHF' },
      ],
    },
    {
      path: '/resource/account-types',
      target: '[data-tour="app-content"]',
      title: t('resources.accountTypes.label'),
      body: t('resources.accountTypes.description'),
      demoRows: [
        { label: 'current', value: t('resources.bankAccounts.singular') },
        { label: 'saving', value: t('resources.accountTypes.singular') },
        { label: 'investment', value: t('resources.accountTypes.singular') },
      ],
    },
    {
      target: '[data-tour="nav-settings"]',
      title: t('tour.steps.settings.title'),
      body: t('tour.steps.settings.body'),
    },
    {
      target: '[data-tour="nav-language"]',
      title: t('tour.steps.language.title'),
      body: t('tour.steps.language.body'),
    },
    {
      target: '[data-tour="app-content"]',
      title: t('tour.steps.content.title'),
      body: t('tour.steps.content.body'),
    },
  ]
}

function getTargetRect(selector) {
  const target = document.querySelector(selector)

  if (!target) {
    return null
  }

  const rect = target.getBoundingClientRect()

  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  }
}

function getCardPosition(rect) {
  const cardWidth = 390
  const margin = 16

  if (!rect) {
    return {
      left: `calc(50% - ${cardWidth / 2}px)`,
      top: '50%',
      transform: 'translateY(-50%)',
      width: `${cardWidth}px`,
    }
  }

  const enoughSpaceBelow = rect.bottom + 220 < window.innerHeight
  const top = enoughSpaceBelow ? rect.bottom + margin : Math.max(margin, rect.top - 220 - margin)
  const left = Math.min(Math.max(margin, rect.left), window.innerWidth - cardWidth - margin)

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${cardWidth}px`,
  }
}

function GuidedTour({ onClose }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const steps = useMemo(() => getTourSteps(t), [t])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  useEffect(() => {
    if (currentStep.path && location.pathname !== currentStep.path) {
      navigate(currentStep.path, { replace: true })
    }
  }, [currentStep.path, location.pathname, navigate])

  useEffect(() => {
    function updateTargetRect() {
      setTargetRect(getTargetRect(currentStep.target))
    }

    const timeoutId = window.setTimeout(updateTargetRect, 80)
    window.addEventListener('resize', updateTargetRect)
    window.addEventListener('scroll', updateTargetRect, true)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('resize', updateTargetRect)
      window.removeEventListener('scroll', updateTargetRect, true)
    }
  }, [currentStep.target, location.pathname])

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  function goToPreviousStep() {
    setCurrentStepIndex((index) => Math.max(0, index - 1))
  }

  function goToNextStep() {
    if (isLastStep) {
      onClose()
      return
    }

    setCurrentStepIndex((index) => Math.min(steps.length - 1, index + 1))
  }

  return (
    <div className="guided-tour" role="dialog" aria-modal="true" aria-labelledby="guided-tour-title">
      {targetRect ? (
        <div
          className="guided-tour-highlight"
          style={{
            height: `${targetRect.height + 12}px`,
            left: `${targetRect.left - 6}px`,
            top: `${targetRect.top - 6}px`,
            width: `${targetRect.width + 12}px`,
          }}
        />
      ) : (
        <div className="guided-tour-backdrop" />
      )}

      <section className="guided-tour-card" style={getCardPosition(targetRect)}>
        <p className="eyebrow">{t('tour.eyebrow', { current: currentStepIndex + 1, total: steps.length })}</p>
        <h2 id="guided-tour-title">{currentStep.title}</h2>
        <p>{currentStep.body}</p>
        {currentStep.demoRows?.length ? (
          <div className="guided-tour-demo" aria-label={t('tour.demoLabel')}>
            <span>{t('tour.demoLabel')}</span>
            {currentStep.demoRows.map((row) => (
              <div className="guided-tour-demo-row" key={`${row.label}-${row.value}`}>
                <strong>{row.label}</strong>
                <em className={row.tone ?? ''}>{row.value}</em>
              </div>
            ))}
          </div>
        ) : null}

        <div className="guided-tour-actions">
          <button className="ghost-button" type="button" onClick={onClose}>
            {t('tour.skip')}
          </button>
          <div>
            <button className="secondary-button" type="button" disabled={isFirstStep} onClick={goToPreviousStep}>
              {t('tour.previous')}
            </button>
            <button className="primary-button" type="button" onClick={goToNextStep}>
              {isLastStep ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GuidedTour
