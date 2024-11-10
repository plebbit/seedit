export const getPostScore = (upvoteCount: number, downvoteCount: number, state: string) => {
  if ((upvoteCount === 0 && downvoteCount === 0) || state === 'pending' || state === 'failed') {
    return '•';
  } else if (upvoteCount === undefined || downvoteCount === undefined) {
    return '?';
  }
  return upvoteCount - downvoteCount;
};
