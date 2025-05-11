import ContentSection from "./_components/ContentSection";
import ProfileForm from "./_components/ProfileForm";

export default function PageProfile() {
  return (
    <ContentSection title="Perfil" desc="Configura tu información personal">
      <ProfileForm />
    </ContentSection>
  );
}
