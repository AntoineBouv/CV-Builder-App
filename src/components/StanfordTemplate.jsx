import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { SECTION_IDS, renderMainSection } from "./cvSectionRenderer.jsx";

const C = {
  black: "#000000",
  dark: "#1a1a1a",
  gray: "#4a4a4a",
  medGray: "#6b7280",
  white: "#FFFFFF",
  line: "#e0e0e0",
  accent: "#8C1515",
};

const s = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.black,
    lineHeight: 1.45,
    backgroundColor: C.white,
  },
  sidebar: {
    width: "32%",
    backgroundColor: "#fafafa",
    paddingHorizontal: 18,
    paddingVertical: 24,
    borderRightWidth: 1,
    borderRightColor: C.line,
  },
  photoWrap: { alignItems: "center", marginBottom: 12 },
  photo: { width: 70, height: 70, borderRadius: 35, objectFit: "cover" },
  photoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 20, color: C.medGray, fontFamily: "Helvetica-Bold" },
  nameWrap: { marginBottom: 2 },
  name: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    flexWrap: "wrap",
  },
  titleText: {
    fontSize: 8.5,
    color: C.gray,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
    flexWrap: "wrap",
  },
  sideSection: { marginBottom: 12 },
  sideSectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  contactLabel: {
    fontSize: 6.5,
    color: C.medGray,
    width: 44,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  contactVal: { fontSize: 7.5, color: C.dark, flex: 1, flexWrap: "wrap" },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bullet: { fontSize: 7, color: C.gray, marginRight: 5, marginTop: 0.5 },
  skillText: { fontSize: 7.5, color: C.dark, flex: 1, flexWrap: "wrap" },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    flexWrap: "wrap",
  },
  langName: { fontSize: 7.5, color: C.dark, fontFamily: "Helvetica-Bold", flexWrap: "wrap" },
  langLevel: { fontSize: 7, color: C.medGray, flexWrap: "wrap" },
  certText: { fontSize: 7.5, color: C.dark, marginBottom: 2, flexWrap: "wrap" },
  main: {
    width: "68%",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  mainSection: { marginBottom: 12 },
  mainSectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  profileText: {
    fontSize: 9,
    color: C.dark,
    lineHeight: 1.5,
    textAlign: "justify",
    flexWrap: "wrap",
  },
  entry: { marginBottom: 9 },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1.5,
    flexWrap: "wrap",
  },
  entryTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    maxWidth: "72%",
    flexWrap: "wrap",
  },
  entryDate: { fontSize: 7.5, color: C.medGray, flexWrap: "wrap" },
  entrySub: { fontSize: 8, color: C.gray, marginBottom: 2, flexWrap: "wrap" },
  entryDesc: { fontSize: 8, color: C.dark, lineHeight: 1.5, flexWrap: "wrap" },
  projEntry: { marginBottom: 9 },
  projName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 1,
    flexWrap: "wrap",
  },
  projTech: {
    fontSize: 7.5,
    color: C.medGray,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  projDesc: { fontSize: 8, color: C.dark, lineHeight: 1.5, flexWrap: "wrap" },
});

function SideSection({ title, children }) {
  return (
    <View style={s.sideSection}>
      <Text style={s.sideSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function StanfordTemplate({ data, sectionOrder }) {
  const { personalInfo, contact, profile, experience, education, skills, languages, certificates, projects } = data;
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? sectionOrder.filter((id) => SECTION_IDS.includes(id))
      : SECTION_IDS;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 70;
  const shape = personalInfo.photoShape || "circle";
  const radius = shape === "square" ? 4 : shape === "rounded" ? 10 : photoSize / 2;
  const photoStyle = [{ ...s.photo, width: photoSize, height: photoSize, borderRadius: radius }];
  const placeholderStyle = [{ ...s.photoPlaceholder, width: photoSize, height: photoSize, borderRadius: radius }];
  const mainData = { profile, experience, education, projects, skills };

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

          <SideSection title="Contact">
            {contact.email ? <View style={s.contactRow}><Text style={s.contactLabel}>Email</Text><Text style={s.contactVal}>{contact.email}</Text></View> : null}
            {contact.phone ? <View style={s.contactRow}><Text style={s.contactLabel}>Phone</Text><Text style={s.contactVal}>{contact.phone}</Text></View> : null}
            {contact.location ? <View style={s.contactRow}><Text style={s.contactLabel}>Location</Text><Text style={s.contactVal}>{contact.location}</Text></View> : null}
            {contact.linkedin ? <View style={s.contactRow}><Text style={s.contactLabel}>LinkedIn</Text><Text style={s.contactVal}>{contact.linkedin}</Text></View> : null}
            {contact.github ? <View style={s.contactRow}><Text style={s.contactLabel}>GitHub</Text><Text style={s.contactVal}>{contact.github}</Text></View> : null}
          </SideSection>

          {education.length > 0 && (
            <SideSection title="Education">
              {education.slice(0, 3).map((edu) => (
                <View key={edu.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.dark, flexWrap: "wrap" }}>{edu.degree}</Text>
                  <Text style={{ fontSize: 7, color: C.gray, flexWrap: "wrap" }}>{[edu.school, edu.location].filter(Boolean).join(" · ")}</Text>
                  <Text style={{ fontSize: 6.5, color: C.medGray, flexWrap: "wrap" }}>{edu.startDate} – {edu.endDate || "Present"}</Text>
                </View>
              ))}
            </SideSection>
          )}

          {skills.length > 0 && (
            <SideSection title="Skills">
              {skills.map((sk, i) => (
                <View key={i} style={s.skillRow}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={s.skillText}>{sk}</Text>
                </View>
              ))}
            </SideSection>
          )}

          {languages.length > 0 && (
            <SideSection title="Languages">
              {languages.map((l, i) => (
                <View key={i} style={s.langRow}>
                  <Text style={s.langName}>{l.language}</Text>
                  <Text style={s.langLevel}>{l.level}</Text>
                </View>
              ))}
            </SideSection>
          )}

          {certificates.length > 0 && (
            <SideSection title="Certifications">
              {certificates.map((c, i) => (
                <Text key={i} style={s.certText}>• {c}</Text>
              ))}
            </SideSection>
          )}
        </View>

        <View style={s.main}>
          {order.map((id) => renderMainSection(id, mainData, s))}
        </View>
      </Page>
    </Document>
  );
}
