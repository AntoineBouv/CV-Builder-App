import { useTranslation } from "react-i18next";
import { Copy, Bot, Upload, CheckCircle, X } from "lucide-react";

export default function HelpModal({ onClose }) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title + close */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 id="help-modal-title" className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
            {t("helpModal.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition shrink-0"
            aria-label={t("helpModal.close")}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content: 3 steps */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Copy className="w-5 h-5 text-sky-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {t("helpModal.step1Title")}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t("helpModal.step1Text")}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm text-sm text-gray-600">
                <Copy className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{t("helpModal.copyJsonButton")}</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {t("helpModal.step2Title")}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t("helpModal.step2Text")}
              </p>
              <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-medium text-violet-700">{t("helpModal.examplePrompt")}</span>
                </div>
                <p className="text-xs text-gray-600 font-mono leading-relaxed">
                  {t("helpModal.promptExample")}
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {t("helpModal.step3Title")}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t("helpModal.step3Text")}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm text-sm text-gray-600">
                <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{t("helpModal.importJsonButton")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: C'est compris */}
        <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-200 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition shadow-lg"
          >
            <CheckCircle className="w-4 h-4" strokeWidth={2} />
            {t("helpModal.gotIt")}
          </button>
        </div>
      </div>
    </div>
  );
}
