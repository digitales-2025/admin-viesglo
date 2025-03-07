import { Header } from "./Header";
import { Main } from "./Main";
import { ProfileDropdown } from "./ProfileDropdown";
import { Search } from "./Search";
import { ThemeSwitch } from "./ThemeSwitch";

export default function Shell({ children }: { children: React.ReactNode }) {
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
