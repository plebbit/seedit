import { useEffect, useState } from 'react';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import styles from './edit-menu.module.css';
import { alertChallengeVerificationFailed } from '../../../../lib/utils/challenge-utils';
import challengesStore from '../../../../hooks/use-challenges';

const { addChallenge } = challengesStore.getState();

type EditMenuProps = {
  cid: string;
  showEditForm?: () => void;
};

const EditMenu = ({ cid, showEditForm }: EditMenuProps) => {
  const { t } = useTranslation();

  let post: any;
  const comment = useComment({ commentCid: cid });
  const { editedComment } = useEditedComment({ comment });
  if (editedComment) {
    post = editedComment;
  } else if (comment) {
    post = comment;
  }

  const { content, deleted, spoiler, subplebbitAddress } = post || {};
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);

  const defaultPublishOptions: PublishCommentEditOptions = {
    commentCid: cid,
    content,
    deleted,
    spoiler,
    subplebbitAddress,
    onChallenge: (...args: any) => addChallenge([...args, post]),
    onChallengeVerification: alertChallengeVerificationFailed,
    onError: (error: Error) => {
      console.warn(error);
      alert(error.message);
    },
  };

  const [publishCommentEditOptions, setPublishCommentEditOptions] = useState(defaultPublishOptions);
  const [publishEdit, setPublishEdit] = useState(false);
  const { state, publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  useEffect(() => {
    if (publishEdit) {
      publishCommentEdit();
      setPublishEdit(false);
    }
  }, [publishEdit, publishCommentEdit]);

  // close the modal after publishing
  useEffect(() => {
    if (state && state !== 'failed' && state !== 'initializing' && state !== 'ready') {
      setIsEditMenuOpen(false);
    }
  }, [state, setIsEditMenuOpen]);

  const deleteComment = () => {
    setIsEditMenuOpen(false);
    if (deleted) {
      if (window.confirm('Are you sure you want to undelete this post?')) {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: false }));
        setPublishEdit(true);
      } else {
        return;
      }
    } else {
      if (window.confirm('Are you sure you want to delete this post?')) {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: true }));
        setPublishEdit(true);
      }
    }
  };

  const markAsSpoiler = () => {
    setIsEditMenuOpen(false);
    if (spoiler) {
      if (window.confirm('Are you sure you want to remove the spoiler tag from this post?')) {
        setPublishCommentEditOptions((state) => ({ ...state, spoiler: false }));
        setPublishEdit(true);
      } else {
        return;
      }
    } else {
      if (window.confirm('Are you sure you want to mark this post as a spoiler?')) {
        setPublishCommentEditOptions((state) => ({ ...state, spoiler: true }));
        setPublishEdit(true);
      }
    }
  };

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isEditMenuOpen,
    onOpenChange: setIsEditMenuOpen,
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
        <span onClick={() => setIsEditMenuOpen(!isEditMenuOpen)}>{t('edit')}</span>
      </li>
      {isEditMenuOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.menu}>
              <div
                className={styles.menuItem}
                onClick={() => {
                  showEditForm && showEditForm();
                  setIsEditMenuOpen(false);
                }}
              >
                {t('edit_content')}
              </div>
              <div className={styles.menuItem} onClick={markAsSpoiler}>
                {spoiler ? t('remove_spoiler') : t('mark_spoiler')}
              </div>
              <div className={styles.menuItem} onClick={deleteComment}>
                {deleted ? t('undo_delete') : t('delete_post')}
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default EditMenu;
