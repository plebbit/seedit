import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './error-display.module.css';

const ErrorDisplay = ({ error }: { error: Error | null }) => {
  const { t } = useTranslation();
  const [showFullError, setShowFullError] = useState(false);

  return (
    (error?.message || error?.stack) && (
      <div className={styles.error}>
        <br />
        <span>
          {error?.message && (
            <span className={styles.errorMessage}>
              {t('error')}: {error.message}
            </span>
          )}
          {error?.stack && (
            <>
              {' — '}
              <span className={styles.showFullErrorButton} onClick={() => setShowFullError(!showFullError)}>
                {showFullError ? 'hide' : 'show'} full error
              </span>
            </>
          )}
        </span>
        {showFullError && (
          <>
            <br />
            <div className={styles.errorStack}>{error.stack}</div>
          </>
        )}
      </div>
    )
  );
};

export default ErrorDisplay;
