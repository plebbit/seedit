export const formatScore = (score: number | '•' | '?'): string => {
  if (typeof score !== 'number') {
    return score;
  }

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: score < 100000 ? 1 : 0,
  }).format(score);
};

export const getPostScore = (upvoteCount: number, downvoteCount: number, state: string): '•' | '?' | number => {
  if ((upvoteCount === 0 && downvoteCount === 0) || state === 'pending' || state === 'failed') {
    return '•';
  } else if (upvoteCount === undefined || downvoteCount === undefined) {
    return '?';
  }
  return upvoteCount - downvoteCount;
};

export const getReplyScore = (upvoteCount: number | undefined, downvoteCount: number | undefined): number => {
  // If no votes, return default of 1
  if ((upvoteCount === 0 && downvoteCount === 0) || (upvoteCount === undefined && downvoteCount === undefined)) {
    return 1;
  }

  // If only upvoted once with no downvotes, return 1 (default state)
  if (upvoteCount === 1 && downvoteCount === 0) {
    return 1;
  }

  // Calculate actual score
  return (upvoteCount || 0) - (downvoteCount || 0) + 1;
};
