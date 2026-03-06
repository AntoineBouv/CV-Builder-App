const STORAGE_KEY = "cv-builder-permanent-profile";

export const emptyPermanentData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  linkedin: "",
  portfolio: "",
  location: "",
  photo: null,
  photoShape: "circle",
  photoSize: 72,
  education: [],
  languages: [],
  certificates: [],
};

export const emptyDynamicData = {
  title: "",
  profile: "",
  experience: [],
  projects: [],
  skills: [],
};

export const emptyCoverLetter = {
  recipientName: "",
  recipientCompany: "",
  recipientAddress: "",
  date: new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  subject: "",
  greeting: "Madame, Monsieur,",
  body: "",
  closing: "Je vous prie d'agreer, Madame, Monsieur, l'expression de mes salutations distinguees.",
  signature: "",
};

export const emptyRecommendationLetter = {
  recommenderName: "",
  recommenderTitle: "",
  candidateName: "",
  targetCompany: "",
  body: "",
};

/** Order of main sections in the CV PDF. Sidebar (contact, languages, certs) is fixed. */
export const DEFAULT_SECTION_ORDER = ["summary", "experience", "education", "projects", "skills"];

/** CV template id for PDF layout. */
export const DEFAULT_CV_TEMPLATE = "flowcv";

export function loadPermanentData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...emptyPermanentData, ...parsed };
  } catch {
    return null;
  }
}

export function savePermanentData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function buildCvForPdf(perm, dyn) {
  return {
    personalInfo: {
      firstName: perm.firstName,
      lastName: perm.lastName,
      title: dyn.title,
      photo: perm.photo,
      photoShape: perm.photoShape,
      photoSize: perm.photoSize,
    },
    contact: {
      email: perm.email,
      phone: perm.phone,
      location: perm.location,
      linkedin: perm.linkedin,
      github: perm.portfolio,
    },
    profile: dyn.profile,
    experience: dyn.experience,
    education: perm.education,
    skills: dyn.skills,
    languages: perm.languages,
    certificates: perm.certificates,
    projects: dyn.projects,
  };
}

export function buildClForPdf(perm, cl) {
  return {
    senderName: `${perm.firstName} ${perm.lastName}`.trim(),
    senderAddress: perm.location,
    senderEmail: perm.email,
    senderPhone: perm.phone,
    ...cl,
    signature: cl.signature || `${perm.firstName} ${perm.lastName}`.trim(),
  };
}

export function buildRecommendationForPdf(perm, rec) {
  return {
    recommenderName: rec.recommenderName,
    recommenderTitle: rec.recommenderTitle,
    candidateName: rec.candidateName || `${perm.firstName} ${perm.lastName}`.trim(),
    targetCompany: rec.targetCompany,
    body: rec.body,
  };
}

export function getMissingFields(perm, dyn) {
  const missing = [];
  if (!perm.firstName.trim()) missing.push("Prenom");
  if (!perm.lastName.trim()) missing.push("Nom");
  if (!perm.email.trim()) missing.push("Email");
  if (!perm.phone.trim()) missing.push("Telephone");
  if (!perm.education.length) missing.push("Formation (0 diplome)");
  if (!dyn.title.trim()) missing.push("Titre du CV");
  if (!dyn.profile.trim()) missing.push("Resume / Summary");
  if (!dyn.experience.length) missing.push("Experiences (0)");
  if (!dyn.skills.length) missing.push("Competences (0)");
  return missing;
}
