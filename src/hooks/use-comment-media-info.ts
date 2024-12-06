import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { getCommentMediaInfo, fetchWebpageThumbnailIfNeeded } from '../lib/utils/media-utils';
import { isPendingPostView, isPostPageView } from '../lib/utils/view-utils';

export const useCommentMediaInfo = (comment: Comment) => {
  const location = useLocation();
  const params = useParams();
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  // some sites have CORS access, so the thumbnail can be fetched client-side, which is helpful if subplebbit.settings.fetchThumbnailUrls is false
  const initialCommentMediaInfo = useMemo(() => getCommentMediaInfo(comment), [comment]);
  const [commentMediaInfo, setCommentMediaInfo] = useState(initialCommentMediaInfo);
  const fetchThumbnail = useCallback(async () => {
    if (!isInPostPageView && !isInPendingPostView) {
      return; // don't fetch in feed view, it displaces the posts
    }
    if (initialCommentMediaInfo?.type === 'webpage' && !initialCommentMediaInfo.thumbnail) {
      const newMediaInfo = await fetchWebpageThumbnailIfNeeded(initialCommentMediaInfo);
      setCommentMediaInfo(newMediaInfo);
    }
  }, [initialCommentMediaInfo, isInPostPageView, isInPendingPostView]);
  useEffect(() => {
    fetchThumbnail();
  }, [fetchThumbnail]);

  return commentMediaInfo;
};
