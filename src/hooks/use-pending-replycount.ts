import { useCallback } from 'react';
import { Comment, useAccountComments } from '@plebbit/plebbit-react-hooks';

type PendingReplyCountProps = {
  parentCommentCid: string | undefined;
};

export const usePendingReplyCount = ({ parentCommentCid }: PendingReplyCountProps) => {
  const filter = useCallback((comment: Comment) => comment.parentCid === parentCommentCid, [parentCommentCid]);
  const comments = useAccountComments({ filter });
  const pendingReplyCount = comments.accountComments.length;

  return pendingReplyCount;
};
