import i18n from 'i18next';
import en from 'locales/en';

export default i18n.init({
  lng: 'en',
  defaultNS: 'translation',
  resources: {
    en,
  },
  returnObjects: true,
});
