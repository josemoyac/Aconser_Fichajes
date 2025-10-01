import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      welcome: 'Hola, {{name}}',
      clockIn: 'Fichar entrada',
      clockOut: 'Fichar salida',
      loading: 'Cargando...',
      finalizeAllocation: 'Finalizar imputación',
      hoursSummary: 'Resumen de horas'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
