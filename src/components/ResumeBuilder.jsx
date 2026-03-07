import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ResumePDF from "./ResumePDF";
import CoverLetterPDF from "./CoverLetterPDF";
import RecommendationPDF from "./RecommendationPDF";
import {
  emptyPermanentData,
  emptyDynamicData,
  emptyCoverLetter,
  emptyRecommendationLetter,
  loadPermanentData,
  savePermanentData,
  buildCvForPdf,
  buildClForPdf,
  buildRecommendationForPdf,
  getMissingFields,
  DEFAULT_SECTION_ORDER,
  DEFAULT_CV_TEMPLATE,
} from "../initialData";
import {
  mapJsonToDynamicData,
  mapJsonToPermanentData,
  mapJsonToCoverLetter,
  EXAMPLE_JSON,
  EXAMPLE_PROFILE_JSON,
} from "../jsonMapper";
import AuthHeader from "./AuthHeader";
import HelpModal from "./HelpModal";
import { supabase } from "../lib/supabaseClient";

const EDUCATION_ONLY_EXAMPLE = `{
  "education": [
    {
      "degree": "",
      "school": "",
      "location": "",
      "start": "",
      "end": "",
      "description": ""
    }
  ]
}`;

const EXAMPLE_RECOMMENDATION_JSON = `{
  "recommenderName": "Dr. Jean Dupont",
  "recommenderTitle": "Professeur des Universités, Responsable du Master IA",
  "candidateName": "Marie Martin",
  "targetCompany": "TechCorp",
  "body": "Je suis ravi de recommander chaleureusement Marie Martin pour le poste au sein de votre entreprise.\\n\\nEn tant que responsable de son cursus, j'ai pu apprécier sa rigueur, sa curiosité et sa capacité à mener des projets en équipe.\\n\\nJe ne doute pas qu'elle saura s'intégrer avec succès dans votre structure."
}`;

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

function JsonFormatHint({ label, example }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
      >
        <span className="text-[11px]">{}{"{"}{"}"}</span>
        <span>Show JSON format example {label}</span>
      </button>
      {open && (
        <pre className="mt-1 max-h-52 overflow-auto text-[11px] leading-snug bg-slate-900 text-slate-100 border border-slate-700 rounded-md p-2 whitespace-pre">
{example}
        </pre>
      )}
    </div>
  );
}

function SortableSectionItem({ id }) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-2 px-2.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 ${
        isDragging ? "opacity-80 shadow-md z-10" : ""
      }`}
    >
      <button
        type="button"
        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label="Réordonner"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span>{t(`sections.${id}`) || id}</span>
    </div>
  );
}

function SectionOrderSortable({ sectionOrder, setSectionOrder }) {
  const order = Array.isArray(sectionOrder) && sectionOrder.length
    ? [...sectionOrder]
    : [...DEFAULT_SECTION_ORDER];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((prev) => {
        const list = Array.isArray(prev) && prev.length ? [...prev] : [...DEFAULT_SECTION_ORDER];
        const oldIndex = list.indexOf(active.id);
        const newIndex = list.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(list, oldIndex, newIndex);
      });
    }
  };
  const { t } = useTranslation();
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {t("sections.orderPdf")}
      </label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {order.map((id) => (
              <SortableSectionItem key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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
  const { t } = useTranslation();
  if (!missing.length) {
    return (
      <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-emerald-700 text-xs font-medium">{t("missingFields.allDone")}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-red-700 text-xs font-bold">{t("missingFields.label")}</span>
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
  const { t } = useTranslation();
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
    if (!importJson.trim()) { setImportStatus({ ok: false, msg: t("boxes.profileImportError") }); return; }
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
      setImportStatus({ ok: true, msg: t("boxes.profileImportSuccess") });
    } catch (e) {
      setImportStatus({ ok: false, msg: t("boxes.profileImportInvalid", { error: e.message }) });
    }
  };

  return (
    <div className="px-5 pb-4">
      {/* JSON Import zone */}
      <div className="mt-4 mb-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2">
          {t("boxes.profileJsonTitle")}
        </label>
        <textarea
          value={importJson}
          onChange={(e) => { setImportJson(e.target.value); setImportStatus(null); }}
          rows={4}
          spellCheck={false}
          placeholder={t("boxes.profileJsonPlaceholder")}
          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-[11px] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-vertical"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleImportJson}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-xs hover:bg-blue-700 transition"
          >
            {t("boxes.profileImportBtn")}
          </button>
          <button
            onClick={() => { setImportJson(EXAMPLE_PROFILE_JSON); setImportStatus(null); }}
            className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-[10px] hover:bg-blue-200 transition font-medium"
          >
            {t("boxes.profileExample")}
          </button>
        </div>
        <JsonFormatHint label="(profil complet)" example={EXAMPLE_PROFILE_JSON} />
        <JsonFormatHint label="(education uniquement)" example={EDUCATION_ONLY_EXAMPLE} />
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
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Forme de la photo
            </label>
            <select
              value={data.photoShape || "circle"}
              onChange={(e) => upd("photoShape", e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
            >
              <option value="circle">Ronde</option>
              <option value="square">Carrée</option>
              <option value="rounded">Rectangle arrondi</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Taille de la photo
            </label>
            <input
              type="range"
              min={48}
              max={120}
              step={4}
              value={data.photoSize || 72}
              onChange={(e) => upd("photoSize", Number(e.target.value))}
              className="w-full"
            />
            <div className="text-[10px] text-gray-500 mt-0.5">
              {data.photoSize || 72} px
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Prenom *" value={data.firstName} onChange={(e) => upd("firstName", e.target.value)} />
          <Field label="Nom *" value={data.lastName} onChange={(e) => upd("lastName", e.target.value)} />
        </div>
        <JsonFormatHint
          label="(firstName / lastName)"
          example={`{
  "firstName": "",
  "lastName": ""
}`}
        />
      </Section>

      {/* Contact */}
      <Section title="Contact" defaultOpen={true}>
        <Field label="Email *" type="email" value={data.email} onChange={(e) => upd("email", e.target.value)} />
        <Field label="Telephone *" value={data.phone} onChange={(e) => upd("phone", e.target.value)} />
        <Field label="Lieu" value={data.location} onChange={(e) => upd("location", e.target.value)} />
        <Field label="LinkedIn" value={data.linkedin} onChange={(e) => upd("linkedin", e.target.value)} />
        <Field label="Portfolio / GitHub" value={data.portfolio} onChange={(e) => upd("portfolio", e.target.value)} />
        <JsonFormatHint
          label="(contact)"
          example={`{
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "portfolio": ""
}`}
        />
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
        <JsonFormatHint label="(education)" example={EDUCATION_ONLY_EXAMPLE} />
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
        <JsonFormatHint
          label="(languages)"
          example={`{
  "languages": [
    { "language": "", "level": "" }
  ]
}`}
        />
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
        <JsonFormatHint
          label="(certificates)"
          example={`{
  "certificates": []
}`}
        />
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
          {t("actions.saveBrowser")}
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

function DynamicCVEditor({ data, setData, fileNameBase, setFileNameBase, sectionOrder, setSectionOrder, selectedTemplate, setSelectedTemplate }) {
  const { t } = useTranslation();
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
          {t("boxes.cvIntro")}
        </p>
      </div>

      <Section title={t("sections.template")} defaultOpen={true}>
        <div className="mb-2.5" data-tour="template-selector">
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t("sections.template")}</label>
          <select
            value={selectedTemplate || "flowcv"}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
          >
            <option value="flowcv">{t("template.flowcv")}</option>
            <option value="classic">{t("template.classic")}</option>
            <option value="modern">{t("template.modern")}</option>
            <option value="minimal">{t("template.minimal")}</option>
            <option value="executive">{t("template.executive")}</option>
            <option value="stanford">{t("template.stanford")}</option>
          </select>
        </div>
      </Section>

      <Section title={t("sections.orderPdf")} defaultOpen={true}>
        <SectionOrderSortable sectionOrder={sectionOrder} setSectionOrder={setSectionOrder} />
      </Section>

      <Section title="Titre du CV" defaultOpen={true}>
        <Field label="Titre / Headline *" value={data.title} onChange={(e) => upd("title", e.target.value)} placeholder="Ex: AI Engineer Intern" />
        <JsonFormatHint
          label="(title)"
          example={`{
  "title": ""
}`}
        />
      </Section>

      <Section title="Resume / Summary" defaultOpen={true}>
        <FieldArea label="Resume *" value={data.profile} onChange={(e) => upd("profile", e.target.value)} rows={4} placeholder="Votre resume professionnel adapte a cette offre..." />
        <JsonFormatHint
          label="(summary)"
          example={`{
  "summary": ""
}`}
        />
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
        <JsonFormatHint
          label="(experience)"
          example={`{
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "start": "",
      "end": "",
      "description": ""
    }
  ]
}`}
        />
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
        <JsonFormatHint
          label="(projects)"
          example={`{
  "projects": [
    {
      "name": "",
      "technologies": "",
      "description": ""
    }
  ]
}`}
        />
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
        <JsonFormatHint
          label="(skills)"
          example={`{
  "skills": []
}`}
        />
      </Section>

      <Section title="Nom du fichier CV" defaultOpen={true}>
        <Field
          label='Nom du fichier (sans ".pdf")'
          value={fileNameBase}
          onChange={(e) => setFileNameBase(e.target.value)}
          placeholder="NOM-PRENOM-CV"
        />
        <p className="text-[10px] text-gray-400">
          Ce nom sera utilise lors du telechargement du PDF du CV.
        </p>
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

function CoverLetterEditor({ data, setData, fileNameBase, setFileNameBase }) {
  const { t } = useTranslation();
  const upd = (key, val) => setData((p) => ({ ...p, [key]: val }));

  return (
    <div className="px-5 pb-4">
      <div className="mt-4 mb-2 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl">
        <p className="text-[11px] text-violet-800 leading-relaxed">
          {t("boxes.coverLetterIntro")}
        </p>
      </div>

      <JsonFormatHint
        label="(coverLetter complet)"
        example={`{
  "coverLetter": {
    "recipientName": "",
    "recipientCompany": "",
    "recipientAddress": "",
    "date": "",
    "subject": "",
    "greeting": "",
    "body": "",
    "closing": "",
    "signature": ""
  }
}`}
      />

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

      <Section title="Nom du fichier Lettre" defaultOpen={true}>
        <Field
          label='Nom du fichier (sans ".pdf")'
          value={fileNameBase}
          onChange={(e) => setFileNameBase(e.target.value)}
          placeholder="NOM-PRENOM-MOTIVATION-LETTER"
        />
        <p className="text-[10px] text-gray-400">
          Ce nom sera utilise lors du telechargement du PDF de la lettre de motivation.
        </p>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Onglet 4: Recommendation Letter Editor
   ═══════════════════════════════════════════════ */

function RecommendationEditor({ data, setData, fileNameBase, setFileNameBase }) {
  const { t } = useTranslation();
  const upd = (key, val) => setData((p) => ({ ...p, [key]: val }));

  return (
    <div className="px-5 pb-4">
      <div className="mt-4 mb-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl">
        <p className="text-[11px] text-teal-800 leading-relaxed">
          {t("boxes.recommendationIntro")}
        </p>
      </div>

      <div className="mt-2 mb-3 p-3 bg-teal-50/80 border border-teal-200 rounded-lg">
        <label className="block text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1.5">
          {t("boxes.recommendationJsonLabel")}
        </label>
        <JsonFormatHint label={t("boxes.recommendationJsonHint")} example={EXAMPLE_RECOMMENDATION_JSON} />
        <button
          type="button"
          onClick={() => {
            try {
              const parsed = JSON.parse(EXAMPLE_RECOMMENDATION_JSON);
              setData((prev) => ({ ...prev, ...parsed }));
            } catch (_) {}
          }}
          className="mt-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[10px] font-medium hover:bg-teal-700 transition"
        >
          {t("boxes.profileExample")}
        </button>
      </div>

      <Section title="Recommandeur" defaultOpen={true}>
        <Field
          label="Nom du recommandeur"
          value={data.recommenderName}
          onChange={(e) => upd("recommenderName", e.target.value)}
          placeholder="Dr. Jean Dupont"
        />
        <Field
          label="Titre du recommandeur"
          value={data.recommenderTitle}
          onChange={(e) => upd("recommenderTitle", e.target.value)}
          placeholder="Professeur, Responsable RH..."
        />
      </Section>

      <Section title="Candidat et entreprise cible" defaultOpen={true}>
        <Field
          label="Nom du candidat"
          value={data.candidateName}
          onChange={(e) => upd("candidateName", e.target.value)}
          placeholder="Vide = nom du profil permanent"
        />
        <Field
          label="Entreprise cible"
          value={data.targetCompany}
          onChange={(e) => upd("targetCompany", e.target.value)}
          placeholder="Entreprise pour laquelle la lettre est destinee"
        />
      </Section>

      <Section title="Corps de la lettre" defaultOpen={true}>
        <FieldArea
          label="Texte (paragraphes separes par des sauts de ligne)"
          value={data.body}
          onChange={(e) => upd("body", e.target.value)}
          rows={12}
          placeholder="Redigez la lettre de recommandation..."
        />
      </Section>

      <Section title="Nom du fichier" defaultOpen={true}>
        <Field
          label='Nom du fichier (sans ".pdf")'
          value={fileNameBase}
          onChange={(e) => setFileNameBase(e.target.value)}
          placeholder="Prenom_Nom_Lettre_Recommandation"
        />
        <p className="text-[10px] text-gray-400">
          Utilise pour le telechargement du PDF.
        </p>
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
  const [recData, setRecData] = useState(emptyRecommendationLetter);
  const [cvFileBase, setCvFileBase] = useState("");
  const [clFileBase, setClFileBase] = useState("");
  const [recFileBase, setRecFileBase] = useState("");
  const [sectionOrder, setSectionOrder] = useState([...DEFAULT_SECTION_ORDER]);
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_CV_TEMPLATE);
  const [aiOptions, setAiOptions] = useState({ targetLanguage: "fr", length: "concis" });
  const [jsonText, setJsonText] = useState("");
  const [aiStatus, setAiStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [mobilePreviewActive, setMobilePreviewActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cloudStatus, setCloudStatus] = useState(null); // { ok: boolean, msg: string }
  const [cloudLoading, setCloudLoading] = useState(false);
  const profileFileInputRef = useRef(null);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Apply document loaded from Account (Éditer)
  useEffect(() => {
    const state = location.state;
    if (!state?.loadCv && !state?.loadRecommendation) return;
    if (state.loadCv?.dynamic) {
      setDynData((prev) => ({ ...emptyDynamicData, ...prev, ...state.loadCv.dynamic }));
      if (state.loadCv.sectionOrder?.length) setSectionOrder(state.loadCv.sectionOrder);
      if (state.loadCv.selectedTemplate) setSelectedTemplate(state.loadCv.selectedTemplate);
      if (state.loadCv.cvFileBase != null) setCvFileBase(state.loadCv.cvFileBase);
      setActiveTab("cv");
    }
    if (state.loadRecommendation?.recommendation) {
      setRecData((prev) => ({ ...emptyRecommendationLetter, ...prev, ...state.loadRecommendation.recommendation }));
      if (state.loadRecommendation.recFileBase != null) setRecFileBase(state.loadRecommendation.recFileBase);
      setActiveTab("recommendation");
    }
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  // Sync auth state for Cloud save/load visibility
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

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

  // Auto-fill from header JSON (remplit CV dynamique + lettre + éventuellement profil permanent)
  const handleAutoFill = () => {
    if (!jsonText.trim()) {
      setAiStatus({ ok: false, msg: "Collez un objet JSON d'abord." });
      return;
    }
    try {
      const parts = [];

      // 1) CV dynamique
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

      // 2) Lettre de motivation
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

      // 3) Profil permanent (optionnel, si le JSON contient aussi ces infos)
      const permMapped = mapJsonToPermanentData(jsonText);
      const hasPermData = Object.entries(permMapped).some(([_, v]) => {
        if (v == null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim().length > 0;
        return false;
      });
      if (hasPermData) {
        setPermData((prev) => {
          const updated = { ...prev };
          Object.entries(permMapped).forEach(([k, v]) => {
            if (v == null) return;
            if (Array.isArray(v) && v.length) updated[k] = v;
            else if (typeof v === "string" && v) updated[k] = v;
          });
          return updated;
        });
        parts.unshift("Profil permanent");
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
  const recForPdf = useMemo(() => buildRecommendationForPdf(permData, recData), [permData, recData]);
  const missing = useMemo(() => getMissingFields(permData, dynData), [permData, dynData]);

  const showingCv = activeTab === "profile" || activeTab === "cv";
  const showingRec = activeTab === "recommendation";
  const currentPdfDoc = showingCv
    ? <ResumePDF data={cvForPdf} sectionOrder={sectionOrder} template={selectedTemplate} />
    : showingRec
    ? <RecommendationPDF data={recForPdf} />
    : <CoverLetterPDF data={clForPdf} />;
  const firstName = (permData.firstName || "").trim();
  const lastName = (permData.lastName || "").trim();
  const company = (clData.recipientCompany || "").trim();
  const baseParts = [firstName, lastName];
  if (company && !showingRec) baseParts.push(company);
  const patternBase = baseParts.filter(Boolean).join("_");

  const rawBase = showingCv ? cvFileBase : showingRec ? recFileBase : clFileBase;
  const suffix = showingCv ? "CV" : showingRec ? "Lettre_Recommandation" : "Lettre_de_motivation";
  const computedBase = patternBase ? `${patternBase}_${suffix}` : suffix;
  const finalBase = rawBase && rawBase.trim() ? rawBase.trim() : computedBase;
  const safeBase = finalBase.replace(/\s+/g, "_");
  const downloadFileName = `${safeBase}.pdf`;

  const handleExportProfile = () => {
    try {
      const payload = {
        permanent: permData,
        dynamic: dynData,
        coverLetter: clData,
        recommendation: recData,
        sectionOrder: sectionOrder,
        selectedTemplate: selectedTemplate,
        aiOptions: aiOptions,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const nameParts = [firstName, lastName].filter(Boolean).join("_") || "profil";
      const fileName = `${nameParts.replace(/\s+/g, "_")}_profil.json`;
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export profil JSON echoue", e);
    }
  };

  const handleImportProfileFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.permanent) {
          setPermData({ ...emptyPermanentData, ...parsed.permanent });
        }
        if (parsed.dynamic) {
          setDynData({ ...emptyDynamicData, ...parsed.dynamic });
        }
        if (parsed.coverLetter) {
          setClData({ ...emptyCoverLetter, ...parsed.coverLetter });
        }
        if (parsed.recommendation) {
          setRecData({ ...emptyRecommendationLetter, ...parsed.recommendation });
        }
        if (Array.isArray(parsed.sectionOrder) && parsed.sectionOrder.length) {
          setSectionOrder(parsed.sectionOrder);
        }
        if (parsed.selectedTemplate) {
          setSelectedTemplate(parsed.selectedTemplate);
        }
        if (parsed.aiOptions) {
          setAiOptions((prev) => ({ ...prev, ...parsed.aiOptions }));
        }
      } catch (err) {
        console.error("Import profil JSON echoue", err);
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setCloudLoading(true);
    setCloudStatus(null);
    try {
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("profile_data")
        .eq("user_id", user.id)
        .maybeSingle();
      const prev = existing?.profile_data || {};
      const cvList = Array.isArray(prev.cv_list) ? prev.cv_list : [];
      const recList = Array.isArray(prev.recommendation_list) ? prev.recommendation_list : [];
      const now = new Date().toISOString();
      const profile_data = {
        permanent: permData,
        dynamic: dynData,
        coverLetter: clData,
        recommendation: recData,
        sectionOrder: sectionOrder,
        selectedTemplate: selectedTemplate,
        aiOptions: aiOptions,
        cvFileBase,
        clFileBase,
        recFileBase,
        cv_list: [
          ...cvList,
          {
            id: crypto.randomUUID(),
            title: dynData.title || cvFileBase || "CV",
            updatedAt: now,
            data: { dynamic: dynData, sectionOrder, selectedTemplate, cvFileBase },
          },
        ],
        recommendation_list: [
          ...recList,
          {
            id: crypto.randomUUID(),
            title: recData.candidateName || recFileBase || "Lettre",
            updatedAt: now,
            data: { recommendation: recData, recFileBase },
          },
        ],
      };
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          { user_id: user.id, profile_data },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      setCloudStatus({ ok: true, msg: "Profil sauvegardé dans le cloud." });
      setTimeout(() => setCloudStatus(null), 4000);
    } catch (err) {
      setCloudStatus({ ok: false, msg: err?.message || "Erreur lors de la sauvegarde cloud." });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!user) return;
    setCloudLoading(true);
    setCloudStatus(null);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("profile_data")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      if (!data?.profile_data) {
        setCloudStatus({ ok: false, msg: "Aucun profil trouvé dans le cloud." });
        return;
      }
      const p = data.profile_data;
      if (p.permanent) setPermData({ ...emptyPermanentData, ...p.permanent });
      if (p.dynamic) setDynData({ ...emptyDynamicData, ...p.dynamic });
      if (p.coverLetter) setClData({ ...emptyCoverLetter, ...p.coverLetter });
      if (p.recommendation) setRecData({ ...emptyRecommendationLetter, ...p.recommendation });
      if (Array.isArray(p.sectionOrder) && p.sectionOrder.length) setSectionOrder(p.sectionOrder);
      if (p.selectedTemplate) setSelectedTemplate(p.selectedTemplate);
      if (p.aiOptions) setAiOptions((prev) => ({ ...prev, ...p.aiOptions }));
      if (p.cvFileBase != null) setCvFileBase(p.cvFileBase);
      if (p.clFileBase != null) setClFileBase(p.clFileBase);
      if (p.recFileBase != null) setRecFileBase(p.recFileBase);
      setCloudStatus({ ok: true, msg: "Profil chargé depuis le cloud." });
      setTimeout(() => setCloudStatus(null), 4000);
    } catch (err) {
      setCloudStatus({ ok: false, msg: err?.message || "Erreur lors du chargement cloud." });
    } finally {
      setCloudLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}

      {/* ════════ HEADER: JSON zone + Auto-Fill ════════ */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700 relative z-[30]">
        <div className="px-3 md:px-5 py-2 md:py-3 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm md:text-lg font-bold text-white tracking-tight truncate">{t("app.title")}</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 hidden md:block">{t("app.subtitle")}</p>
          </div>
          {/* Desktop: full toolbar */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <AuthHeader />
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              className="text-[10px] bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 rounded px-2 py-1 transition flex items-center gap-1"
              title={t("actions.help")}
            >
              <span aria-hidden>❓</span>
              {t("actions.help")}
            </button>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="text-[10px] bg-gray-800 text-gray-200 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
              aria-label="Langue"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
            <span className="text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full font-medium">{t("app.atsReady")}</span>
            <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full font-medium">{t("app.localStorage")}</span>
          </div>
          {/* Mobile: hamburger + Help only */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition"
              aria-label={t("mobile.menu")}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setIsHelpModalOpen(true); }}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition shrink-0"
              title={t("actions.help")}
              aria-label={t("actions.help")}
            >
              <span className="text-lg" aria-hidden>❓</span>
            </button>
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-gray-800 border-b border-gray-700 shadow-xl z-[40] px-3 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase">Langue</span>
              <select
                value={i18n.language}
                onChange={(e) => { i18n.changeLanguage(e.target.value); setMobileMenuOpen(false); }}
                className="text-[11px] bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            </div>
            <AuthHeader />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">{t("app.atsReady")}</span>
              <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">{t("app.localStorage")}</span>
            </div>
          </div>
        )}

        {/* AI Options */}
        <div className="px-3 md:px-5 pt-2 pb-1 flex flex-wrap items-center gap-3 md:gap-4">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t("aiOptions.title")}</span>
          <label className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">{t("aiOptions.targetLanguage")}</span>
            <select
              value={aiOptions.targetLanguage}
              onChange={(e) => setAiOptions((p) => ({ ...p, targetLanguage: e.target.value }))}
              className="text-[10px] bg-gray-800 text-gray-200 border border-gray-600 rounded px-2 py-0.5"
            >
              <option value="fr">{t("aiOptions.targetLanguageFr")}</option>
              <option value="en">{t("aiOptions.targetLanguageEn")}</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">{t("aiOptions.length")}</span>
            <select
              value={aiOptions.length}
              onChange={(e) => setAiOptions((p) => ({ ...p, length: e.target.value }))}
              className="text-[10px] bg-gray-800 text-gray-200 border border-gray-600 rounded px-2 py-0.5"
            >
              <option value="concis">{t("aiOptions.lengthShort")}</option>
              <option value="detail">{t("aiOptions.lengthDetailed")}</option>
            </select>
          </label>
        </div>

        <div className="px-3 md:px-5 pb-4">
          <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            {t("jsonZone.label")}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              data-tour="json-zone"
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
                {t("jsonZone.autoFill")}
              </button>
              <button
                onClick={() => { setJsonText(EXAMPLE_JSON); setAiStatus(null); }}
                className="px-4 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-[10px] hover:bg-gray-600 transition"
              >
                {t("jsonZone.loadExample")}
              </button>
            </div>
          </div>

          <JsonFormatHint label="(CV dynamique + lettre)" example={EXAMPLE_JSON} />

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
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-2 md:px-5 flex items-center gap-0 overflow-x-auto min-h-0">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold transition border-b-2 flex items-center gap-1 shrink-0 ${
            activeTab === "profile"
              ? "text-gray-900 border-emerald-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-sm md:text-base">&#9881;</span>
          <span className="hidden sm:inline">{t("tabs.profile")}</span>
        </button>
        <button
          onClick={() => setActiveTab("cv")}
          className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold transition border-b-2 flex items-center gap-1 shrink-0 ${
            activeTab === "cv"
              ? "text-gray-900 border-red-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-sm md:text-base">&#9998;</span>
          <span className="hidden sm:inline">{t("tabs.cv")}</span>
        </button>
        <button
          onClick={() => setActiveTab("cl")}
          className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold transition border-b-2 flex items-center gap-1 shrink-0 ${
            activeTab === "cl"
              ? "text-gray-900 border-violet-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-sm md:text-base">&#9993;</span>
          <span className="hidden sm:inline">{t("tabs.coverLetter")}</span>
        </button>
        <button
          onClick={() => setActiveTab("recommendation")}
          className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-semibold transition border-b-2 flex items-center gap-1 shrink-0 ${
            activeTab === "recommendation"
              ? "text-gray-900 border-teal-600"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="text-sm md:text-base">&#128209;</span>
          <span className="hidden sm:inline">{t("tabs.recommendation")}</span>
        </button>

        <div className="flex-1 min-w-2" />

        {/* Bouton principal : téléchargement PDF */}
        <div data-tour="pdf-download" className="ml-1 md:ml-2 shrink-0">
          <PDFDownloadLink
            document={currentPdfDoc}
            fileName={downloadFileName}
            className="px-3 md:px-5 py-2 md:py-2.5 bg-gray-900 text-white rounded-lg font-semibold text-xs md:text-sm hover:bg-gray-800 transition flex items-center gap-1.5 md:gap-2 shadow-md ring-2 ring-gray-700 ring-offset-1"
          >
            {({ loading }) => (
              <>
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">{loading ? "..." : t("actions.downloadPdf")}</span>
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Mobile: toggle Édition / Aperçu (only < md) */}
      <div className="md:hidden flex-shrink-0 flex border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setMobilePreviewActive(false)}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
            !mobilePreviewActive ? "bg-gray-100 text-gray-900 border-b-2 border-gray-900" : "text-gray-500"
          }`}
        >
          📝 {t("mobile.edition")}
        </button>
        <button
          type="button"
          onClick={() => setMobilePreviewActive(true)}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
            mobilePreviewActive ? "bg-gray-100 text-gray-900 border-b-2 border-gray-900" : "text-gray-500"
          }`}
        >
          👁️ {t("mobile.preview")}
        </button>
      </div>

      {/* ════════ SPLIT SCREEN (md+: side by side) / MOBILE: single pane ════════ */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">

        {/* ── Left: Scrollable Form (hidden on mobile when preview active) ── */}
        <div
          className={`bg-white border-r border-gray-200 overflow-y-auto flex flex-col ${
            /* md+: fixed width; mobile: full width when edition */
            "md:w-[480px] md:min-w-[420px]"
          } ${mobilePreviewActive ? "hidden md:flex" : "flex w-full md:w-[480px] md:min-w-[420px]"}`}
          data-tour="form-column"
        >
          {/* Zone Sauvegarde : Local (toujours) + Cloud (si connecté) */}
          <div className="px-5 pt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mr-1">Sauvegarde locale</span>
              <button
                type="button"
                onClick={handleExportProfile}
                className="px-2.5 py-1 text-[10px] bg-gray-100 text-gray-600 rounded-md border border-gray-200 hover:bg-gray-200 transition flex items-center gap-1"
              >
                📥 {t("actions.exportProfile")}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => profileFileInputRef.current && profileFileInputRef.current.click()}
                  className="px-2.5 py-1 text-[10px] bg-gray-100 text-gray-600 rounded-md border border-gray-200 hover:bg-gray-200 transition flex items-center gap-1"
                >
                  📤 {t("actions.importProfile")}
                </button>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportProfileFile}
                />
              </div>
            </div>
            {user && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mr-1">Sauvegarde cloud</span>
                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={cloudLoading}
                  className="px-2.5 py-1 text-[10px] bg-sky-100 text-sky-700 rounded-md border border-sky-200 hover:bg-sky-200 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ☁️ {cloudLoading ? "..." : "Sauvegarder (Cloud)"}
                </button>
                <button
                  type="button"
                  onClick={handleLoadFromCloud}
                  disabled={cloudLoading}
                  className="px-2.5 py-1 text-[10px] bg-sky-100 text-sky-700 rounded-md border border-sky-200 hover:bg-sky-200 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ☁️ {cloudLoading ? "..." : "Charger (Cloud)"}
                </button>
              </div>
            )}
            {cloudStatus && (
              <div
                className={`p-2 rounded-md text-[11px] ${
                  cloudStatus.ok
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {cloudStatus.msg}
              </div>
            )}
          </div>
          {/* First-time welcome banner */}
          {isFirstTime && activeTab === "profile" && (
            <div className="mx-5 mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <p className="text-sm font-bold text-amber-900 mb-1">{t("boxes.welcomeTitle")}</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                {t("boxes.welcomeText")}
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
            <DynamicCVEditor
              data={dynData}
              setData={setDynData}
              fileNameBase={cvFileBase}
              setFileNameBase={setCvFileBase}
              sectionOrder={sectionOrder}
              setSectionOrder={setSectionOrder}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />
          )}
          {activeTab === "cl" && (
            <CoverLetterEditor
              data={clData}
              setData={setClData}
              fileNameBase={clFileBase}
              setFileNameBase={setClFileBase}
            />
          )}
          {activeTab === "recommendation" && (
            <RecommendationEditor
              data={recData}
              setData={setRecData}
              fileNameBase={recFileBase}
              setFileNameBase={setRecFileBase}
            />
          )}
        </div>

        {/* ── Right: Alert + Live PDF Preview (hidden on mobile when edition active) ── */}
        <div
          className={`flex-1 flex flex-col bg-slate-200 min-w-0 w-full ${
            mobilePreviewActive ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Preview header + Missing fields alert */}
          <div className="flex-shrink-0 px-3 md:px-4 py-2 md:py-3 bg-white border-b border-gray-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                {showingCv ? t("preview.cv") : showingRec ? t("preview.recommendation") : t("preview.coverLetter")}
              </h2>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">{t("preview.atsFriendly")}</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium hidden sm:inline">{t("preview.selectable")}</span>
              </div>
            </div>
            {showingCv && <MissingFieldsAlert missing={missing} />}
          </div>

          {/* PDF Preview: w-full to avoid overflow on mobile */}
          <div className="flex-1 p-2 md:p-3 min-h-0 min-w-0 w-full overflow-hidden">
            <PDFPreview key={activeTab} document={currentPdfDoc} />
          </div>
        </div>
      </div>
    </div>
  );
}
