import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import styles from './edit-menu.module.css';
import { alertChallengeVerificationFailed } from '../../../../lib/utils/challenge-utils';
import challengesStore from '../../../../hooks/use-challenges';

const { addChallenge } = challengesStore.getState();

type EditMenuProps = {
  cid: string;
  showCommentEditForm?: () => void;
  spoiler?: boolean;
};

const EditMenu = ({ cid, showCommentEditForm }: EditMenuProps) => {
  const { t } = useTranslation();

  let post: any;
  const comment = useComment({ commentCid: cid });
  const { editedComment } = useEditedComment({ comment });
  if (editedComment) {
    post = editedComment;
  } else if (comment) {
    post = comment;
  }

  const { content, deleted, subplebbitAddress } = post || {};

  const defaultPublishOptions: PublishCommentEditOptions = {
    commentCid: cid,
    content,
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

  const deleteComment = () => {
    if (deleted) {
      setPublishCommentEditOptions((state) => ({ ...state, deleted: false }));
      if (window.confirm('Are you sure you want to undelete this post?')) {
        publishCommentEdit();
      } else {
        setPublishCommentEditOptions((state) => ({ ...state, deleted: true }));
      }
    } else {
      setPublishCommentEditOptions((state) => ({ ...state, deleted: true }));
      if (window.confirm('Are you sure you want to delete this post?')) {
        publishCommentEdit();
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
            showCommentEditForm && showCommentEditForm();
          }}
        >
          {t('edit')}
        </span>
      </li>
      <li className={styles.button}>
        <span onClick={deleteComment}>{t('delete')}</span>
      </li>
    </>
  );
};

export default EditMenu;
