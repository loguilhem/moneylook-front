import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { request } from '../context/AppContext'

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

function LlmPage() {
  const { t } = useTranslation()
  const [config, setConfig] = useState(defaultConfig)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('idle')
  const selectedProviderDefaults = useMemo(() => providerDefaults[config.provider] ?? providerDefaults.custom, [config.provider])

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      setError('')

      try {
        const settings = await request('/llm/settings')
        setConfig({
          enabled: settings.enabled,
          provider: settings.provider,
          apiKey: '',
          baseUrl: settings.base_url,
          model: settings.model,
          organization: settings.organization,
        })
        setHasApiKey(settings.has_api_key)
      } catch (loadError) {
        setError(t('llm.errors.load', { message: loadError.message }))
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [t])

  function updateConfig(field, value) {
    setConfig((currentConfig) => ({ ...currentConfig, [field]: value }))
    setSaveState('idle')
    setTestResult(null)
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
    setTestResult(null)
  }

  function useProviderDefaults() {
    setConfig((currentConfig) => ({
      ...currentConfig,
      baseUrl: selectedProviderDefaults.baseUrl,
      model: selectedProviderDefaults.model,
    }))
    setSaveState('idle')
    setTestResult(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    saveSettings(config.apiKey || undefined)
  }

  function clearConfig() {
    setConfig(defaultConfig)
    setHasApiKey(false)
    saveSettings('', defaultConfig)
  }

  async function saveSettings(apiKeyOverride, sourceConfig = config, nextSaveState = apiKeyOverride === '' ? 'cleared' : 'saved') {
    setError('')

    try {
      const payload = {
        enabled: sourceConfig.enabled,
        provider: sourceConfig.provider,
        base_url: sourceConfig.baseUrl,
        model: sourceConfig.model,
        organization: sourceConfig.organization,
      }

      if (apiKeyOverride !== undefined) {
        payload.api_key = apiKeyOverride
      }

      const settings = await request('/llm/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      setConfig((currentConfig) => ({
        ...currentConfig,
        enabled: settings.enabled,
        provider: settings.provider,
        apiKey: '',
        baseUrl: settings.base_url,
        model: settings.model,
        organization: settings.organization,
      }))
      setHasApiKey(settings.has_api_key)
      setSaveState(nextSaveState)
      setTestResult(null)
      return settings
    } catch (saveError) {
      setError(t('llm.errors.save', { message: saveError.message }))
      throw saveError
    }
  }

  async function testConnection() {
    setIsTesting(true)
    setError('')
    setTestResult(null)

    try {
      await saveSettings(config.apiKey || undefined, config, 'idle')
      const result = await request('/llm/test', { method: 'POST' })
      setTestResult({
        ok: result.ok,
        message: result.message || t('llm.test.success'),
      })
    } catch (testError) {
      setTestResult({
        ok: false,
        message: testError.message,
      })
    } finally {
      setIsTesting(false)
    }
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
        {error ? <p className="alert">{error}</p> : null}
        {isLoading ? (
          <p className="inline-loader">
            <span className="loader-spinner" aria-hidden="true" />
            {t('llm.loading')}
          </p>
        ) : null}

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
                placeholder={requiresApiKey ? (hasApiKey ? t('llm.placeholders.savedApiKey') : t('llm.placeholders.apiKey')) : t('llm.placeholders.notRequired')}
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
          {testResult ? (
            <div className={`llm-test-status ${testResult.ok ? 'is-success' : 'is-error'}`} role="status">
              <span aria-hidden="true" />
              <strong>{testResult.ok ? t('llm.test.success') : t('llm.test.error')}</strong>
              <p>{testResult.message}</p>
            </div>
          ) : null}
          <button className="secondary-button" type="button" disabled={isLoading || isTesting} onClick={testConnection}>
            {isTesting ? t('llm.actions.testing') : t('llm.actions.test')}
          </button>
          <button className="ghost-button" type="button" onClick={clearConfig}>
            {t('llm.actions.clear')}
          </button>
          <button className="primary-button" type="submit" disabled={isLoading}>
            {t('llm.actions.save')}
          </button>
        </footer>
      </form>
    </main>
  )
}

export default LlmPage
