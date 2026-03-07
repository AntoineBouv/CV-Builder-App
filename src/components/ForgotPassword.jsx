import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const SUCCESS_MSG = "Un email contenant un lien de réinitialisation vous a été envoyé.";

export default function ForgotPassword({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (!email.trim()) {
      setMessage({ type: "error", text: "Veuillez saisir votre email." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage({ type: "success", text: SUCCESS_MSG });
      onSuccess?.();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Une erreur est survenue. Vérifiez que cet email est bien enregistré.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-gray-800 border border-gray-600 rounded-xl shadow-xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Mot de passe oublié</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mb-3">
          Saisissez l’email de votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-xs text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
          </div>
        </form>
        {message.text && (
          <p
            className={`mt-3 text-[11px] rounded-lg p-2 ${
              message.type === "error" ? "bg-red-900/30 text-red-300" : "bg-emerald-900/30 text-emerald-300"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
