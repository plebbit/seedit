import i18next from 'i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'

const loadPath = `/translations/{{lng}}/{{ns}}.json`

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [
      'af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'bs', 'ca',
      'ckb', 'cs', 'cy', 'da', 'de', 'el', 'en', 'eo', 'es',
      'et', 'eu', 'fa', 'fi', 'fr', 'fy', 'ga', 'gd', 'gl',
      'gu', 'ha', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id',
      'ig', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko',
      'ku', 'ky', 'lb', 'lo', 'lt', 'lv', 'mg', 'mk', 'ml',
      'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'or',
      'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'rw', 'si', 'sk',
      'sl', 'sn', 'so', 'sq', 'sr', 'sv', 'sw', 'ta', 'te',
      'th', 'tl', 'tr', 'ug', 'uk', 'ur', 'uz', 'vi', 'yi',
      'yo', 'zh', 'zu'
    ],

    ns: ['default'],
    defaultNS: 'default',

    backend: {loadPath}
  })