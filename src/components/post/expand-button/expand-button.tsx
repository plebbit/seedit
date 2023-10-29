import React, { FC, useMemo } from 'react';
import { useComment } from '@plebbit/plebbit-react-hooks';
import styles from './expand-button.module.css';
import utils from '../../../lib/utils';

interface ExpandButtonProps {
  commentCid: string;
  expanded: boolean;
  hasThumbnail: boolean;
  toggleExpanded: () => void;
}

const ExpandButton: FC<ExpandButtonProps> = ({ commentCid, expanded, hasThumbnail, toggleExpanded }) => {
  const comment = useComment({ commentCid });
  const { content, link } = comment || {};
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(comment);

  const initialButtonType = useMemo(() => {
    return hasThumbnail || commentMediaInfo?.type === 'audio' || commentMediaInfo?.type === 'iframe' ? 'playButton' : 'textButton';
  }, [hasThumbnail, commentMediaInfo]);

  const buttonType = useMemo(() => {
    return expanded ? 'closeButton' : initialButtonType;
  }, [expanded, initialButtonType]);

  return (
    ((content && !link) || link) && (
      <div className={styles.buttonWrapper} onClick={toggleExpanded}>
        <div className={`${styles.buttonCommon} ${styles[buttonType]}`}></div>
      </div>
    )
  );
};

export default React.memo(ExpandButton);
