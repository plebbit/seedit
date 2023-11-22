import { useParams } from 'react-router-dom';
import Sidebar from '../../components/sidebar';
import styles from './about.module.css';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';

const About = () => {
  const { commentCid, subplebbitAddress } = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const comment = useComment({ commentCid });
  const { address, createdAt, description, roles, rules, shortAddress, title, updatedAt } = subplebbit || {};
  const { cid, downvoteCount, timestamp, upvoteCount } = comment || {};

  return (
    <div className={styles.content}>
      <Sidebar
        address={address}
        cid={cid}
        createdAt={createdAt}
        description={description}
        downvoteCount={downvoteCount}
        roles={roles}
        rules={rules}
        timestamp={timestamp}
        title={title}
        updatedAt={updatedAt}
        upvoteCount={upvoteCount}
      />
    </div>
  );
};

export default About;
