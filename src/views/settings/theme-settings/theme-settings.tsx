import useTheme from "../../../hooks/use-theme";
import { useTranslation } from "react-i18next";

const ThemeSettings = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value='light'>{t('light')}</option>
      <option value='dark'>{t('dark')}</option>
    </select>
  );
};

export default ThemeSettings;
