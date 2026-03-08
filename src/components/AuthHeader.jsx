import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import ForgotPassword from "./ForgotPassword";

export default function AuthHeader({ initialOpen = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const { t } = useTranslation();

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

  useEffect(() => {
    if (initialOpen) setShowAuth(true);
  }, [initialOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const isEmailNotConfirmed = error.message?.toLowerCase().includes("email not confirmed");
      setMessage({
        type: "error",
        text: isEmailNotConfirmed ? t("auth.emailNotConfirmed") : error.message,
      });
      return;
    }
    setMessage({ type: "success", text: t("auth.loginSuccess") });
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
    setMessage({ type: "success", text: t("auth.signupConfirmMessage") });
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
        <Link
          to="/account"
          className="text-[10px] text-sky-300 hover:text-sky-200 max-w-[120px] truncate"
          title={t("auth.myAccount")}
        >
          {t("auth.myAccount")}
        </Link>
        <span className="text-[10px] text-gray-400 max-w-[100px] truncate" title={user.email}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-[10px] bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 rounded px-2 py-1 transition"
        >
          {t("auth.signOut")}
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
        {t("auth.loginSignup")}
      </button>

      {showAuth && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 z-50">
          {message.type === "success" && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-600/50 text-emerald-300 text-[11px] leading-snug">
              {message.text}
            </div>
          )}
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 text-[10px] py-1 rounded ${mode === "login" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              {t("auth.login")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 text-[10px] py-1 rounded ${mode === "signup" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              {t("auth.signup")}
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              required
              className="w-full px-2 py-1.5 text-[11px] bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password")}
              required
              minLength={6}
              className="w-full px-2 py-1.5 text-[11px] bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="w-full text-[10px] py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition"
            >
              {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
            </button>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => { setShowAuth(false); setShowForgotPassword(true); setMessage({ type: "", text: "" }); }}
                className="w-full text-[10px] text-gray-400 hover:text-sky-400 transition"
              >
                {t("auth.forgotPassword")}
              </button>
            )}
          </form>

          {message.type === "error" && message.text && (
            <p className="mt-2 text-[10px] text-red-400">
              {message.text}
            </p>
          )}
        </div>
      )}

      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => setMessage({ type: "success", text: t("auth.resetEmailSent") })}
        />
      )}
    </div>
  );
}
