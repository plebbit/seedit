import useThemeStore from '../stores/use-theme-store';

const useTheme = (): [string, (theme: string) => void] => {
  const { theme, setTheme } = useThemeStore();
  return [theme, setTheme];
};

export default useTheme;
