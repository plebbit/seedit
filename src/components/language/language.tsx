import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const Language: FC = () => {
  const { i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const availableLanguages = ['en', 'it'];

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <div style={{ padding: '5px' }}>
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Language;
