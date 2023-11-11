import { useEffect } from 'react';
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

  useEffect(() => {
    if (isReplyingToReply && textRef.current) {
      textRef.current.focus();
    }
  }, [isReplyingToReply, textRef]);

  return (
    <div className={styles.mdContainer} style={{marginLeft: isReplyingToReply ? '25px' : ''}}>
      <div className={styles.md}>
        <input className={styles.url} ref={urlRef} placeholder={`url (${t('optional')})`} />
        <span className={styles.spoiler}>
          <label>
            {t('spoiler')}: <input type='checkbox' className={styles.checkbox} ref={spoilerRef} />
          </label>
        </span>
        <textarea className={styles.textarea} ref={textRef} placeholder={t('text')} />
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
      </div>
    </div>
  );
};

export default ReplyForm;
