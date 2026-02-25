/**
 * Robust JSON mappers for:
 * - Dynamic CV data (title, summary, experience, skills, projects)
 * - Permanent profile data (name, contact, education, languages, certs)
 * - Cover letter data
 *
 * Handles camelCase, snake_case, French keys, etc.
 */

function pick(obj, ...keys) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of keys) {
    const lower = k.toLowerCase();
    for (const [objKey, val] of Object.entries(obj)) {
      if (objKey.toLowerCase() === lower) return val;
    }
  }
  return undefined;
}

function pickStr(obj, ...keys) {
  const v = pick(obj, ...keys);
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return v.join(", ");
  return "";
}

function pickArr(obj, ...keys) {
  const v = pick(obj, ...keys);
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function normalizeDate(d) {
  if (!d) return "";
  const s = String(d).trim();
  const iso = s.match(/^(\d{4})-(\d{2})/);
  if (iso) return `${iso[2]}/${iso[1]}`;
  const slashed = s.match(/^(\d{2})\/(\d{4})$/);
  if (slashed) return s;
  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return `01/${yearOnly[1]}`;
  return s;
}

function mapExperience(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => ({
    id: Date.now() + i,
    jobTitle: pickStr(item,
      "jobTitle", "job_title", "title", "position", "poste", "titre",
      "role", "intitule", "intitulé"
    ),
    company: pickStr(item,
      "company", "entreprise", "organization", "organisation", "employer",
      "société", "societe", "compagnie"
    ),
    location: pickStr(item,
      "location", "lieu", "ville", "city", "localisation", "place"
    ),
    startDate: normalizeDate(
      pick(item, "startDate", "start_date", "start", "début", "debut",
        "date_debut", "dateDebut", "from")
    ),
    endDate: normalizeDate(
      pick(item, "endDate", "end_date", "end", "fin", "date_fin",
        "dateFin", "to")
    ) || pickStr(item, "endDate", "end_date", "end", "fin") || "",
    description: pickStr(item,
      "description", "details", "détails", "summary", "résumé", "resume",
      "responsibilities", "responsabilités", "missions", "tasks", "tâches", "taches"
    ),
  }));
}

function mapEducation(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => ({
    id: Date.now() + 1000 + i,
    degree: pickStr(item,
      "degree", "diplôme", "diplome", "diploma", "titre", "title",
      "formation", "filière", "filiere", "program"
    ),
    school: pickStr(item,
      "school", "école", "ecole", "university", "université", "universite",
      "institution", "établissement", "etablissement"
    ),
    location: pickStr(item, "location", "lieu", "ville", "city"),
    startDate: normalizeDate(
      pick(item, "startDate", "start_date", "start", "début", "debut", "from")
    ),
    endDate: normalizeDate(
      pick(item, "endDate", "end_date", "end", "fin", "to")
    ) || "",
    description: pickStr(item,
      "description", "details", "détails", "courses", "coursework",
      "matières", "matieres", "specialization", "spécialisation"
    ),
  }));
}

function mapProjects(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => ({
    id: Date.now() + 2000 + i,
    name: pickStr(item, "name", "nom", "title", "titre", "project", "projet"),
    description: pickStr(item,
      "description", "details", "détails", "summary", "résumé"
    ),
    technologies: pickStr(item,
      "technologies", "tech", "stack", "tools", "outils", "techStack",
      "tech_stack", "technos"
    ),
  }));
}

function mapLanguages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      const parts = item.split(/[-–:()]/);
      return { language: parts[0]?.trim() || item, level: parts[1]?.trim() || "" };
    }
    return {
      language: pickStr(item, "language", "langue", "name", "nom", "lang"),
      level: pickStr(item, "level", "niveau", "proficiency", "competence", "compétence"),
    };
  });
}

function mapSkills(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === "string") return [item.trim()];
      if (typeof item === "object" && item !== null) {
        const name = pickStr(item, "name", "nom", "skill", "compétence", "competence");
        const items = pickArr(item, "items", "list", "liste", "skills");
        if (items.length) return items.map((s) => typeof s === "string" ? s.trim() : "");
        return name ? [name] : [];
      }
      return [];
    }).filter(Boolean);
  }
  if (typeof raw === "object") {
    return Object.entries(raw).flatMap(([cat, items]) => {
      if (Array.isArray(items)) return items.map((s) => `${cat}: ${s}`);
      if (typeof items === "string") return [`${cat}: ${items}`];
      return [];
    });
  }
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapCertificates(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return item.trim();
    return pickStr(item, "name", "nom", "title", "titre", "certificate", "certificat", "certification");
  }).filter(Boolean);
}

function resolveRoot(json) {
  const root = typeof json === "string" ? JSON.parse(json) : json;
  return root.data || root.resume || root.cv || root.profile || root;
}

/**
 * Maps JSON to DYNAMIC CV fields only (title, summary, experience, skills, projects).
 * Does NOT touch permanent data.
 */
export function mapJsonToDynamicData(json) {
  const data = resolveRoot(json);
  const personalInfo = pick(data, "personalInfo", "personal_info", "personal", "info") || {};

  return {
    title: pickStr(personalInfo, "title", "titre", "headline", "poste", "position", "jobTitle", "role")
      || pickStr(data, "title", "titre", "headline", "poste"),
    profile: pickStr(data, "profile", "profil", "summary", "résumé", "resume",
      "about", "à_propos", "a_propos", "bio", "objective", "objectif",
      "profileSummary", "profile_summary"),
    experience: mapExperience(
      pickArr(data, "experience", "experiences", "expériences",
        "work", "workExperience", "work_experience", "emplois", "jobs", "positions")
    ),
    skills: mapSkills(
      pick(data, "skills", "compétences", "competences",
        "technicalSkills", "technical_skills", "competences_techniques",
        "abilities", "aptitudes")
    ),
    projects: mapProjects(
      pickArr(data, "projects", "projets", "portfolio",
        "personalProjects", "personal_projects")
    ),
  };
}

/**
 * Maps JSON to PERMANENT profile fields (name, contact, education, languages, certs).
 */
export function mapJsonToPermanentData(json) {
  const data = resolveRoot(json);
  const personalInfo = pick(data, "personalInfo", "personal_info", "personal", "info", "informations") || {};
  const contactRaw = pick(data, "contact", "contacts", "coordonnées", "coordonnees", "contactInfo") || personalInfo;

  const firstName = pickStr(personalInfo, "firstName", "first_name", "prénom", "prenom", "givenName")
    || pickStr(data, "firstName", "first_name", "prénom", "prenom");
  const lastName = pickStr(personalInfo, "lastName", "last_name", "nom", "familyName", "surname")
    || pickStr(data, "lastName", "last_name", "nom_famille");
  const fullName = pickStr(personalInfo, "name", "nom_complet", "fullName", "full_name")
    || pickStr(data, "name", "nom_complet", "fullName");

  let derivedFirst = firstName;
  let derivedLast = lastName;
  if (!derivedFirst && !derivedLast && fullName) {
    const parts = fullName.split(/\s+/);
    derivedFirst = parts[0] || "";
    derivedLast = parts.slice(1).join(" ") || "";
  }

  return {
    firstName: derivedFirst,
    lastName: derivedLast,
    email: pickStr(contactRaw, "email", "mail", "e-mail", "courriel") || pickStr(data, "email", "mail"),
    phone: pickStr(contactRaw, "phone", "téléphone", "telephone", "tel", "mobile", "portable") || pickStr(data, "phone", "tel"),
    linkedin: pickStr(contactRaw, "linkedin", "linkedIn", "linked_in") || pickStr(data, "linkedin"),
    portfolio: pickStr(contactRaw, "portfolio", "github", "gitHub", "website", "site", "site_web") || pickStr(data, "github", "portfolio"),
    location: pickStr(contactRaw, "location", "lieu", "ville", "city", "address", "adresse") || pickStr(data, "location", "ville"),
    photo: null,
    education: mapEducation(
      pickArr(data, "education", "éducation", "formations", "formation", "studies", "études", "etudes", "diplomas", "diplômes")
    ),
    languages: mapLanguages(
      pickArr(data, "languages", "langues", "langs")
    ),
    certificates: mapCertificates(
      pickArr(data, "certificates", "certificats", "certifications", "certifs", "awards", "prix")
    ),
  };
}

/**
 * Maps JSON to cover letter fields.
 */
export function mapJsonToCoverLetter(json) {
  const root = typeof json === "string" ? JSON.parse(json) : json;
  const data = root.data || root.resume || root.cv || root;
  const cl = pick(data, "coverLetter", "cover_letter", "lettre",
    "lettreMotivation", "lettre_motivation", "lettre_de_motivation",
    "motivation", "letter") || data;

  return {
    recipientName: pickStr(cl, "recipientName", "recipient_name", "destinataire",
      "hiringManager", "hiring_manager", "recruteur", "nom_destinataire"),
    recipientCompany: pickStr(cl, "recipientCompany", "recipient_company", "entreprise",
      "company", "société", "societe", "nom_entreprise", "company_name"),
    recipientAddress: pickStr(cl, "recipientAddress", "recipient_address", "adresse_entreprise",
      "company_address", "adresse_destinataire"),
    subject: pickStr(cl, "subject", "objet", "object", "titre", "title", "sujet"),
    greeting: pickStr(cl, "greeting", "salutation", "formule_appel", "dear"),
    body: pickStr(cl, "body", "corps", "content", "contenu", "texte", "text",
      "paragraphs", "paragraphes"),
    closing: pickStr(cl, "closing", "cloture", "clôture", "formule_politesse",
      "regards", "cordialement", "signature_formule"),
    signature: pickStr(cl, "signature", "signataire", "nom_signataire"),
  };
}

export const EXAMPLE_JSON = `{
  "title": "AI Engineer Intern",
  "summary": "Passionate AI engineering student with hands-on ML experience in production environments.",
  "experience": [
    {
      "title": "ML Engineer Intern",
      "company": "TechCorp",
      "location": "Paris",
      "start": "2025-06",
      "end": "2025-12",
      "description": "Built ML pipelines for real-time inference. Deployed models with Docker/K8s. Reduced inference latency by 40%."
    }
  ],
  "skills": ["Python", "TensorFlow", "PyTorch", "Docker", "SQL", "AWS", "scikit-learn"],
  "projects": [
    {
      "name": "Real-time Threat Detector",
      "technologies": "Python, YOLO, OpenCV",
      "description": "Built a computer vision pipeline for real-time threat detection with 95% accuracy."
    }
  ],
  "coverLetter": {
    "recipientCompany": "TechCorp",
    "recipientName": "M. Dupont",
    "subject": "Candidature - Stage AI Engineer",
    "body": "Je me permets de vous adresser ma candidature pour le poste de stagiaire AI Engineer. Mon experience en Machine Learning et Data Engineering fait de moi un candidat operationnel.",
    "closing": "Dans l'attente de votre retour, je vous prie d'agreer mes salutations distinguees."
  }
}`;

export const EXAMPLE_PROFILE_JSON = `{
  "firstName": "Antoine",
  "lastName": "Bouveret",
  "email": "abouveret9@gmail.com",
  "phone": "+33 6 XX XX XX XX",
  "linkedin": "linkedin.com/in/antoine-bouveret",
  "portfolio": "github.com/antoinebouveret",
  "location": "Paris, France",
  "education": [
    {
      "degree": "Master of Engineering - Defense & Security Technologies",
      "school": "ECE Paris",
      "location": "Paris, France",
      "start": "2021",
      "end": "2026",
      "description": "Specialization in AI, Machine Learning, and Cybersecurity."
    }
  ],
  "languages": [
    { "language": "French", "level": "Native" },
    { "language": "English", "level": "Fluent (C1)" },
    { "language": "Turkish", "level": "Intermediate (B1)" }
  ],
  "certificates": [
    "Google Data Analytics Professional Certificate",
    "Machine Learning Specialization - Stanford Online"
  ]
}`;
