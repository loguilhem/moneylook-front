import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import de from './locales/de.json'

const savedLanguage = localStorage.getItem('moneylook-language')
const browserLanguage = navigator.language?.split('-')[0]
const supportedLanguages = ['fr', 'en']
const initialLanguage = supportedLanguages.includes(savedLanguage)
  ? savedLanguage
  : supportedLanguages.includes(browserLanguage)
    ? browserLanguage
    : 'fr'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    it: { translation: it },
    de: { translation: de }
  },
  lng: initialLanguage,
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  localStorage.setItem('moneylook-language', language)
})

export default i18n
