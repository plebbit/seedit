import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './error-display.module.css';

const ErrorDisplay = ({ error }: { error: any }) => {
  const { t } = useTranslation();
  const [showFullError, setShowFullError] = useState(false);

  return (
    (error?.message || error?.stack || error?.details) && (
      <div className={styles.error}>
        <br />
        <span>
          {error?.message && (
            <span className={styles.errorMessage}>
              {t('error')}: {error.message}
            </span>
          )}
          {(error?.stack || error?.details) && (
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
            {error?.stack && (
              <>
                <br />
                <div className={styles.errorStack}>Stack: {error.stack}</div>
              </>
            )}
            {error?.details && (
              <>
                <br />
                <div className={styles.errorStack}>Details: {JSON.stringify(error?.details, null, 2)}</div>
              </>
            )}
          </>
        )}
      </div>
    )
  );
};

export default ErrorDisplay;
