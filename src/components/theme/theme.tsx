import { FC } from 'react';
import useTheme from '../../hooks/use-theme';
import { useTranslation } from 'react-i18next';

const Theme: FC = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <div style={{ padding: '5px' }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value='light'>{t('light')}</option>
        <option value='dark'>{t('dark')}</option>
      </select>
    </div>
  );
};

export default Theme;
