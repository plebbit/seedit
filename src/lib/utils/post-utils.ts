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

// "best" sort from reddit replies
// https://web.archive.org/web/20100305052116/http://blog.reddit.com/2009/10/reddits-new-comment-sorting-system.html
// https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
// http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
// https://github.com/reddit-archive/reddit/blob/753b17407e9a9dca09558526805922de24133d53/r2/r2/lib/db/_sorts.pyx#L70
export const sortRepliesByBest = (feed: any[]) => {
  const postScores: { [key: string]: number } = {};
  for (const post of feed) {
    let upvoteCount = post.upvoteCount || 0;
    const downvoteCount = post.downvoteCount || 0;

    // n is the total number of ratings
    const n = upvoteCount + downvoteCount;
    if (n === 0) {
      postScores[post.cid] = 0;
      continue;
    }

    // zα/2 is the (1-α/2) quantile of the standard normal distribution
    const z = 1.281551565545;

    // p is the observed fraction of positive ratings
    const p = upvoteCount / n;

    const left = p + (1 / (2 * n)) * z * z;
    const right = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
    const under = 1 + (1 / n) * z * z;
    postScores[post.cid] = (left - right) / under;
  }

  // sort by old first for tiebreaker (like reddit does)
  return feed.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)).sort((a, b) => (postScores[b.cid] || 0) - (postScores[a.cid] || 0));
};
