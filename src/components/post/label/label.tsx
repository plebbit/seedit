import { useTranslation } from 'react-i18next';
import styles from './label.module.css';

interface LabelProps {
  color: string;
  text: string;
}

const Label = ({ color, text }: LabelProps) => {
  const { t } = useTranslation();

  return <span className={`${styles.stamp} ${styles[color]}`}>{t(text)}</span>;
};

export default Label;
