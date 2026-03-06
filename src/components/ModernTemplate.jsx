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
  gray: "#6B7280",
  white: "#FFFFFF",
  line: "#E5E7EB",
  accent: "#2563EB",
};

const s = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.black,
    lineHeight: 1.4,
    backgroundColor: C.white,
  },
  accentBar: {
    width: 6,
    backgroundColor: C.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  header: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  titleText: {
    fontSize: 10,
    color: C.gray,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  contactVal: { fontSize: 8, color: C.dark, flexWrap: "wrap" },
  photoWrap: { marginBottom: 8 },
  photo: { width: 56, height: 56, borderRadius: 28, objectFit: "cover" },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 18, color: C.gray, fontFamily: "Helvetica-Bold" },
  mainSection: { marginBottom: 12 },
  mainSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 5,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: C.accent,
  },
  profileText: {
    fontSize: 9,
    color: C.dark,
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
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    maxWidth: "72%",
    flexWrap: "wrap",
  },
  entryDate: { fontSize: 8, color: C.gray, flexWrap: "wrap" },
  entrySub: { fontSize: 8, color: C.gray, marginBottom: 2, flexWrap: "wrap" },
  entryDesc: { fontSize: 8, color: C.dark, lineHeight: 1.45, flexWrap: "wrap" },
  projEntry: { marginBottom: 8 },
  projName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 1,
    flexWrap: "wrap",
  },
  projTech: {
    fontSize: 8,
    color: C.gray,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  projDesc: { fontSize: 8, color: C.dark, lineHeight: 1.45, flexWrap: "wrap" },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bullet: { fontSize: 8, color: C.gray, marginRight: 5, marginTop: 0.5 },
  skillText: { fontSize: 8, color: C.dark, flex: 1, flexWrap: "wrap" },
});

export default function ModernTemplate({ data, sectionOrder }) {
  const { personalInfo, contact, profile, experience, education, skills, projects } = data;
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? sectionOrder.filter((id) => SECTION_IDS.includes(id))
      : SECTION_IDS;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 56;
  const shape = personalInfo.photoShape || "circle";
  const radius = shape === "square" ? 4 : shape === "rounded" ? 8 : photoSize / 2;
  const photoStyle = [{ ...s.photo, width: photoSize, height: photoSize, borderRadius: radius }];
  const placeholderStyle = [{ ...s.photoPlaceholder, width: photoSize, height: photoSize, borderRadius: radius }];
  const mainData = { profile, experience, education, projects, skills };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.accentBar} />
        <View style={s.content}>
          <View style={s.header}>
            {personalInfo.photo ? (
              <View style={s.photoWrap}>
                <Image style={photoStyle} src={personalInfo.photo} />
              </View>
            ) : (
              <View style={s.photoWrap}>
                <View style={placeholderStyle}>
                  <Text style={s.initials}>{initials}</Text>
                </View>
              </View>
            )}
            <Text style={s.name}>{personalInfo.firstName} {personalInfo.lastName}</Text>
            <Text style={s.titleText}>{personalInfo.title}</Text>
            <View style={s.contactRow}>
              {contact.email ? <Text style={s.contactVal}>{contact.email}</Text> : null}
              {contact.phone ? <Text style={s.contactVal}>{contact.phone}</Text> : null}
              {contact.location ? <Text style={s.contactVal}>{contact.location}</Text> : null}
              {contact.linkedin ? <Text style={s.contactVal}>{contact.linkedin}</Text> : null}
              {contact.github ? <Text style={s.contactVal}>{contact.github}</Text> : null}
            </View>
          </View>
          {order.map((id) => renderMainSection(id, mainData, s))}
        </View>
      </Page>
    </Document>
  );
}
