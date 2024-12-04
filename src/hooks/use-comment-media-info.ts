import { useCallback, useEffect, useMemo, useState } from 'react';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { getCommentMediaInfo, fetchWebpageThumbnailIfNeeded } from '../lib/utils/media-utils';

export const useCommentMediaInfo = (comment: Comment) => {
  // some sites have CORS access, so the thumbnail can be fetched client-side, which is helpful if subplebbit.settings.fetchThumbnailUrls is false
  const initialCommentMediaInfo = useMemo(() => getCommentMediaInfo(comment), [comment]);
  const [commentMediaInfo, setCommentMediaInfo] = useState(initialCommentMediaInfo);
  const fetchThumbnail = useCallback(async () => {
    if (initialCommentMediaInfo?.type === 'webpage' && !initialCommentMediaInfo.thumbnail) {
      const newMediaInfo = await fetchWebpageThumbnailIfNeeded(initialCommentMediaInfo);
      setCommentMediaInfo(newMediaInfo);
    }
  }, [initialCommentMediaInfo]);
  useEffect(() => {
    fetchThumbnail();
  }, [fetchThumbnail]);

  return commentMediaInfo;
};
