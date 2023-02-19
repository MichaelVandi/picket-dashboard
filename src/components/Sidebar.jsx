import { NavLink } from "react-router-dom";
import s from "./../styles/Icons.module.css"
import { HomeIcon, DashboardIcon, SettingsIcon} from "./Icons";
// PostsIcon, CommunityIcon, MessageIcon, MediaIcon MoonIcon,
import Toggle from "./Theme/Toggle";
import { useDarkMode } from "./Theme/useDarkMode";
import { lightTheme, darkTheme } from "./Theme/Themes";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./Theme/GlobalStyles";

const Sidebar = () => {
  const [theme, themeToggler, mountedComponent] = useDarkMode();
  const themeMode = theme === "light" ? lightTheme : darkTheme;
  const disabled = (e) => e.preventDefault();

  if (!mountedComponent) return <div />;

  return <aside className="background-color">
    <ThemeProvider theme={themeMode}>
      <>
        <GlobalStyles />
        <div className={s.fixed}>
          <div>
            <NavLink to="/home" onClick={(e) => disabled(e)} activeClassName={s.active}></NavLink>
           
            <NavLink to="/settings" onClick={(e) => disabled(e)} activeClassName={s.active}></NavLink>
          </div>
        </div>
      </>
    </ThemeProvider>
  </aside>
}

export default Sidebar;