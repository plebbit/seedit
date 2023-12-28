import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './reply-form.module.css';
import useReply from '../../hooks/use-reply';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { isValidURL } from '../../lib/utils/url-utils';

type ReplyFormProps = {
  cid: string;
  isReplyingToReply?: boolean;
  hideReplyForm?: () => void;
};

const ReplyForm = ({ cid, isReplyingToReply, hideReplyForm }: ReplyFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const reply = useComment({ commentCid: cid });
  const { setContent, resetContent, replyIndex, publishReply } = useReply(reply);

  const mdContainerClass = isReplyingToReply ? `${styles.mdContainer} ${styles.mdContainerReplying}` : styles.mdContainer;
  const urlClass = showOptions ? styles.urlVisible : styles.urlHidden;
  const spoilerClass = showOptions ? styles.spoilerVisible : styles.spoilerHidden;

  const textRef = useRef<HTMLTextAreaElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const spoilerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isReplyingToReply && textRef.current) {
      textRef.current.focus();
    }
  }, [isReplyingToReply, textRef]);

  const resetFields = () => {
    if (textRef.current) {
      textRef.current.value = '';
    }
    if (urlRef.current) {
      urlRef.current.value = '';
    }
    if (spoilerRef.current) {
      spoilerRef.current.checked = false;
    }
  };

  const onPublish = () => {
    const currentContent = textRef.current?.value || '';
    const currentUrl = urlRef.current?.value || '';

    if (!currentContent.trim() && !currentUrl) {
      alert(`missing content or url`);
      return;
    }

    if (currentUrl && !isValidURL(currentUrl)) {
      alert('The provided link is not a valid URL.');
      return;
    }
    publishReply();
  };

  useEffect(() => {
    if (typeof replyIndex === 'number') {
      resetContent();

      if (hideReplyForm) {
        hideReplyForm();
      }

      resetFields();
    }
  }, [replyIndex, resetContent, hideReplyForm]);

  return (
    <div className={mdContainerClass}>
      <div className={styles.md}>
        <div className={styles.options}>
          <span className={urlClass}>
            {t('media_url')}: <input className={`${styles.url} ${urlClass}`} ref={urlRef} onChange={(e) => setContent.link(e.target.value)} />
          </span>
          <span className={`${styles.spoiler} ${spoilerClass}`}>
            <label>
              {t('spoiler')}: <input type='checkbox' className={styles.checkbox} ref={spoilerRef} onChange={(e) => setContent.spoiler(e.target.checked)} />
            </label>
          </span>
        </div>
        <textarea className={styles.textarea} ref={textRef} onChange={(e) => setContent.content(e.target.value)} />
      </div>
      <div className={styles.bottomArea}>
        <button className={styles.save} onClick={onPublish}>
          {t('save')}
        </button>
        {isReplyingToReply && (
          <button className={styles.cancel} onClick={hideReplyForm}>
            {t('cancel')}
          </button>
        )}
        <span className={styles.optionsButton} onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
      </div>
    </div>
  );
};

export default ReplyForm;
