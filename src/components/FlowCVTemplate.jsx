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
  name: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textAlign: "center",
    letterSpacing: 0.3,
    flexWrap: "wrap",
  },
  titleText: {
    fontSize: 8.5,
    color: C.gray,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 18,
    lineHeight: 1.4,
    flexWrap: "wrap",
  },
  sideSection: { marginBottom: 14 },
  sideSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 7,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: C.lineDark,
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 4.5,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  contactLabel: { fontSize: 7, color: C.medGray, width: 48, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.4 },
  contactVal: { fontSize: 8, color: C.dark, flex: 1, flexWrap: "wrap" },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3.5,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bullet: { fontSize: 7, color: C.gray, marginRight: 5, marginTop: 0.5 },
  skillText: { fontSize: 8, color: C.gray, flex: 1, flexWrap: "wrap" },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  langName: { fontSize: 8, color: C.dark, fontFamily: "Helvetica-Bold", flexWrap: "wrap" },
  langLevel: { fontSize: 7.5, color: C.medGray, flexWrap: "wrap" },
  certText: { fontSize: 8, color: C.gray, flexWrap: "wrap" },
  main: {
    width: "67%",
    paddingHorizontal: 22,
    paddingVertical: 26,
    backgroundColor: C.white,
  },
  mainSection: { marginBottom: 14 },
  mainSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 7,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: C.accent,
  },
  profileText: {
    fontSize: 8.5,
    color: C.gray,
    lineHeight: 1.55,
    textAlign: "justify",
    flexWrap: "wrap",
  },
  entry: { marginBottom: 10 },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1.5,
    flexWrap: "wrap",
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    maxWidth: "70%",
    flexWrap: "wrap",
  },
  entryDate: { fontSize: 7.5, color: C.medGray, textAlign: "right", flexWrap: "wrap" },
  entrySub: { fontSize: 8.5, color: C.gray, marginBottom: 3, flexWrap: "wrap" },
  entryDesc: { fontSize: 8, color: C.gray, lineHeight: 1.55, flexWrap: "wrap" },
  projEntry: { marginBottom: 9 },
  projName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 1.5,
    flexWrap: "wrap",
  },
  projTech: {
    fontSize: 7.5,
    color: C.medGray,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 2.5,
    flexWrap: "wrap",
  },
  projDesc: {
    fontSize: 8,
    color: C.gray,
    lineHeight: 1.55,
    flexWrap: "wrap",
  },
});

function SideSection({ title, children }) {
  return (
    <View style={s.sideSection}>
      <Text style={s.sideSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function FlowCVTemplate({ data, sectionOrder }) {
  const { personalInfo, contact, profile, experience, education, skills, languages, certificates, projects } = data;
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? sectionOrder.filter((id) => SECTION_IDS.includes(id))
      : SECTION_IDS;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 72;
  const shape = personalInfo.photoShape || "circle";
  const radius = shape === "square" ? 4 : shape === "rounded" ? 12 : photoSize / 2;
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
          <SideSection title="CONTACT">
            {contact.email ? <View style={s.contactRow}><Text style={s.contactLabel}>Email</Text><Text style={s.contactVal}>{contact.email}</Text></View> : null}
            {contact.phone ? <View style={s.contactRow}><Text style={s.contactLabel}>Phone</Text><Text style={s.contactVal}>{contact.phone}</Text></View> : null}
            {contact.location ? <View style={s.contactRow}><Text style={s.contactLabel}>Lieu</Text><Text style={s.contactVal}>{contact.location}</Text></View> : null}
            {contact.linkedin ? <View style={s.contactRow}><Text style={s.contactLabel}>LinkedIn</Text><Text style={s.contactVal}>{contact.linkedin}</Text></View> : null}
            {contact.github ? <View style={s.contactRow}><Text style={s.contactLabel}>GitHub</Text><Text style={s.contactVal}>{contact.github}</Text></View> : null}
          </SideSection>
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
          {order.map((id) => renderMainSection(id, mainData, s))}
        </View>
      </Page>
    </Document>
  );
}
