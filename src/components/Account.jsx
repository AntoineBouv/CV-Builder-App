import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";

function DocumentCard({ item, type, onEdit, onDelete, t }) {
  const title = item.title || (type === "cv" ? t("account.cv") : t("account.recommendation"));
  const date = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString(undefined, { dateStyle: "short", timeStyle: "short" })
    : "—";

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-200 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{t("account.lastModified")} {date}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="text-[11px] font-medium text-sky-600 hover:text-sky-700 px-2 py-1 rounded hover:bg-sky-50 transition"
            >
              {t("account.edit")}
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="text-[11px] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
            >
              {t("account.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [docsLoading, setDocsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setDocsLoading(true);
    supabase
      .from("user_profiles")
      .select("profile_data")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.profile_data) setProfileData(data.profile_data);
        setDocsLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const cvList = Array.isArray(profileData?.cv_list) ? profileData.cv_list : [];
  const recommendationList = Array.isArray(profileData?.recommendation_list) ? profileData.recommendation_list : [];

  const updateProfileLists = async (newCvList, newRecList) => {
    if (!user) return;
    const next = {
      ...profileData,
      cv_list: newCvList,
      recommendation_list: newRecList,
    };
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ user_id: user.id, profile_data: next }, { onConflict: "user_id" });
    if (!error) setProfileData(next);
    return error;
  };

  const handleEditCv = (item) => {
    navigate("/", { state: { loadCv: item.data } });
  };
  const handleEditRecommendation = (item) => {
    navigate("/", { state: { loadRecommendation: item.data } });
  };

  const handleDeleteCv = async (item) => {
    const next = cvList.filter((x) => x.id !== item.id);
    const err = await updateProfileLists(next, recommendationList);
    if (err) setMessage({ type: "error", text: err.message });
  };
  const handleDeleteRecommendation = async (item) => {
    const next = recommendationList.filter((x) => x.id !== item.id);
    const err = await updateProfileLists(cvList, next);
    if (err) setMessage({ type: "error", text: err.message });
  };

  const handleDeleteAccount = async () => {
    if (!user || !deleteConfirm) return;
    setDeleteLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const { error: deleteError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", user.id);
      if (deleteError) throw deleteError;
      await supabase.auth.signOut();
      setMessage({ type: "success", text: "Compte supprimé. Redirection..." });
      setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Erreur lors de la suppression du compte.",
      });
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-sm text-gray-500">{t("account.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-700 px-5 py-3 flex items-center justify-between">
        <Link to="/" className="text-sm font-bold text-white hover:text-gray-200 transition">
          ← {t("account.backToApp")}
        </Link>
        <span className="text-[10px] text-gray-400">{t("account.title")}</span>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{t("account.title")}</h1>
          <p className="text-xs text-gray-500">{t("account.subtitle")}</p>
        </div>

        {/* Paramètres du compte */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            {t("account.accountSettings")}
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("account.email")}</h3>
              <p className="text-sm text-gray-900 break-all">{user.email}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("account.changePassword")}</h3>
              <Link
                to="/update-password"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {t("account.changePassword")}
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">{t("account.dangerZone")}</h3>
              <p className="text-[11px] text-gray-600 mb-3">
                {t("account.deleteAccountDescription")}
              </p>
              {!deleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  {t("account.deleteAccount")}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600">{t("account.deleteAccountConfirm")}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setDeleteConfirm(false); setMessage({ type: "", text: "" }); }}
                      className="px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      {t("account.cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {deleteLoading ? t("account.deleting") : t("account.confirmDelete")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mes Documents */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            {t("account.myDocuments")}
          </h2>
          {docsLoading ? (
            <p className="text-sm text-gray-500">{t("account.loading")}</p>
          ) : cvList.length === 0 && recommendationList.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-200 p-4">{t("account.noDocuments")}</p>
          ) : (
            <div className="space-y-4">
              {cvList.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("account.cv")}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cvList.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        type="cv"
                        onEdit={handleEditCv}
                        onDelete={handleDeleteCv}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}
              {recommendationList.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("account.recommendation")}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recommendationList.map((item) => (
                      <DocumentCard
                        key={item.id}
                        item={item}
                        type="recommendation"
                        onEdit={handleEditRecommendation}
                        onDelete={handleDeleteRecommendation}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {message.text && (
          <p
            className={`text-xs rounded-lg p-3 ${
              message.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </main>
    </div>
  );
}
