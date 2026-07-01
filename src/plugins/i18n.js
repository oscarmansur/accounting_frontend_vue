import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import es from '../locales/es.json'



// Detect browser language or default to English
const detectedLocale = navigator.language.split('-')[0]
const supportedLocales = ['en', 'es']
const defaultLocale = supportedLocales.includes(detectedLocale) ? detectedLocale : 'en'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: localStorage.getItem('locale') || defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    es
  }
})

// Function to change language
export const changeLanguage = (locale) => {
  if (supportedLocales.includes(locale)) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
  }
}

// Function to get current language
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

// Function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ]
}

export default i18n