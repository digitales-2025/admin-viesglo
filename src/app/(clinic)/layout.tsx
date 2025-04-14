export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>Clinic</h1>
      {children}
    </div>
  );
}
