import { Header } from "./Header";
import { Main } from "./Main";
import { ProfileDropdown } from "./ProfileDropdown";
import { Search } from "./Search";
import { ThemeSwitch } from "./ThemeSwitch";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>{children}</Main>
    </>
  );
}

export function ShellHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">{children}</div>;
}

export function ShellTitle({ title, description }: { title?: string; description?: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
