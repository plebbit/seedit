import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import styles from './edit-menu.module.css';
import { alertChallengeVerificationFailed } from '../../../../lib/utils/challenge-utils';
import challengesStore from '../../../../hooks/use-challenges';

const { addChallenge } = challengesStore.getState();

type EditMenuProps = {
  commentCid: string;
  showCommentEditForm?: () => void;
};

const EditMenu = ({ commentCid, showCommentEditForm }: EditMenuProps) => {
  const { t } = useTranslation();

  let post: any;
  const comment = useComment({ commentCid });
  const { editedComment } = useEditedComment({ comment });
  if (editedComment) {
    post = editedComment;
  } else if (comment) {
    post = comment;
  }

  const { deleted, subplebbitAddress } = post || {};

  const defaultPublishOptions: PublishCommentEditOptions = {
    commentCid,
    deleted,
    subplebbitAddress,
    onChallenge: (...args: any) => addChallenge([...args, post]),
    onChallengeVerification: alertChallengeVerificationFailed,
    onError: (error: Error) => {
      console.warn(error);
      alert('Comment edit failed. ' + error.message);
    },
  };

  const [publishOptions, setPublishOptions] = useState(defaultPublishOptions);
  const { publishCommentEdit } = usePublishCommentEdit(publishOptions);

  const deleteComment = useCallback(() => {
    const newDeletedState = !deleted;
    const confirmMessage = deleted ? t('sure_undelete') : t('sure_delete');

    if (window.confirm(confirmMessage)) {
      setPublishOptions((prevOptions) => ({
        ...prevOptions,
        deleted: newDeletedState,
      }));
    }
  }, [deleted, t]);

  useEffect(() => {
    if (publishOptions.deleted !== defaultPublishOptions.deleted) {
      publishCommentEdit();
    }
  }, [publishOptions, publishCommentEdit, defaultPublishOptions.deleted]);

  return (
    <>
      <li className={styles.button}>
        <span
          onClick={() => {
            showCommentEditForm && commentCid && showCommentEditForm();
          }}
        >
          {t('edit')}
        </span>
      </li>
      <li className={styles.button}>
        <span onClick={deleteComment}>{deleted ? t('undelete') : t('delete')}</span>
      </li>
    </>
  );
};

export default EditMenu;
