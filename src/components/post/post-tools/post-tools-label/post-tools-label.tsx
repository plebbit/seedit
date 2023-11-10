import styles from './post-tools-label.module.css';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';

interface PostToolsLabelProps {
  commentCid: string;
}

const PostToolsLabel = ({ commentCid }: PostToolsLabelProps) => {
  const comment = useComment({ commentCid });
  const { spoiler } = comment;
  const { t } = useTranslation();

  return (
    <li>
      <span className={styles.stamp}>
        <span className={styles.content}>{spoiler && t('spoiler').toUpperCase()}</span>
      </span>
    </li>
  );
};

export default PostToolsLabel;
