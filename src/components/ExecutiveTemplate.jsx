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
  white: "#FFFFFF",
  line: "#D1D5DB",
  accent: "#111827",
  sidebar: "#F9FAFB",
};

const s = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 8,
    color: C.black,
    lineHeight: 1.4,
    backgroundColor: C.white,
  },
  sidebar: {
    width: "28%",
    backgroundColor: C.sidebar,
    paddingHorizontal: 14,
    paddingVertical: 22,
  },
  name: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  titleText: {
    fontSize: 7.5,
    color: C.gray,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  sideLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: C.medGray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  sideVal: { fontSize: 7, color: C.dark, marginBottom: 8, flexWrap: "wrap" },
  photoWrap: { alignItems: "center", marginBottom: 10 },
  photo: { width: 60, height: 60, borderRadius: 30, objectFit: "cover" },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 18, color: C.medGray, fontFamily: "Helvetica-Bold" },
  main: {
    width: "72%",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  mainSection: { marginBottom: 12 },
  mainSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  profileText: {
    fontSize: 8,
    color: C.gray,
    lineHeight: 1.5,
    flexWrap: "wrap",
  },
  entry: { marginBottom: 8 },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
    flexWrap: "wrap",
  },
  entryTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    maxWidth: "70%",
    flexWrap: "wrap",
  },
  entryDate: { fontSize: 7, color: C.medGray, flexWrap: "wrap" },
  entrySub: { fontSize: 7, color: C.gray, marginBottom: 2, flexWrap: "wrap" },
  entryDesc: { fontSize: 7, color: C.gray, lineHeight: 1.45, flexWrap: "wrap" },
  projEntry: { marginBottom: 8 },
  projName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 1,
    flexWrap: "wrap",
  },
  projTech: {
    fontSize: 7,
    color: C.medGray,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  projDesc: { fontSize: 7, color: C.gray, lineHeight: 1.45, flexWrap: "wrap" },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bullet: { fontSize: 7, color: C.gray, marginRight: 4, marginTop: 0.5 },
  skillText: { fontSize: 7, color: C.dark, flex: 1, flexWrap: "wrap" },
});

export default function ExecutiveTemplate({ data, sectionOrder }) {
  const { personalInfo, contact, profile, experience, education, skills, languages, certificates, projects } = data;
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? sectionOrder.filter((id) => SECTION_IDS.includes(id))
      : SECTION_IDS;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 60;
  const shape = personalInfo.photoShape || "circle";
  const radius = shape === "square" ? 4 : shape === "rounded" ? 8 : photoSize / 2;
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
          <Text style={s.name}>{personalInfo.firstName} {personalInfo.lastName}</Text>
          <Text style={s.titleText}>{personalInfo.title}</Text>
          {contact.email ? (
            <>
              <Text style={s.sideLabel}>Email</Text>
              <Text style={s.sideVal}>{contact.email}</Text>
            </>
          ) : null}
          {contact.phone ? (
            <>
              <Text style={s.sideLabel}>Tél</Text>
              <Text style={s.sideVal}>{contact.phone}</Text>
            </>
          ) : null}
          {contact.location ? (
            <>
              <Text style={s.sideLabel}>Lieu</Text>
              <Text style={s.sideVal}>{contact.location}</Text>
            </>
          ) : null}
          {contact.linkedin ? (
            <>
              <Text style={s.sideLabel}>LinkedIn</Text>
              <Text style={s.sideVal}>{contact.linkedin}</Text>
            </>
          ) : null}
          {contact.github ? (
            <>
              <Text style={s.sideLabel}>GitHub</Text>
              <Text style={s.sideVal}>{contact.github}</Text>
            </>
          ) : null}
          {languages.length > 0 && (
            <>
              <Text style={s.sideLabel}>Langues</Text>
              <Text style={s.sideVal}>
                {languages.map((l) => `${l.language} (${l.level})`).join(" · ")}
              </Text>
            </>
          )}
        </View>
        <View style={s.main}>
          {order.map((id) => renderMainSection(id, mainData, s))}
        </View>
      </Page>
    </Document>
  );
}
