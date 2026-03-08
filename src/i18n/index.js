import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import ru from "./locales/ru.json";
import tr from "./locales/tr.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", labelKey: "languages.en" },
  { code: "fr", labelKey: "languages.fr" },
  { code: "tr", labelKey: "languages.tr" },
  { code: "ru", labelKey: "languages.ru" },
  { code: "it", labelKey: "languages.it" },
  { code: "de", labelKey: "languages.de" },
];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    ru: { translation: ru },
    tr: { translation: tr },
  },
  lng: "fr",
  fallbackLng: "fr",
  supportedLngs: ["en", "fr", "tr", "ru", "it", "de"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
