import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import { FormattingHelpTable } from '../reply-form';
import styles from '../reply-form/reply-form.module.css';
import { alertChallengeVerificationFailed } from '../../lib/utils/challenge-utils';
import challengesStore from '../../hooks/use-challenges';

const { addChallenge } = challengesStore.getState();

interface EditFormProps {
  commentCid: string;
  content: string;
  hideEditForm?: () => void;
  subplebbitAddress: string;
}

const EditForm = ({ commentCid, content, hideEditForm, subplebbitAddress }: EditFormProps) => {
  const { t } = useTranslation();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const [text, setText] = useState(content);

  const comment = useComment({ commentCid });

  const publishCommentEditOptions: PublishCommentEditOptions = {
    commentCid,
    content: text,
    subplebbitAddress,
    onChallenge: (...args: any) => addChallenge([...args, comment]),
    onChallengeVerification: alertChallengeVerificationFailed,
    onError: (error: Error) => {
      console.warn(error);
      alert(error.message);
    },
  };
  const { publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div className={styles.mdContainer}>
      <div className={styles.md}>
        <textarea className={styles.textarea} value={text} ref={textRef} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className={styles.bottomArea}>
        <button
          className={styles.save}
          onClick={() => {
            publishCommentEdit();
            hideEditForm && hideEditForm();
          }}
        >
          {t('save')}
        </button>
        <button
          className={styles.cancel}
          onClick={() => {
            hideEditForm && hideEditForm();
          }}
        >
          {t('cancel')}
        </button>
        <span className={styles.optionsButton} onClick={() => setShowFormattingHelp(!showFormattingHelp)}>
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default EditForm;
