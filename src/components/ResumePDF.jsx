import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const C = {
  black: "#000000",
  dark: "#1F2937",
  gray: "#4B5563",
  medGray: "#6B7280",
  ltGray: "#9CA3AF",
  sidebar: "#F3F4F6",
  white: "#FFFFFF",
  line: "#D1D5DB",
  lineDark: "#9CA3AF",
  accent: "#111827",
};

const s = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: C.black,
    lineHeight: 1.45,
  },

  sidebar: {
    width: "33%",
    backgroundColor: C.sidebar,
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  photoWrap: { alignItems: "center", marginBottom: 14 },
  photo: { width: 72, height: 72, borderRadius: 36, objectFit: "cover" },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 22, color: C.medGray, fontFamily: "Helvetica-Bold" },

  nameWrap: { alignItems: "center", marginBottom: 3 },
  name: { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.accent, textAlign: "center", letterSpacing: 0.3 },
  titleText: { fontSize: 8.5, color: C.gray, textAlign: "center", marginTop: 3, marginBottom: 18, lineHeight: 1.4 },

  sideSection: { marginBottom: 14 },
  sideSectionTitle: {
    fontSize: 8, fontFamily: "Helvetica-Bold", color: C.accent,
    textTransform: "uppercase", letterSpacing: 2,
    marginBottom: 7, paddingBottom: 3,
    borderBottomWidth: 0.75, borderBottomColor: C.lineDark,
  },

  contactRow: { flexDirection: "row", marginBottom: 4.5, alignItems: "flex-start" },
  contactLabel: { fontSize: 7, color: C.medGray, width: 48, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.4 },
  contactVal: { fontSize: 8, color: C.dark, flex: 1 },

  skillRow: { flexDirection: "row", marginBottom: 3.5, alignItems: "flex-start" },
  bullet: { fontSize: 7, color: C.gray, marginRight: 5, marginTop: 0.5 },
  skillText: { fontSize: 8, color: C.gray, flex: 1 },

  langRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  langName: { fontSize: 8, color: C.dark, fontFamily: "Helvetica-Bold" },
  langLevel: { fontSize: 7.5, color: C.medGray },

  certText: { fontSize: 8, color: C.gray },

  main: {
    width: "67%",
    paddingHorizontal: 22,
    paddingVertical: 26,
    backgroundColor: C.white,
  },
  mainSection: { marginBottom: 14 },
  mainSectionTitle: {
    fontSize: 9, fontFamily: "Helvetica-Bold", color: C.accent,
    textTransform: "uppercase", letterSpacing: 2.5,
    marginBottom: 7, paddingBottom: 3,
    borderBottomWidth: 1, borderBottomColor: C.accent,
  },

  profileText: { fontSize: 8.5, color: C.gray, lineHeight: 1.55, textAlign: "justify" },

  entry: { marginBottom: 10 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1.5 },
  entryTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: C.dark, maxWidth: "70%" },
  entryDate: { fontSize: 7.5, color: C.medGray, textAlign: "right" },
  entrySub: { fontSize: 8.5, color: C.gray, marginBottom: 3 },
  entryDesc: { fontSize: 8, color: C.gray, lineHeight: 1.55 },

  projEntry: { marginBottom: 9 },
  projName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 1.5 },
  projTech: { fontSize: 7.5, color: C.medGray, fontFamily: "Helvetica-Oblique", marginBottom: 2.5 },
  projDesc: { fontSize: 8, color: C.gray, lineHeight: 1.55 },
});

function SideSection({ title, children }) {
  return (
    <View style={s.sideSection}>
      <Text style={s.sideSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MainSection({ title, children }) {
  return (
    <View style={s.mainSection}>
      <Text style={s.mainSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ResumePDF({ data }) {
  const { personalInfo, contact, profile, experience, education, skills, languages, certificates, projects } = data;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 72;
  const shape = personalInfo.photoShape || "circle";
  const radius =
    shape === "square"
      ? 4
      : shape === "rounded"
      ? 12
      : photoSize / 2;
  const photoStyle = [{ ...s.photo, width: photoSize, height: photoSize, borderRadius: radius }];
  const placeholderStyle = [{ ...s.photoPlaceholder, width: photoSize, height: photoSize, borderRadius: radius }];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          <View style={s.photoWrap}>
            {personalInfo.photo ? (
              <Image style={photoStyle} src={personalInfo.photo} />
            ) : (
              <View style={placeholderStyle}>
                <Text style={s.initials}>{initials}</Text>
              </View>
            )}
          </View>

          <View style={s.nameWrap}>
            <Text style={s.name}>{personalInfo.firstName} {personalInfo.lastName}</Text>
          </View>
          <Text style={s.titleText}>{personalInfo.title}</Text>

          <SideSection title="CONTACT">
            {contact.email ? <View style={s.contactRow}><Text style={s.contactLabel}>Email</Text><Text style={s.contactVal}>{contact.email}</Text></View> : null}
            {contact.phone ? <View style={s.contactRow}><Text style={s.contactLabel}>Phone</Text><Text style={s.contactVal}>{contact.phone}</Text></View> : null}
            {contact.location ? <View style={s.contactRow}><Text style={s.contactLabel}>Lieu</Text><Text style={s.contactVal}>{contact.location}</Text></View> : null}
            {contact.linkedin ? <View style={s.contactRow}><Text style={s.contactLabel}>LinkedIn</Text><Text style={s.contactVal}>{contact.linkedin}</Text></View> : null}
            {contact.github ? <View style={s.contactRow}><Text style={s.contactLabel}>GitHub</Text><Text style={s.contactVal}>{contact.github}</Text></View> : null}
          </SideSection>

          {skills.length > 0 && (
            <SideSection title="SKILLS">
              {skills.map((sk, i) => (
                <View key={i} style={s.skillRow}>
                  <Text style={s.bullet}>-</Text>
                  <Text style={s.skillText}>{sk}</Text>
                </View>
              ))}
            </SideSection>
          )}

          {languages.length > 0 && (
            <SideSection title="LANGUAGES">
              {languages.map((l, i) => (
                <View key={i} style={s.langRow}>
                  <Text style={s.langName}>{l.language}</Text>
                  <Text style={s.langLevel}>{l.level}</Text>
                </View>
              ))}
            </SideSection>
          )}

          {certificates.length > 0 && (
            <SideSection title="CERTIFICATIONS">
              {certificates.map((c, i) => (
                <View key={i} style={s.skillRow}>
                  <Text style={s.bullet}>-</Text>
                  <Text style={s.certText}>{c}</Text>
                </View>
              ))}
            </SideSection>
          )}
        </View>

        <View style={s.main}>
          {profile && (
            <MainSection title="PROFILE SUMMARY">
              <Text style={s.profileText}>{profile}</Text>
            </MainSection>
          )}

          {experience.length > 0 && (
            <MainSection title="EXPERIENCE">
              {experience.map((exp) => (
                <View key={exp.id} style={s.entry}>
                  <View style={s.entryHeader}>
                    <Text style={s.entryTitle}>{exp.jobTitle}</Text>
                    <Text style={s.entryDate}>{exp.startDate} - {exp.endDate || "Present"}</Text>
                  </View>
                  <Text style={s.entrySub}>{[exp.company, exp.location].filter(Boolean).join(" | ")}</Text>
                  {exp.description ? <Text style={s.entryDesc}>{exp.description}</Text> : null}
                </View>
              ))}
            </MainSection>
          )}

          {education.length > 0 && (
            <MainSection title="EDUCATION">
              {education.map((edu) => (
                <View key={edu.id} style={s.entry}>
                  <View style={s.entryHeader}>
                    <Text style={s.entryTitle}>{edu.degree}</Text>
                    <Text style={s.entryDate}>{edu.startDate} - {edu.endDate || "Present"}</Text>
                  </View>
                  <Text style={s.entrySub}>{[edu.school, edu.location].filter(Boolean).join(" | ")}</Text>
                  {edu.description ? <Text style={s.entryDesc}>{edu.description}</Text> : null}
                </View>
              ))}
            </MainSection>
          )}

          {projects.length > 0 && (
            <MainSection title="PROJECTS">
              {projects.map((p) => (
                <View key={p.id} style={s.projEntry}>
                  <Text style={s.projName}>{p.name}</Text>
                  {p.technologies ? <Text style={s.projTech}>{p.technologies}</Text> : null}
                  {p.description ? <Text style={s.projDesc}>{p.description}</Text> : null}
                </View>
              ))}
            </MainSection>
          )}
        </View>
      </Page>
    </Document>
  );
}
