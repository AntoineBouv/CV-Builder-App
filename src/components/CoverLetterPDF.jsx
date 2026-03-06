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
    marginBottom: 30,
  },
  senderBlock: { maxWidth: "45%" },
  recipientBlock: { maxWidth: "45%", alignItems: "flex-end" },
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

  dateLine: {
    fontSize: 9.5,
    color: C.medGray,
    textAlign: "right",
    marginBottom: 22,
    flexWrap: "wrap",
  },

  subjectLine: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: C.line,
    flexWrap: "wrap",
  },

  greeting: {
    fontSize: 10,
    color: C.dark,
    marginBottom: 14,
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

  closing: {
    fontSize: 10,
    color: C.dark,
    marginTop: 14,
    marginBottom: 28,
    lineHeight: 1.55,
    flexWrap: "wrap",
  },

  signature: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
    flexWrap: "wrap",
  },
});

export default function CoverLetterPDF({ data }) {
  const {
    senderName, senderAddress, senderEmail, senderPhone,
    recipientName, recipientCompany, recipientAddress,
    date, subject, greeting, body, closing, signature,
  } = data;

  const bodyParagraphs = body.split("\n").filter((p) => p.trim());

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View style={s.senderBlock}>
            <Text style={s.headerName}>{senderName}</Text>
            {senderAddress ? <Text style={s.headerLine}>{senderAddress}</Text> : null}
            {senderEmail ? <Text style={s.headerLine}>{senderEmail}</Text> : null}
            {senderPhone ? <Text style={s.headerLine}>{senderPhone}</Text> : null}
          </View>

          <View style={s.recipientBlock}>
            {recipientName ? <Text style={s.headerName}>{recipientName}</Text> : null}
            {recipientCompany ? <Text style={s.headerLine}>{recipientCompany}</Text> : null}
            {recipientAddress ? <Text style={s.headerLine}>{recipientAddress}</Text> : null}
          </View>
        </View>

        {date ? <Text style={s.dateLine}>{date}</Text> : null}

        {subject ? <Text style={s.subjectLine}>Objet : {subject}</Text> : null}

        {greeting ? <Text style={s.greeting}>{greeting}</Text> : null}

        {bodyParagraphs.map((para, i) => (
          <Text key={i} style={s.bodyText}>{para.trim()}</Text>
        ))}

        {closing ? <Text style={s.closing}>{closing}</Text> : null}

        {signature ? <Text style={s.signature}>{signature}</Text> : null}
      </Page>
    </Document>
  );
}
