import ContentSection from "../_components/ContentSection";
import SecurityForm from "./_components/SecurityForm";

export default function PageSecurity() {
  return (
    <ContentSection title="Seguridad" desc="Configura tus credenciales de seguridad">
      <SecurityForm />
    </ContentSection>
  );
}
