import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const C = {
  black: "#000000",
  dark: "#1F2937",
  gray: "#4B5563",
  medGray: "#6B7280",
  accent: "#111827",
  line: "#D1D5DB",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.black,
    lineHeight: 1.6,
    paddingHorizontal: 60,
    paddingVertical: 50,
    backgroundColor: C.white,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  recommenderBlock: { maxWidth: "48%" },
  candidateBlock: { maxWidth: "48%", alignItems: "flex-end" },
  label: {
    fontSize: 8,
    color: C.medGray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  headerLine: {
    fontSize: 9,
    color: C.gray,
    marginBottom: 1.5,
    flexWrap: "wrap",
  },

  titleLine: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 0.75,
    borderBottomColor: C.line,
    flexWrap: "wrap",
  },

  bodyText: {
    fontSize: 10,
    color: C.dark,
    lineHeight: 1.65,
    textAlign: "justify",
    marginBottom: 10,
    flexWrap: "wrap",
  },
});

export default function RecommendationPDF({ data }) {
  const {
    recommenderName,
    recommenderTitle,
    candidateName,
    targetCompany,
    body,
  } = data;

  const bodyParagraphs = (body || "")
    .split("\n")
    .filter((p) => p.trim());

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View style={s.recommenderBlock}>
            <Text style={s.label}>Recommandeur</Text>
            <Text style={s.headerName}>{recommenderName}</Text>
            {recommenderTitle ? (
              <Text style={s.headerLine}>{recommenderTitle}</Text>
            ) : null}
          </View>

          <View style={s.candidateBlock}>
            <Text style={s.label}>Candidat</Text>
            <Text style={s.headerName}>{candidateName}</Text>
            {targetCompany ? (
              <Text style={s.headerLine}>Pour : {targetCompany}</Text>
            ) : null}
          </View>
        </View>

        <Text style={s.titleLine}>Lettre de recommandation</Text>

        {bodyParagraphs.map((para, i) => (
          <Text key={i} style={s.bodyText}>
            {para.trim()}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
