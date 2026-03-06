import { View, Text } from "@react-pdf/renderer";

export const SECTION_IDS = ["summary", "experience", "education", "projects", "skills"];

function MainSection({ title, children, styles }) {
  return (
    <View style={styles.mainSection}>
      <Text style={styles.mainSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function renderMainSection(id, data, styles) {
  const { profile, experience, education, projects, skills } = data;
  switch (id) {
    case "summary":
      if (!profile) return null;
      return (
        <MainSection key="summary" title="PROFILE SUMMARY" styles={styles}>
          <Text style={styles.profileText}>{profile}</Text>
        </MainSection>
      );
    case "experience":
      if (!experience.length) return null;
      return (
        <MainSection key="experience" title="EXPERIENCE" styles={styles}>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.jobTitle}</Text>
                <Text style={styles.entryDate}>{exp.startDate} - {exp.endDate || "Present"}</Text>
              </View>
              <Text style={styles.entrySub}>{[exp.company, exp.location].filter(Boolean).join(" | ")}</Text>
              {exp.description ? <Text style={styles.entryDesc}>{exp.description}</Text> : null}
            </View>
          ))}
        </MainSection>
      );
    case "education":
      if (!education.length) return null;
      return (
        <MainSection key="education" title="EDUCATION" styles={styles}>
          {education.map((edu) => (
            <View key={edu.id} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.degree}</Text>
                <Text style={styles.entryDate}>{edu.startDate} - {edu.endDate || "Present"}</Text>
              </View>
              <Text style={styles.entrySub}>{[edu.school, edu.location].filter(Boolean).join(" | ")}</Text>
              {edu.description ? <Text style={styles.entryDesc}>{edu.description}</Text> : null}
            </View>
          ))}
        </MainSection>
      );
    case "projects":
      if (!projects.length) return null;
      return (
        <MainSection key="projects" title="PROJECTS" styles={styles}>
          {projects.map((p) => (
            <View key={p.id} style={styles.projEntry}>
              <Text style={styles.projName}>{p.name}</Text>
              {p.technologies ? <Text style={styles.projTech}>{p.technologies}</Text> : null}
              {p.description ? <Text style={styles.projDesc}>{p.description}</Text> : null}
            </View>
          ))}
        </MainSection>
      );
    case "skills":
      if (!skills.length) return null;
      return (
        <MainSection key="skills" title="SKILLS" styles={styles}>
          {skills.map((sk, i) => (
            <View key={i} style={styles.skillRow}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.skillText}>{sk}</Text>
            </View>
          ))}
        </MainSection>
      );
    default:
      return null;
  }
}
