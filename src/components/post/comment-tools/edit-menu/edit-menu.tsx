import { useEffect, useState } from 'react';
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
  const [publishEdit, setPublishEdit] = useState(false);
  const { publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  useEffect(() => {
    if (publishEdit) {
      publishCommentEdit();
      setPublishEdit(false);
    }
  }, [publishEdit, publishCommentEdit]);

  const deleteComment = () => {
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
