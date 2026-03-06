import FlowCVTemplate from "./FlowCVTemplate";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";
import StanfordTemplate from "./StanfordTemplate";

const TEMPLATE_MAP = {
  flowcv: FlowCVTemplate,
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  stanford: StanfordTemplate,
};

export default function ResumePDF({ data, sectionOrder, template = "flowcv" }) {
  const TemplateComponent = TEMPLATE_MAP[template] || FlowCVTemplate;
  return <TemplateComponent data={data} sectionOrder={sectionOrder} />;
}
