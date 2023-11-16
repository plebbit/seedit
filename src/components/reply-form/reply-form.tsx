import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './reply-form.module.css';

type ReplyFormProps = {
  isReplyingToReply?: boolean;
  onPublish: () => void;
  hideReplyForm?: () => void;
  spoilerRef: React.RefObject<HTMLInputElement>;
  textRef: React.RefObject<HTMLTextAreaElement>;
  urlRef: React.RefObject<HTMLInputElement>;
};

const ReplyForm = ({ isReplyingToReply, onPublish, hideReplyForm, spoilerRef, textRef, urlRef }: ReplyFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const mdContainerClass = isReplyingToReply ? `${styles.mdContainer} ${styles.mdContainerReplying}` : styles.mdContainer;
  const urlClass = showOptions ? styles.urlVisible : styles.urlHidden;
  const spoilerClass = showOptions ? styles.spoilerVisible : styles.spoilerHidden;

  useEffect(() => {
    if (isReplyingToReply && textRef.current) {
      textRef.current.focus();
    }
  }, [isReplyingToReply, textRef]);

  return (
    <div className={mdContainerClass}>
      <div className={styles.md}>
        <input className={`${styles.url} ${urlClass}`} ref={urlRef} placeholder='url' />
        <span className={`${styles.spoiler} ${spoilerClass}`}>
          <label>
            {t('spoiler')}: <input type='checkbox' className={styles.checkbox} ref={spoilerRef} />
          </label>
        </span>
        <textarea className={styles.textarea} ref={textRef} />
      </div>
      <div className={styles.bottomArea}>
        <button className={styles.save} onClick={onPublish}>
          {t('post_save')}
        </button>
        {isReplyingToReply && (
          <button className={styles.cancel} onClick={hideReplyForm}>
            {t('cancel')}
          </button>
        )}
        <span className={styles.options} onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
      </div>
    </div>
  );
};

export default ReplyForm;
