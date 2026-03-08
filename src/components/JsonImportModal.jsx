import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

export default function JsonImportModal({ isOpen, onClose, onApply, exampleJson }) {
  const { t } = useTranslation();
  const [jsonText, setJsonText] = useState("");
  const [emptyError, setEmptyError] = useState(false);

  const handleApply = useCallback(() => {
    if (!jsonText.trim()) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    onApply(jsonText);
    setJsonText("");
    onClose();
  }, [jsonText, onApply, onClose]);

  const handleClose = useCallback(() => {
    setJsonText("");
    setEmptyError(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-import-modal-title"
    >
      <div
        className="w-full max-h-[90vh] sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50">
          <h2 id="json-import-modal-title" className="text-base sm:text-lg font-bold text-gray-900">
            🤖 {t("jsonImportModal.title")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition shrink-0"
            aria-label={t("jsonImportModal.close")}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col min-h-0">
          <p className="text-sm text-gray-600 mb-3">
            {t("jsonImportModal.description")}
          </p>
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setEmptyError(false);
            }}
            rows={10}
            spellCheck={false}
            placeholder='{"title": "...", "summary": "...", "experience": [...], "skills": [...], "coverLetter": {...}}'
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-mono text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent resize-y min-h-[200px]"
          />
          {exampleJson && (
            <button
              type="button"
              onClick={() => setJsonText(exampleJson)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline"
            >
              {t("jsonImportModal.loadExample")}
            </button>
          )}
          {emptyError && (
            <div className="mt-3 p-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-200">
              {t("jsonImportModal.emptyError")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition"
          >
            {t("jsonImportModal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition shadow-md"
          >
            {t("jsonImportModal.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
