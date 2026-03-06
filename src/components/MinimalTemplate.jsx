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
  dark: "#374151",
  gray: "#6B7280",
  white: "#FFFFFF",
  line: "#E5E7EB",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: C.black,
    lineHeight: 1.5,
    paddingHorizontal: 56,
    paddingVertical: 48,
    backgroundColor: C.white,
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  name: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 2,
    letterSpacing: 0.5,
    flexWrap: "wrap",
  },
  titleText: {
    fontSize: 8,
    color: C.gray,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  contactVal: { fontSize: 7, color: C.gray, flexWrap: "wrap" },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  photoWrap: { alignItems: "center", marginBottom: 8 },
  photo: { width: 48, height: 48, borderRadius: 24, objectFit: "cover" },
  photoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 16, color: C.gray, fontFamily: "Helvetica-Bold" },
  mainSection: { marginBottom: 16 },
  mainSectionTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.gray,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  profileText: {
    fontSize: 8,
    color: C.dark,
    lineHeight: 1.55,
    flexWrap: "wrap",
  },
  entry: { marginBottom: 10 },
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
    maxWidth: "75%",
    flexWrap: "wrap",
  },
  entryDate: { fontSize: 7, color: C.gray, flexWrap: "wrap" },
  entrySub: { fontSize: 7, color: C.gray, marginBottom: 2, flexWrap: "wrap" },
  entryDesc: { fontSize: 7, color: C.dark, lineHeight: 1.5, flexWrap: "wrap" },
  projEntry: { marginBottom: 10 },
  projName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 1,
    flexWrap: "wrap",
  },
  projTech: {
    fontSize: 7,
    color: C.gray,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  projDesc: { fontSize: 7, color: C.dark, lineHeight: 1.5, flexWrap: "wrap" },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bullet: { fontSize: 7, color: C.gray, marginRight: 4, marginTop: 0.5 },
  skillText: { fontSize: 7, color: C.dark, flex: 1, flexWrap: "wrap" },
});

export default function MinimalTemplate({ data, sectionOrder }) {
  const { personalInfo, contact, profile, experience, education, skills, projects } = data;
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? sectionOrder.filter((id) => SECTION_IDS.includes(id))
      : SECTION_IDS;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 48;
  const shape = personalInfo.photoShape || "circle";
  const radius = shape === "square" ? 4 : shape === "rounded" ? 6 : photoSize / 2;
  const photoStyle = [{ ...s.photo, width: photoSize, height: photoSize, borderRadius: radius }];
  const placeholderStyle = [{ ...s.photoPlaceholder, width: photoSize, height: photoSize, borderRadius: radius }];
  const mainData = { profile, experience, education, projects, skills };

  return (
    <Document>
      <Page size="A4" style={s.page}>
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
      </Page>
    </Document>
  );
}
