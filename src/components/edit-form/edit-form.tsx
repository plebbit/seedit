import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import { FormattingHelpTable } from '../reply-form';
import styles from '../reply-form/reply-form.module.css';
import { alertChallengeVerificationFailed } from '../../lib/utils/challenge-utils';
import challengesStore from '../../hooks/use-challenges';
import { create } from 'zustand';

type EditStoreState = {
  commentCid: string | undefined;
  content: string | undefined;
  reason: string | undefined;
  spoiler: boolean | undefined;
  subplebbitAddress: string | undefined;
  publishCommentEditOptions: PublishCommentEditOptions;
  setEditStore: (data: Partial<EditStoreState>) => void;
  resetEditStore: () => void;
};

const { addChallenge } = challengesStore.getState();

const useEditStore = create<EditStoreState>((set) => ({
  commentCid: undefined,
  content: undefined,
  reason: undefined,
  spoiler: undefined,
  subplebbitAddress: undefined,
  publishCommentEditOptions: {},
  setEditStore: ({ commentCid, content, reason, spoiler, subplebbitAddress }) =>
    set((state) => {
      const nextState = { ...state };
      if (commentCid !== undefined) nextState.commentCid = commentCid;
      if (content !== undefined) nextState.content = content;
      if (reason !== undefined) nextState.reason = reason;
      if (spoiler !== undefined) nextState.spoiler = spoiler;
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;

      nextState.publishCommentEditOptions = {
        ...nextState,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
        },
      };
      return nextState;
    }),
  resetEditStore: () =>
    set({ commentCid: undefined, content: undefined, reason: undefined, spoiler: undefined, subplebbitAddress: undefined, publishCommentEditOptions: {} }),
}));

interface EditFormProps {
  commentCid: string;
  content: string;
  hideEditForm?: () => void;
  spoiler?: boolean;
  subplebbitAddress: string;
}

const EditForm = ({ commentCid, content, hideEditForm, spoiler = false, subplebbitAddress }: EditFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const spoilerClass = showOptions ? styles.spoilerVisible : styles.spoilerHidden;

  const textRef = useRef<HTMLTextAreaElement>(null);

  const { setEditStore, resetEditStore, publishCommentEditOptions } = useEditStore();

  // initial values
  useEffect(() => {
    setEditStore({ commentCid, content, spoiler, subplebbitAddress });
    return () => {
      // cleanup
      resetEditStore();
    };
  }, [commentCid, content, spoiler, subplebbitAddress, resetEditStore, setEditStore]);

  const { publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div className={styles.mdContainer}>
      <div className={styles.md}>
        <div className={styles.options}>
          <span className={`${styles.spoiler} ${spoilerClass}`}>
            <label>
              {t('spoiler')}:{' '}
              <input
                type='checkbox'
                className={styles.checkbox}
                checked={publishCommentEditOptions.spoiler}
                onChange={(e) => setEditStore({ spoiler: e.target.checked })}
              />
            </label>
          </span>
        </div>
        <textarea className={styles.textarea} value={publishCommentEditOptions.content} ref={textRef} onChange={(e) => setEditStore({ content: e.target.value })} />
      </div>
      <div className={styles.bottomArea}>
        <span className={styles.editReason}>
          {t('edit_reason')}: <input className={styles.url} onChange={(e) => setEditStore({ reason: e.target.value })} />
        </span>
        <span className={styles.optionsButton} onClick={() => setShowFormattingHelp(!showFormattingHelp)}>
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
        <span className={styles.optionsButton} onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
        <span className={styles.editSaveButtons}>
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
        </span>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default EditForm;
