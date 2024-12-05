import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { getCommentMediaInfo, fetchWebpageThumbnailIfNeeded } from '../lib/utils/media-utils';
import { isPendingView, isPostView } from '../lib/utils/view-utils';

export const useCommentMediaInfo = (comment: Comment) => {
  const location = useLocation();
  const params = useParams();
  const isInPostView = isPostView(location.pathname, params);
  const isInPendingView = isPendingView(location.pathname, params);
  // some sites have CORS access, so the thumbnail can be fetched client-side, which is helpful if subplebbit.settings.fetchThumbnailUrls is false
  const initialCommentMediaInfo = useMemo(() => getCommentMediaInfo(comment), [comment]);
  const [commentMediaInfo, setCommentMediaInfo] = useState(initialCommentMediaInfo);
  const fetchThumbnail = useCallback(async () => {
    if (!isInPostView && !isInPendingView) {
      return; // don't fetch in feed view, it displaces the posts
    }
    if (initialCommentMediaInfo?.type === 'webpage' && !initialCommentMediaInfo.thumbnail) {
      const newMediaInfo = await fetchWebpageThumbnailIfNeeded(initialCommentMediaInfo);
      setCommentMediaInfo(newMediaInfo);
    }
  }, [initialCommentMediaInfo, isInPostView, isInPendingView]);
  useEffect(() => {
    fetchThumbnail();
  }, [fetchThumbnail]);

  return commentMediaInfo;
};
