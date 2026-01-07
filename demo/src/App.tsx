import { useAppContext } from "./contexts/AppContext";
import { Header } from "./components/Header";

export const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useAppContext();

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  return (
    <div className={`${theme} bg-background text-foreground`}>
      <Header theme={theme} onThemeChange={handleThemeChange} />
      {children}
    </div>
  );
};
