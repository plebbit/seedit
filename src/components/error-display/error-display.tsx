import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../lib/utils/clipboard-utils';
import styles from './error-display.module.css';

const ErrorDisplay = ({ error }: { error: any }) => {
  const { t } = useTranslation();
  const [feedbackMessageKey, setFeedbackMessageKey] = useState<string | null>(null);

  const originalDisplayMessage = error?.message ? `${t('error')}: ${error.message}` : null;

  const handleMessageClick = async () => {
    if (!error || !error.message || feedbackMessageKey) return;

    const errorString = JSON.stringify(error, null, 2);
    try {
      await copyToClipboard(errorString);
      setFeedbackMessageKey('copied');
      setTimeout(() => {
        setFeedbackMessageKey(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy error: ', err);
      setFeedbackMessageKey('failed');
      setTimeout(() => {
        setFeedbackMessageKey(null);
      }, 1500);
    }
  };

  let currentDisplayMessage = '';
  const classNames = [styles.errorMessage];
  let isClickable = false;

  if (feedbackMessageKey === 'copied') {
    currentDisplayMessage = t('fullErrorCopiedToClipboard', 'full error copied to the clipboard');
    classNames.pop();
    classNames.push(styles.feedbackSuccessMessage);
  } else if (feedbackMessageKey === 'failed') {
    currentDisplayMessage = t('copyFailed', 'copy failed');
  } else if (originalDisplayMessage) {
    currentDisplayMessage = originalDisplayMessage;
    isClickable = true;
    classNames.push(styles.clickableErrorMessage);
  }

  return (
    (error?.message || error?.stack || error?.details || error) && (
      <div className={styles.error}>
        {currentDisplayMessage && (
          <span
            className={classNames.join(' ')}
            onClick={isClickable ? handleMessageClick : undefined}
            title={isClickable ? t('clickToCopyFullError', 'Click to copy full error') : undefined}
          >
            {currentDisplayMessage}
          </span>
        )}
      </div>
    )
  );
};

export default ErrorDisplay;
