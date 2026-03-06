import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Connexion réussie." });
    setShowAuth(false);
    setEmail("");
    setPassword("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Inscription réussie. Vérifiez votre email." });
    setShowAuth(false);
    setEmail("");
    setPassword("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowAuth(false);
  };

  if (loading) {
    return (
      <span className="text-[10px] text-gray-500">...</span>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-300 max-w-[140px] truncate" title={user.email}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-[10px] bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 rounded px-2 py-1 transition"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setShowAuth(!showAuth); setMessage({ type: "", text: "" }); }}
        className="text-[10px] bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 rounded px-2 py-1 transition"
      >
        Connexion / Inscription
      </button>

      {showAuth && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 z-50">
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 text-[10px] py-1 rounded ${mode === "login" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 text-[10px] py-1 rounded ${mode === "signup" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-2 py-1.5 text-[11px] bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              minLength={6}
              className="w-full px-2 py-1.5 text-[11px] bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="w-full text-[10px] py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition"
            >
              {mode === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          </form>

          {message.text && (
            <p className={`mt-2 text-[10px] ${message.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
