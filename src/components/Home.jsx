import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Bot, Upload, ArrowRight, Check, Globe, LogIn } from "lucide-react";
import { EXAMPLE_JSON } from "../jsonMapper";
import { SUPPORTED_LANGUAGES } from "../i18n";
import AuthHeader from "./AuthHeader";

function CopyButton({ text, onCopy, labelCopy, labelCopied }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2500);
    });
  }, [text, onCopy]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-medium text-sm hover:bg-slate-700 transition shadow-lg shadow-slate-900/20"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          {labelCopied}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" strokeWidth={2} />
          {labelCopy}
        </>
      )}
    </button>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [openAuthFromCTA, setOpenAuthFromCTA] = useState(false);

  const handleAuthCTA = () => {
    setOpenAuthFromCTA(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header: Language + Auth */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="flex-1 min-w-0" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" strokeWidth={2} aria-hidden />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent min-h-[44px]"
              aria-label={t("landing.languageLabel", "Language")}
            >
              {SUPPORTED_LANGUAGES.map(({ code, labelKey }) => (
                <option key={code} value={code}>
                  {t(labelKey)}
                </option>
              ))}
            </select>
          </div>
          <AuthHeader initialOpen={openAuthFromCTA} />
        </div>
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-10">
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition shadow-xl shadow-slate-900/25 hover:shadow-2xl"
            >
              {t("landing.ctaEditor")}
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      {/* Comment ça marche */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
          {t("landing.howItWorks")}
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">
          {t("landing.howItWorksIntro")}
        </p>

        <div className="space-y-8 sm:space-y-10">
          {/* Étape 1 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <Copy className="w-6 h-6 text-sky-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {t("landing.step1Title")}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-4">
                {t("landing.step1Text")}
              </p>
              <CopyButton
                text={EXAMPLE_JSON}
                labelCopy={t("landing.copyButton")}
                labelCopied={t("landing.copied")}
              />
            </div>
          </div>

          {/* Étape 2 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {t("landing.step2Title")}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-3">
                {t("landing.step2Text")}
              </p>
              <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-4 text-left">
                <p className="text-xs font-medium text-violet-700 mb-1">
                  {t("landing.examplePrompt")}
                </p>
                <p className="text-xs text-slate-700 font-mono leading-relaxed">
                  {t("landing.promptExample")}
                </p>
              </div>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-emerald-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {t("landing.step3Title")}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-4">
                {t("landing.step3Text")}
              </p>
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition"
              >
                {t("landing.openEditor")}
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* Auth CTA */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {t("landing.authCtaTitle")}
          </h3>
          <p className="text-sm text-slate-600 mb-4 max-w-xl mx-auto leading-relaxed">
            {t("landing.authCtaDescription")}
          </p>
          <button
            type="button"
            onClick={handleAuthCTA}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 text-white font-semibold text-base hover:bg-sky-700 transition shadow-lg min-h-[48px] touch-manipulation"
          >
            <LogIn className="w-5 h-5" strokeWidth={2} />
            {t("landing.authCtaButton")}
          </button>
        </div>

        {/* CTA final */}
        <div className="mt-16 text-center">
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition shadow-xl shadow-slate-900/25 min-h-[48px] items-center justify-center touch-manipulation"
          >
            {t("landing.ctaEditor")}
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-500 text-sm">
        {t("landing.footer")}
      </footer>
    </div>
  );
}
