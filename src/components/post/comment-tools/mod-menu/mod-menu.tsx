import { useState } from 'react';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import styles from './mod-menu.module.css';
import { alertChallengeVerificationFailed } from '../../../../lib/utils/challenge-utils';
import challengesStore from '../../../../hooks/use-challenges';

const { addChallenge } = challengesStore.getState();

type ModMenuProps = {
  cid: string;
  isCommentAuthorMod?: boolean;
};

const ModMenu = ({ cid, isCommentAuthorMod }: ModMenuProps) => {
  const { t } = useTranslation();

  let post: any;
  const comment = useComment({ commentCid: cid });
  const { editedComment } = useEditedComment({ comment });
  if (editedComment) {
    post = editedComment;
  } else if (comment) {
    post = comment;
  }
  const isReply = post?.parentCid;
  const [isModMenuOpen, setIsModMenuOpen] = useState(false);

  const defaultPublishOptions: PublishCommentEditOptions = {
    removed: post?.removed,
    locked: post?.locked,
    spoiler: post?.spoiler,
    pinned: post?.pinned,
    commentAuthor: { banExpiresAt: post?.banExpiresAt },
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
  const { publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  const [banDuration, setBanDuration] = useState(1);

  const daysToTimestampInSeconds = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return Math.floor(now.getTime() / 1000);
  };

  const onCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    if (id === 'banUser') {
      setPublishCommentEditOptions((state) => ({
        ...state,
        commentAuthor: { ...state.commentAuthor, banExpiresAt: checked ? daysToTimestampInSeconds(banDuration) : undefined },
      }));
    } else {
      setPublishCommentEditOptions((state) => ({ ...state, [id]: checked }));
    }
  };

  const onBanDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value, 10) || 1;
    setBanDuration(days);
    setPublishCommentEditOptions((state) => ({
      ...state,
      commentAuthor: { ...state.commentAuthor, banExpiresAt: daysToTimestampInSeconds(days) },
    }));
  };

  const onReason = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPublishCommentEditOptions((state) => ({ ...state, reason: e.target.value ? e.target.value : undefined }));

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isModMenuOpen,
    onOpenChange: setIsModMenuOpen,
    middleware: [offset(2), flip({ fallbackAxisSideDirection: 'end' }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const headingId = useId();

  const handleSaveClick = async () => {
    await publishCommentEdit();
    setIsModMenuOpen(false);
  };

  return (
    <>
      <li className={styles.button} ref={refs.setReference} {...(cid && getReferenceProps())}>
        <span onClick={() => cid && setIsModMenuOpen(!isModMenuOpen)}>{t('moderation')}</span>
      </li>
      {isModMenuOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.ModMenu}>
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
                  {isReply ? t('stickied_comment') : t('announcement')}
                </label>
              </div>
              {!isCommentAuthorMod && (
                <div className={styles.menuItem}>
                  <label>
                    <input onChange={onCheckbox} checked={!!publishCommentEditOptions.commentAuthor?.banExpiresAt} type='checkbox' id='banUser' />
                    <Trans
                      i18nKey='ban_user_for'
                      shouldUnescape={true}
                      components={{ 1: <input className={styles.banInput} onChange={onBanDurationChange} type='number' min={1} max={100} defaultValue={banDuration} /> }}
                    />
                  </label>
                </div>
              )}
              <div className={`${styles.menuItem} ${styles.menuReason}`}>
                {t('reason')} <span className={styles.optional}>({t('optional')})</span>
                <input type='text' onChange={onReason} defaultValue={post?.reason} size={14} />
              </div>
              <div className={styles.bottom}>
                <button onClick={handleSaveClick}>{t('save')}</button>
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default ModMenu;
