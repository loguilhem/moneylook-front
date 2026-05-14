import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'moneylook.llmConfig'

const defaultConfig = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: '',
  organization: '',
}

const providerDefaults = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  custom: {
    baseUrl: '',
    model: '',
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.1',
  },
}

function readStoredConfig() {
  try {
    const storedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return { ...defaultConfig, ...storedConfig }
  } catch {
    return defaultConfig
  }
}

function LlmPage() {
  const { t } = useTranslation()
  const [config, setConfig] = useState(readStoredConfig)
  const [saveState, setSaveState] = useState('idle')
  const selectedProviderDefaults = useMemo(() => providerDefaults[config.provider] ?? providerDefaults.custom, [config.provider])

  function updateConfig(field, value) {
    setConfig((currentConfig) => ({ ...currentConfig, [field]: value }))
    setSaveState('idle')
  }

  function handleProviderChange(event) {
    const provider = event.target.value
    const defaults = providerDefaults[provider] ?? providerDefaults.custom

    setConfig((currentConfig) => ({
      ...currentConfig,
      provider,
      baseUrl: defaults.baseUrl,
      model: defaults.model,
    }))
    setSaveState('idle')
  }

  function useProviderDefaults() {
    setConfig((currentConfig) => ({
      ...currentConfig,
      baseUrl: selectedProviderDefaults.baseUrl,
      model: selectedProviderDefaults.model,
    }))
    setSaveState('idle')
  }

  function handleSubmit(event) {
    event.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaveState('saved')
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY)
    setConfig(defaultConfig)
    setSaveState('cleared')
  }

  const requiresApiKey = config.provider !== 'ollama'

  return (
    <main className="page-shell llm-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('llm.eyebrow')}</p>
          <h1>{t('llm.title')}</h1>
          <p>{t('llm.description')}</p>
        </div>
      </header>

      <form className="llm-config-panel" onSubmit={handleSubmit}>
        <section className="llm-form-section" aria-labelledby="llm-provider-title">
          <div className="section-heading">
            <h2 id="llm-provider-title">{t('llm.sections.provider')}</h2>
            <p>{t('llm.providerHelp')}</p>
          </div>

          <div className="form-grid llm-form-grid">
            <label className="checkbox-label llm-enabled-label">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(event) => updateConfig('enabled', event.target.checked)}
              />
              <span>{t('llm.fields.enabled')}</span>
            </label>

            <label>
              <span>{t('llm.fields.provider')}</span>
              <select value={config.provider} onChange={handleProviderChange}>
                <option value="openai">{t('llm.providers.openai')}</option>
                <option value="custom">{t('llm.providers.custom')}</option>
                <option value="ollama">{t('llm.providers.ollama')}</option>
              </select>
            </label>

            <label>
              <span>{t('llm.fields.baseUrl')}</span>
              <input
                type="url"
                value={config.baseUrl}
                placeholder={selectedProviderDefaults.baseUrl}
                onChange={(event) => updateConfig('baseUrl', event.target.value)}
              />
            </label>

            <label>
              <span>{t('llm.fields.model')}</span>
              <input
                type="text"
                value={config.model}
                placeholder={selectedProviderDefaults.model}
                onChange={(event) => updateConfig('model', event.target.value)}
              />
            </label>
          </div>

          <button className="secondary-button" type="button" onClick={useProviderDefaults}>
            {t('llm.actions.useDefaults')}
          </button>
        </section>

        <section className="llm-form-section" aria-labelledby="llm-auth-title">
          <div className="section-heading">
            <h2 id="llm-auth-title">{t('llm.sections.credentials')}</h2>
            <p>{requiresApiKey ? t('llm.credentialsHelp.remote') : t('llm.credentialsHelp.local')}</p>
          </div>

          <div className="form-grid llm-form-grid">
            <label>
              <span>{t('llm.fields.apiKey')}</span>
              <input
                type="password"
                value={config.apiKey}
                placeholder={requiresApiKey ? t('llm.placeholders.apiKey') : t('llm.placeholders.notRequired')}
                disabled={!requiresApiKey}
                onChange={(event) => updateConfig('apiKey', event.target.value)}
              />
            </label>

            <label>
              <span>{t('llm.fields.organization')}</span>
              <input
                type="text"
                value={config.organization}
                placeholder={t('llm.placeholders.organization')}
                disabled={config.provider === 'ollama'}
                onChange={(event) => updateConfig('organization', event.target.value)}
              />
            </label>
          </div>
        </section>

        <footer className="llm-form-actions">
          <div className="llm-form-status" role="status">
            {saveState === 'saved' ? t('llm.saved') : null}
            {saveState === 'cleared' ? t('llm.cleared') : null}
          </div>
          <button className="ghost-button" type="button" onClick={clearConfig}>
            {t('llm.actions.clear')}
          </button>
          <button className="primary-button" type="submit">
            {t('llm.actions.save')}
          </button>
        </footer>
      </form>
    </main>
  )
}

export default LlmPage
