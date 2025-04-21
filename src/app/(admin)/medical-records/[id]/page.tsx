import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MedicalRecordPage({ params }: PageProps) {
  const { id } = await params;

  // Redirect to the details page
  redirect(`/medical-records/${id}/details`);
}
