import i18n from 'i18next';
import ja from 'locales/ja';

export default i18n.init({
  lng: 'ja',
  defaultNS: 'translation',
  resources: {
    ja,
  },
  returnObjects: true,
});
