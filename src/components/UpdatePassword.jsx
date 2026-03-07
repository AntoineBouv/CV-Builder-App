import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (password.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: "success", text: "Mot de passe mis à jour. Redirection..." });
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Impossible de mettre à jour le mot de passe.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
        <p className="text-xs text-gray-500 mb-4">
          Choisissez un nouveau mot de passe sécurisé (6 caractères minimum).
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          {message.text && (
            <p
              className={`text-xs rounded-lg p-2 ${
                message.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {message.text}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
