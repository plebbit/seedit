import { FC } from 'react';
import Header from '../../header';
import Post from '../../post';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { useParams } from 'react-router-dom';

const Comments: FC = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });

  return (
    <>
      <Header />
      <Post post={comment} />
    </>
  );
};

export default Comments;
