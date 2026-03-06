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
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: C.black,
    lineHeight: 1.45,
    paddingHorizontal: 50,
    paddingVertical: 40,
    backgroundColor: C.white,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingBottom: 14,
  },
  name: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    color: C.accent,
    marginBottom: 4,
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
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  contactVal: { fontSize: 9, color: C.dark, flexWrap: "wrap" },
  photoWrap: { alignItems: "center", marginBottom: 10 },
  photo: { width: 64, height: 64, borderRadius: 32, objectFit: "cover" },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 20, color: C.medGray, fontFamily: "Times-Bold" },
  mainSection: { marginBottom: 14 },
  mainSectionTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  profileText: {
    fontSize: 10,
    color: C.dark,
    lineHeight: 1.5,
    textAlign: "justify",
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
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: C.dark,
    maxWidth: "75%",
    flexWrap: "wrap",
  },
  entryDate: { fontSize: 9, color: C.medGray, flexWrap: "wrap" },
  entrySub: { fontSize: 9, color: C.gray, marginBottom: 2, flexWrap: "wrap" },
  entryDesc: { fontSize: 9, color: C.dark, lineHeight: 1.5, flexWrap: "wrap" },
  projEntry: { marginBottom: 8 },
  projName: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: C.dark,
    marginBottom: 1,
    flexWrap: "wrap",
  },
  projTech: {
    fontSize: 9,
    color: C.medGray,
    fontFamily: "Times-Italic",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  projDesc: { fontSize: 9, color: C.dark, lineHeight: 1.5, flexWrap: "wrap" },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bullet: { fontSize: 9, color: C.gray, marginRight: 6, marginTop: 0.5 },
  skillText: { fontSize: 9, color: C.dark, flex: 1, flexWrap: "wrap" },
});

export default function ClassicTemplate({ data, sectionOrder }) {
  const { personalInfo, contact, profile, experience, education, skills, projects } = data;
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? sectionOrder.filter((id) => SECTION_IDS.includes(id))
      : SECTION_IDS;
  const initials = (personalInfo.firstName?.[0] || "") + (personalInfo.lastName?.[0] || "");
  const photoSize = personalInfo.photoSize || 64;
  const shape = personalInfo.photoShape || "circle";
  const radius = shape === "square" ? 4 : shape === "rounded" ? 10 : photoSize / 2;
  const photoStyle = [{ ...s.photo, width: photoSize, height: photoSize, borderRadius: radius }];
  const placeholderStyle = [{ ...s.photoPlaceholder, width: photoSize, height: photoSize, borderRadius: radius }];
  const mainData = { profile, experience, education, projects, skills };

  const contactParts = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github].filter(Boolean);

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
          {contactParts.length > 0 && (
            <View style={s.contactRow}>
              {contact.email ? <Text style={s.contactVal}>{contact.email}</Text> : null}
              {contact.phone ? <Text style={s.contactVal}>{contact.phone}</Text> : null}
              {contact.location ? <Text style={s.contactVal}>{contact.location}</Text> : null}
              {contact.linkedin ? <Text style={s.contactVal}>{contact.linkedin}</Text> : null}
              {contact.github ? <Text style={s.contactVal}>{contact.github}</Text> : null}
            </View>
          )}
        </View>
        <View>
          {order.map((id) => renderMainSection(id, mainData, s))}
        </View>
      </Page>
    </Document>
  );
}
