import styles from './expand-button.module.css';
import { CommentMediaInfo } from '../../../lib/utils';

interface ExpandButtonProps {
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  expanded: boolean;
  hasThumbnail: boolean;
  link?: string;
  toggleExpanded: () => void;
}

const ExpandButton = ({ commentMediaInfo, content, expanded, hasThumbnail, link, toggleExpanded }: ExpandButtonProps) => {
  const initialButtonType = hasThumbnail || commentMediaInfo?.type === 'audio' || commentMediaInfo?.type === 'iframe' ? 'playButton' : 'textButton';

  const buttonType = expanded ? 'closeButton' : initialButtonType;

  return (
    ((content && !link) || link) && (
      <div className={styles.buttonWrapper} onClick={toggleExpanded}>
        <div className={`${styles.buttonCommon} ${styles[buttonType]}`}></div>
      </div>
    )
  );
};

export default ExpandButton;
