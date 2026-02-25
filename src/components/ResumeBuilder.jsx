import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import CoverLetterPDF from "./CoverLetterPDF";
import {
  emptyPermanentData, emptyDynamicData, emptyCoverLetter,
  loadPermanentData, savePermanentData,
  buildCvForPdf, buildClForPdf, getMissingFields,
} from "../initialData";
import {
  mapJsonToDynamicData, mapJsonToPermanentData, mapJsonToCoverLetter,
  EXAMPLE_JSON, EXAMPLE_PROFILE_JSON,
} from "../jsonMapper";

/* ═══════════════════════════════════════════════
   Reusable form primitives
   ═══════════════════════════════════════════════ */

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="mb-2.5">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition bg-white"
      />
    </div>
  );
}

function FieldArea({ label, value, onChange, rows = 2, placeholder = "" }) {
  return (
    <div className="mb-2.5">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition resize-vertical bg-white"
      />
    </div>
  );
}

function Section({ title, onAdd, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 mt-3 border-b border-gray-200 group"
      >
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          {onAdd && (
            <span
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded hover:bg-gray-700 transition cursor-pointer"
            >
              + Add
            </span>
          )}
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && <div className="pt-3 pb-1">{children}</div>}
    </div>
  );
}

function EntryCard({ children, onRemove }) {
  return (
    <div className="mb-3 p-3 bg-gray-50/80 rounded-lg border border-gray-100 relative group">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Remove
        </button>
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PDF Preview (blob-based, debounced)
   ═══════════════════════════════════════════════ */

function PDFPreview({ document: pdfDoc }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const blob = await pdf(pdfDoc).toBlob();
        const u = URL.createObjectURL(blob);
        setUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return u; });
      } catch (e) {
        console.error("PDF error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [pdfDoc]);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-sm">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-red-500 text-lg font-bold">!</span>
          </div>
          <p className="text-red-600 font-medium text-sm mb-1">PDF Error</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/70 z-10">
          <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-lg shadow-lg">
            <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-600">Rendering...</span>
          </div>
        </div>
      )}
      {url && <iframe src={url} className="w-full h-full rounded-lg shadow-xl bg-white" title="Preview" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Missing Fields Alert
   ═══════════════════════════════════════════════ */

function MissingFieldsAlert({ missing }) {
  if (!missing.length) {
    return (
      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-emerald-700 text-xs font-medium">Tous les champs requis sont remplis</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-red-700 text-xs font-bold">Champs requis manquants :</span>
      </div>
      <div className="flex flex-wrap gap-1.5 ml-6">
        {missing.map((f) => (
          <span key={f} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{f}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Onglet 1: Profil Permanent Editor
   ═══════════════════════════════════════════════ */

function PermanentProfileEditor({ data, setData, onSave, saveStatus }) {
  const [importJson, setImportJson] = useState("");
  const [importStatus, setImportStatus] = useState(null);

  const upd = useCallback((path, value) => {
    setData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let t = copy;
      for (let i = 0; i < keys.length - 1; i++) t = t[keys[i]];
      t[keys[keys.length - 1]] = value;
      return copy;
    });
  }, [setData]);

  const addEdu = () => setData((p) => ({ ...p, education: [...p.education, { id: Date.now(), degree: "", school: "", location: "", startDate: "", endDate: "", description: "" }] }));
  const rmEdu = (id) => setData((p) => ({ ...p, education: p.education.filter((e) => e.id !== id) }));
  const updEdu = (id, f, v) => setData((p) => ({ ...p, education: p.education.map((e) => e.id === id ? { ...e, [f]: v } : e) }));

  const addLang = () => setData((p) => ({ ...p, languages: [...p.languages, { language: "", level: "" }] }));
  const rmLang = (i) => setData((p) => ({ ...p, languages: p.languages.filter((_, x) => x !== i) }));
  const updLang = (i, f, v) => setData((p) => ({ ...p, languages: p.languages.map((l, x) => x === i ? { ...l, [f]: v } : l) }));

  const addCert = () => setData((p) => ({ ...p, certificates: [...p.certificates, ""] }));
  const rmCert = (i) => setData((p) => ({ ...p, certificates: p.certificates.filter((_, x) => x !== i) }));
  const updCert = (i, v) => setData((p) => ({ ...p, certificates: p.certificates.map((c, x) => x === i ? v : c) }));

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) { const r = new FileReader(); r.onloadend = () => upd("photo", r.result); r.readAsDataURL(f); }
  };

  const handleImportJson = () => {
    if (!importJson.trim()) { setImportStatus({ ok: false, msg: "Collez un JSON d'abord." }); return; }
    try {
      const mapped = mapJsonToPermanentData(importJson);
      setData((prev) => {
        const updated = { ...prev };
        Object.entries(mapped).forEach(([k, v]) => {
          if (v === null) return;
          if (Array.isArray(v) && v.length) updated[k] = v;
          else if (typeof v === "string" && v) updated[k] = v;
        });
        return updated;
      });
      setImportStatus({ ok: true, msg: "Profil importe avec succes. Verifiez les champs puis sauvegardez." });
    } catch (e) {
      setImportStatus({ ok: false, msg: `JSON invalide : ${e.message}` });
    }
  };

  return (
    <div className="px-5 pb-4">
      {/* JSON Import zone */}
      <div className="mt-4 mb-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2">
          Importer Profil JSON
        </label>
        <textarea
          value={importJson}
          onChange={(e) => { setImportJson(e.target.value); setImportStatus(null); }}
          rows={4}
          spellCheck={false}
          placeholder={`Collez ici un JSON avec vos infos de base :\n{"firstName":"...","lastName":"...","email":"...",...}`}
          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-[11px] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-vertical"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleImportJson}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-xs hover:bg-blue-700 transition"
          >
            Importer et remplir
          </button>
          <button
            onClick={() => { setImportJson(EXAMPLE_PROFILE_JSON); setImportStatus(null); }}
            className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-[10px] hover:bg-blue-200 transition font-medium"
          >
            Exemple
          </button>
        </div>
        {importStatus && (
          <div className={`mt-2 p-2 rounded-lg text-[11px] ${
            importStatus.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
          }`}>{importStatus.msg}</div>
        )}
      </div>

      {/* Identity */}
      <Section title="Identite" defaultOpen={true}>
        <div className="flex items-center gap-3 mb-3">
          {data.photo ? (
            <img src={data.photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold">
              {(data.firstName?.[0] || "?") + (data.lastName?.[0] || "")}
            </div>
          )}
          <label className="cursor-pointer text-[10px] bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded transition">
            Photo
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
          {data.photo && (
            <button onClick={() => upd("photo", null)} className="text-[10px] text-red-400 hover:text-red-600">Suppr.</button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Prenom *" value={data.firstName} onChange={(e) => upd("firstName", e.target.value)} />
          <Field label="Nom *" value={data.lastName} onChange={(e) => upd("lastName", e.target.value)} />
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact" defaultOpen={true}>
        <Field label="Email *" type="email" value={data.email} onChange={(e) => upd("email", e.target.value)} />
        <Field label="Telephone *" value={data.phone} onChange={(e) => upd("phone", e.target.value)} />
        <Field label="Lieu" value={data.location} onChange={(e) => upd("location", e.target.value)} />
        <Field label="LinkedIn" value={data.linkedin} onChange={(e) => upd("linkedin", e.target.value)} />
        <Field label="Portfolio / GitHub" value={data.portfolio} onChange={(e) => upd("portfolio", e.target.value)} />
      </Section>

      {/* Education */}
      <Section title="Formation Academique" onAdd={addEdu} defaultOpen={true}>
        {data.education.length === 0 && (
          <p className="text-xs text-gray-400 italic mb-2">Aucun diplome ajoute. Cliquez "+ Add" ci-dessus.</p>
        )}
        {data.education.map((edu) => (
          <EntryCard key={edu.id} onRemove={() => rmEdu(edu.id)}>
            <Field label="Diplome" value={edu.degree} onChange={(e) => updEdu(edu.id, "degree", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Ecole" value={edu.school} onChange={(e) => updEdu(edu.id, "school", e.target.value)} />
              <Field label="Lieu" value={edu.location} onChange={(e) => updEdu(edu.id, "location", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Debut" value={edu.startDate} onChange={(e) => updEdu(edu.id, "startDate", e.target.value)} placeholder="09/2021" />
              <Field label="Fin" value={edu.endDate} onChange={(e) => updEdu(edu.id, "endDate", e.target.value)} placeholder="06/2026" />
            </div>
            <FieldArea label="Description" value={edu.description} onChange={(e) => updEdu(edu.id, "description", e.target.value)} rows={2} />
          </EntryCard>
        ))}
      </Section>

      {/* Languages */}
      <Section title="Langues" onAdd={addLang} defaultOpen={true}>
        {data.languages.map((l, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1.5">
            <input value={l.language} onChange={(e) => updLang(i, "language", e.target.value)} placeholder="Langue"
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white" />
            <input value={l.level} onChange={(e) => updLang(i, "level", e.target.value)} placeholder="Niveau"
              className="w-32 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white" />
            <button onClick={() => rmLang(i)} className="text-red-400 hover:text-red-600 text-[10px] px-1">X</button>
          </div>
        ))}
      </Section>

      {/* Certificates */}
      <Section title="Certifications" onAdd={addCert} defaultOpen={false}>
        {data.certificates.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1.5">
            <input value={c} onChange={(e) => updCert(i, e.target.value)}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white" />
            <button onClick={() => rmCert(i)} className="text-red-400 hover:text-red-600 text-[10px] px-1">X</button>
          </div>
        ))}
      </Section>

      {/* Big Save Button */}
      <div className="mt-6 mb-4">
        <button
          onClick={onSave}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 active:bg-emerald-800 transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Sauvegarder dans le navigateur
        </button>
        {saveStatus && (
          <div className={`mt-2 p-2.5 rounded-lg text-xs text-center font-medium ${
            saveStatus.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
          }`}>{saveStatus.msg}</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Onglet 2: CV Dynamique Editor
   ═══════════════════════════════════════════════ */

function DynamicCVEditor({ data, setData }) {
  const upd = (key, val) => setData((p) => ({ ...p, [key]: val }));

  const addExp = () => setData((p) => ({ ...p, experience: [...p.experience, { id: Date.now(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", description: "" }] }));
  const rmExp = (id) => setData((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== id) }));
  const updExp = (id, f, v) => setData((p) => ({ ...p, experience: p.experience.map((e) => e.id === id ? { ...e, [f]: v } : e) }));

  const addProj = () => setData((p) => ({ ...p, projects: [...p.projects, { id: Date.now(), name: "", description: "", technologies: "" }] }));
  const rmProj = (id) => setData((p) => ({ ...p, projects: p.projects.filter((e) => e.id !== id) }));
  const updProj = (id, f, v) => setData((p) => ({ ...p, projects: p.projects.map((e) => e.id === id ? { ...e, [f]: v } : e) }));

  const updSkill = (i, v) => setData((p) => ({ ...p, skills: p.skills.map((s, x) => x === i ? v : s) }));
  const addSkill = () => setData((p) => ({ ...p, skills: [...p.skills, ""] }));
  const rmSkill = (i) => setData((p) => ({ ...p, skills: p.skills.filter((_, x) => x !== i) }));

  return (
    <div className="px-5 pb-4">
      <div className="mt-4 mb-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Ces champs sont specifiques a chaque candidature. Utilisez le bouton <strong>"Auto-Fill Magique"</strong> en haut pour les remplir automatiquement depuis un JSON, ou editez-les manuellement.
        </p>
      </div>

      <Section title="Titre du CV" defaultOpen={true}>
        <Field label="Titre / Headline *" value={data.title} onChange={(e) => upd("title", e.target.value)} placeholder="Ex: AI Engineer Intern" />
      </Section>

      <Section title="Resume / Summary" defaultOpen={true}>
        <FieldArea label="Resume *" value={data.profile} onChange={(e) => upd("profile", e.target.value)} rows={4} placeholder="Votre resume professionnel adapte a cette offre..." />
      </Section>

      <Section title="Experiences" onAdd={addExp} defaultOpen={true}>
        {data.experience.length === 0 && (
          <p className="text-xs text-gray-400 italic mb-2">Aucune experience. Cliquez "+ Add" ou utilisez l'Auto-Fill.</p>
        )}
        {data.experience.map((exp) => (
          <EntryCard key={exp.id} onRemove={() => rmExp(exp.id)}>
            <Field label="Poste" value={exp.jobTitle} onChange={(e) => updExp(exp.id, "jobTitle", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Entreprise" value={exp.company} onChange={(e) => updExp(exp.id, "company", e.target.value)} />
              <Field label="Lieu" value={exp.location} onChange={(e) => updExp(exp.id, "location", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Debut (MM/YYYY)" value={exp.startDate} onChange={(e) => updExp(exp.id, "startDate", e.target.value)} placeholder="09/2025" />
              <Field label="Fin (MM/YYYY)" value={exp.endDate} onChange={(e) => updExp(exp.id, "endDate", e.target.value)} placeholder="Present" />
            </div>
            <FieldArea label="Description / Bullet points" value={exp.description} onChange={(e) => updExp(exp.id, "description", e.target.value)} rows={3} />
          </EntryCard>
        ))}
      </Section>

      <Section title="Projets" onAdd={addProj} defaultOpen={true}>
        {data.projects.length === 0 && (
          <p className="text-xs text-gray-400 italic mb-2">Aucun projet. Cliquez "+ Add" ou utilisez l'Auto-Fill.</p>
        )}
        {data.projects.map((p) => (
          <EntryCard key={p.id} onRemove={() => rmProj(p.id)}>
            <Field label="Nom du projet" value={p.name} onChange={(e) => updProj(p.id, "name", e.target.value)} />
            <Field label="Technologies" value={p.technologies} onChange={(e) => updProj(p.id, "technologies", e.target.value)} />
            <FieldArea label="Description" value={p.description} onChange={(e) => updProj(p.id, "description", e.target.value)} rows={2} />
          </EntryCard>
        ))}
      </Section>

      <Section title="Competences cles" onAdd={addSkill} defaultOpen={true}>
        {data.skills.length === 0 && (
          <p className="text-xs text-gray-400 italic mb-2">Aucune competence. Cliquez "+ Add" ou utilisez l'Auto-Fill.</p>
        )}
        {data.skills.map((sk, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1.5">
            <input value={sk} onChange={(e) => updSkill(i, e.target.value)}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white" />
            <button onClick={() => rmSkill(i)} className="text-red-400 hover:text-red-600 text-[10px] px-1">X</button>
          </div>
        ))}
      </Section>

      {/* Reset button */}
      <div className="mt-6 mb-4">
        <button
          onClick={() => setData({ ...emptyDynamicData })}
          className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-200 transition border border-gray-200"
        >
          Reinitialiser les champs dynamiques (nouvelle candidature)
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Onglet 3: Cover Letter Editor
   ═══════════════════════════════════════════════ */

function CoverLetterEditor({ data, setData }) {
  const upd = (key, val) => setData((p) => ({ ...p, [key]: val }));

  return (
    <div className="px-5 pb-4">
      <div className="mt-4 mb-2 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl">
        <p className="text-[11px] text-violet-800 leading-relaxed">
          Les informations de l'expediteur (nom, email, tel) sont recuperees automatiquement de votre <strong>Profil Permanent</strong>.
        </p>
      </div>

      <Section title="Destinataire" defaultOpen={true}>
        <Field label="Nom du destinataire" value={data.recipientName} onChange={(e) => upd("recipientName", e.target.value)} placeholder="M. / Mme ..." />
        <Field label="Entreprise" value={data.recipientCompany} onChange={(e) => upd("recipientCompany", e.target.value)} />
        <Field label="Adresse" value={data.recipientAddress} onChange={(e) => upd("recipientAddress", e.target.value)} />
      </Section>

      <Section title="En-tete" defaultOpen={true}>
        <Field label="Date" value={data.date} onChange={(e) => upd("date", e.target.value)} />
        <Field label="Objet" value={data.subject} onChange={(e) => upd("subject", e.target.value)} placeholder="Candidature - Stage ..." />
        <Field label="Formule d'appel" value={data.greeting} onChange={(e) => upd("greeting", e.target.value)} />
      </Section>

      <Section title="Corps de la lettre" defaultOpen={true}>
        <FieldArea
          label="Texte (separez les paragraphes par des sauts de ligne)"
          value={data.body}
          onChange={(e) => upd("body", e.target.value)}
          rows={12}
          placeholder="Redigez votre lettre ici ou utilisez l'Auto-Fill..."
        />
      </Section>

      <Section title="Cloture" defaultOpen={true}>
        <FieldArea label="Formule de politesse" value={data.closing} onChange={(e) => upd("closing", e.target.value)} rows={2} />
        <Field label="Signature (vide = nom du profil)" value={data.signature} onChange={(e) => upd("signature", e.target.value)} />
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APPLICATION COMPONENT
   ═══════════════════════════════════════════════ */

export default function ResumeBuilder() {
  const [permData, setPermData] = useState(emptyPermanentData);
  const [dynData, setDynData] = useState(emptyDynamicData);
  const [clData, setClData] = useState(emptyCoverLetter);
  const [jsonText, setJsonText] = useState("");
  const [aiStatus, setAiStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load permanentData from localStorage on mount
  useEffect(() => {
    const saved = loadPermanentData();
    if (saved) {
      setPermData(saved);
      setActiveTab("cv");
    } else {
      setIsFirstTime(true);
      setActiveTab("profile");
    }
  }, []);

  // Save handler
  const handleSavePermanent = () => {
    savePermanentData(permData);
    setSaveStatus({ ok: true, msg: "Profil sauvegarde dans le navigateur !" });
    setIsFirstTime(false);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Auto-fill from header JSON (fills dynamicData + coverLetter only)
  const handleAutoFill = () => {
    if (!jsonText.trim()) {
      setAiStatus({ ok: false, msg: "Collez un objet JSON d'abord." });
      return;
    }
    try {
      const parts = [];

      const mapped = mapJsonToDynamicData(jsonText);
      setDynData((prev) => {
        const m = { ...prev };
        if (mapped.title) m.title = mapped.title;
        if (mapped.profile) m.profile = mapped.profile;
        if (mapped.experience.length) m.experience = mapped.experience;
        if (mapped.skills.length) m.skills = mapped.skills;
        if (mapped.projects.length) m.projects = mapped.projects;
        return m;
      });

      if (mapped.title) parts.push("Titre");
      if (mapped.profile) parts.push("Resume");
      if (mapped.experience.length) parts.push(`${mapped.experience.length} experience(s)`);
      if (mapped.skills.length) parts.push(`${mapped.skills.length} competence(s)`);
      if (mapped.projects.length) parts.push(`${mapped.projects.length} projet(s)`);

      const clMapped = mapJsonToCoverLetter(jsonText);
      const hasClData = Object.values(clMapped).some((v) => v);
      if (hasClData) {
        setClData((prev) => {
          const updated = { ...prev };
          Object.entries(clMapped).forEach(([k, v]) => { if (v) updated[k] = v; });
          return updated;
        });
        parts.push("Lettre de motivation");
      }

      setAiStatus({
        ok: true,
        msg: parts.length
          ? `Applique : ${parts.join(", ")}. Modifiez les champs si besoin.`
          : "JSON parse sans erreur mais aucun champ reconnu.",
      });

      if (parts.length && activeTab === "profile") setActiveTab("cv");
    } catch (e) {
      setAiStatus({ ok: false, msg: `JSON invalide : ${e.message}` });
    }
  };

  // Build merged data for PDF rendering
  const cvForPdf = useMemo(() => buildCvForPdf(permData, dynData), [permData, dynData]);
  const clForPdf = useMemo(() => buildClForPdf(permData, clData), [permData, clData]);
  const missing = useMemo(() => getMissingFields(permData, dynData), [permData, dynData]);

  const showingCv = activeTab === "profile" || activeTab === "cv";
  const currentPdfDoc = showingCv ? <ResumePDF data={cvForPdf} /> : <CoverLetterPDF data={clForPdf} />;
  const downloadFileName = showingCv
    ? `${permData.firstName || "CV"}_${permData.lastName || ""}_CV.pdf`.replace(/\s+/g, "_")
    : `${permData.firstName || "Lettre"}_${permData.lastName || ""}_Lettre_Motivation.pdf`.replace(/\s+/g, "_");

  return (
    <div className="flex flex-col h-screen bg-slate-100">

      {/* ════════ HEADER: JSON zone + Auto-Fill ════════ */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700">
        <div className="px-5 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Internship Application Builder</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">CV + Lettre de motivation - Auto-Fill intelligent</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full font-medium">ATS-Ready</span>
            <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full font-medium">localStorage</span>
          </div>
        </div>

        <div className="px-5 pb-4">
          <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            Coller le JSON de l'Internships Assistant ici
          </label>
          <div className="flex gap-3">
            <textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setAiStatus(null); }}
              rows={3}
              spellCheck={false}
              placeholder={`{\n  "title": "AI Engineer Intern",\n  "summary": "...",\n  "experience": [...],\n  "skills": [...],\n  "coverLetter": { "body": "..." }\n}`}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-[11px] font-mono text-gray-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-vertical placeholder-gray-500"
            />
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={handleAutoFill}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 active:bg-red-800 transition shadow-lg shadow-red-900/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Fill Magique
              </button>
              <button
                onClick={() => { setJsonText(EXAMPLE_JSON); setAiStatus(null); }}
                className="px-4 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-[10px] hover:bg-gray-600 transition"
              >
                Charger un exemple
              </button>
            </div>
          </div>

          {aiStatus && (
            <div className={`mt-2 p-2.5 rounded-lg text-[11px] leading-relaxed ${
              aiStatus.ok
                ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700/50"
                : "bg-red-900/30 text-red-300 border border-red-700/50"
            }`}>
              {aiStatus.ok ? "OK " : "Erreur "}{aiStatus.msg}
            </div>
          )}
        </div>
      </div>

      {/* ════════ TAB NAVIGATION ════════ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 flex items-center gap-0">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === "profile"
              ? "text-gray-900 border-emerald-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-base">&#9881;</span> Profil Permanent
        </button>
        <button
          onClick={() => setActiveTab("cv")}
          className={`px-4 py-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === "cv"
              ? "text-gray-900 border-red-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-base">&#9998;</span> CV Dynamique
        </button>
        <button
          onClick={() => setActiveTab("cl")}
          className={`px-4 py-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === "cl"
              ? "text-gray-900 border-violet-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-base">&#9993;</span> Lettre de Motivation
        </button>

        <div className="flex-1" />

        <PDFDownloadLink
          document={currentPdfDoc}
          fileName={downloadFileName}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-xs hover:bg-gray-800 transition flex items-center gap-1.5"
        >
          {({ loading }) => (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {loading ? "..." : "Telecharger PDF"}
            </>
          )}
        </PDFDownloadLink>
      </div>

      {/* ════════ SPLIT SCREEN ════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left: Scrollable Form ── */}
        <div className="w-[480px] min-w-[420px] bg-white border-r border-gray-200 overflow-y-auto">
          {/* First-time welcome banner */}
          {isFirstTime && activeTab === "profile" && (
            <div className="mx-5 mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <p className="text-sm font-bold text-amber-900 mb-1">Bienvenue !</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Veuillez configurer votre profil de base ci-dessous (nom, email, formation...).
                Ces donnees seront sauvegardees dans votre navigateur et reutilisees pour toutes vos candidatures.
              </p>
            </div>
          )}

          {activeTab === "profile" && (
            <PermanentProfileEditor
              data={permData}
              setData={setPermData}
              onSave={handleSavePermanent}
              saveStatus={saveStatus}
            />
          )}
          {activeTab === "cv" && (
            <DynamicCVEditor data={dynData} setData={setDynData} />
          )}
          {activeTab === "cl" && (
            <CoverLetterEditor data={clData} setData={setClData} />
          )}
        </div>

        {/* ── Right: Alert + Live PDF Preview ── */}
        <div className="flex-1 flex flex-col bg-slate-200">
          {/* Preview header + Missing fields alert */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                {showingCv ? "Preview CV" : "Preview Lettre de Motivation"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">ATS-Friendly</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Selectionnable</span>
              </div>
            </div>
            {showingCv && <MissingFieldsAlert missing={missing} />}
          </div>

          {/* PDF Preview */}
          <div className="flex-1 p-3">
            <PDFPreview key={activeTab} document={currentPdfDoc} />
          </div>
        </div>
      </div>
    </div>
  );
}
