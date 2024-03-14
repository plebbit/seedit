import { useState } from 'react';
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
      alert(error.message);
    },
  };

  const [publishCommentEditOptions, setPublishCommentEditOptions] = useState(defaultPublishOptions);
  const { publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  const deleteComment = async () => {
    if (deleted) {
      if (window.confirm('Are you sure you want to undelete this post?')) {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: false }));
        await publishCommentEdit();
      } else {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: true }));
      }
    } else {
      if (window.confirm('Are you sure you want to delete this post?')) {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: true }));
        await publishCommentEdit();
      } else {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: false }));
      }
    }
  };

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
        <span onClick={() => commentCid && deleteComment()}>{deleted ? t('undelete') : t('delete')}</span>
      </li>
    </>
  );
};

export default EditMenu;
