import { useEffect, useState } from 'react';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import styles from './mod-menu.module.css';
import { alertChallengeVerificationFailed } from '../../../../lib/utils/challenge-utils';
import challengesStore from '../../../../hooks/use-challenges';

const { addChallenge } = challengesStore.getState();

type ModToolsProps = {
  cid: string;
};

const ModTools = ({ cid }: ModToolsProps) => {
  const { t } = useTranslation();
  const post = useComment({ commentCid: cid });
  const isReply = post?.parentCid;
  const [isModToolsOpen, setIsModToolsOpen] = useState(false);

  const defaultPublishOptions: PublishCommentEditOptions = {
    removed: post?.removed,
    locked: post?.locked,
    spoiler: post?.spoiler,
    pinned: post?.pinned,
    commentCid: post?.cid,
    subplebbitAddress: post?.subplebbitAddress,
    onChallenge: (...args: any) => addChallenge([...args, post]),
    onChallengeVerification: alertChallengeVerificationFailed,
    onError: (error: Error) => {
      console.warn(error);
      alert(error.message);
    },
  };

  const [publishCommentEditOptions, setPublishCommentEditOptions] = useState(defaultPublishOptions);
  const { state, publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  // close the modal after publishing
  useEffect(() => {
    if (state && state !== 'failed' && state !== 'initializing' && state !== 'ready') {
      setIsModToolsOpen(false);
    }
  }, [state, setIsModToolsOpen]);

  const onCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => setPublishCommentEditOptions((state) => ({ ...state, [e.target.id]: e.target.checked }));

  const onReason = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPublishCommentEditOptions((state) => ({ ...state, reason: e.target.value ? e.target.value : undefined }));

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isModToolsOpen,
    onOpenChange: setIsModToolsOpen,
    middleware: [offset(2), flip({ fallbackAxisSideDirection: 'end' }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const headingId = useId();

  return (
    <>
      <li className={styles.button} ref={refs.setReference} {...getReferenceProps()}>
        <span onClick={() => setIsModToolsOpen(!isModToolsOpen)}>{t('moderation')}</span>
      </li>
      {isModToolsOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.modTools}>
              <div className={styles.menuItem}>
                <label>
                  <input onChange={onCheckbox} checked={publishCommentEditOptions.removed} type='checkbox' id='removed' />
                  {t('removed')}
                </label>
              </div>
              {!isReply && (
                <div className={styles.menuItem}>
                  <label>
                    <input onChange={onCheckbox} checked={publishCommentEditOptions.locked} type='checkbox' id='locked' />
                    {t('locked')}
                  </label>
                </div>
              )}
              <div className={styles.menuItem}>
                <label>
                  <input onChange={onCheckbox} checked={publishCommentEditOptions.spoiler} type='checkbox' id='spoiler' />
                  {t('spoiler')}
                </label>
              </div>
              <div className={styles.menuItem}>
                <label>
                  <input onChange={onCheckbox} checked={publishCommentEditOptions.pinned} type='checkbox' id='pinned' />
                  {t('announcement')}
                </label>
              </div>
              <div className={`${styles.menuItem} ${styles.menuReason}`}>
                {t('reason')} <span className={styles.optional}>({t('optional')})</span>
                <input type='text' onChange={onReason} defaultValue={post?.reason} size={14} />
              </div>
              <div className={styles.bottom}>
                <button onClick={publishCommentEdit}>{t('save')}</button>
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default ModTools;
