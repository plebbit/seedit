import { Comment } from '@plebbit/plebbit-react-hooks';
import extName from 'ext-name';
import { canEmbed } from '../../components/post/embed';
import memoize from 'memoizee';
import { isValidURL } from './url-utils';

export interface CommentMediaInfo {
  url: string;
  type: string;
  thumbnail?: string;
  patternThumbnailUrl?: string;
}

export const getHasThumbnail = (commentMediaInfo: CommentMediaInfo | undefined, link: string | undefined): boolean => {
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;
  return link &&
    commentMediaInfo &&
    (commentMediaInfo.type === 'image' ||
      commentMediaInfo.type === 'video' ||
      commentMediaInfo.type === 'gif' ||
      (commentMediaInfo.type === 'webpage' && commentMediaInfo.thumbnail) ||
      (commentMediaInfo.type === 'iframe' && iframeThumbnail))
    ? true
    : false;
};

// check for custom youtube urls like invidious instances
let customUrlCache = new Map();
export const isCustomYoutubeUrl = (parsedUrl: URL): boolean => {
  const urlString = parsedUrl.toString();
  if (customUrlCache.has(urlString)) {
    return customUrlCache.get(urlString);
  }
  const isCustom = parsedUrl.host.startsWith('yt.') && parsedUrl.pathname.includes('/watch') && parsedUrl.searchParams.has('v');
  customUrlCache.set(urlString, isCustom);
  return isCustom;
};

const getYouTubeVideoId = (url: URL): string | null => {
  if (url.host.includes('youtu.be')) {
    return url.pathname.slice(1);
  } else if (url.searchParams.has('v')) {
    return url.searchParams.get('v');
  } else if (isCustomYoutubeUrl(url)) {
    return url.searchParams.get('v');
  }
  return null;
};

const getPatternThumbnailUrl = (url: URL): string | undefined => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }
  if (url.host.includes('streamable.com')) {
    const videoId = url.pathname.split('/')[1];
    return `https://cdn-cf-east.streamable.com/image/${videoId}.jpg`;
  }
};

const getLinkMediaInfo = (link: string): CommentMediaInfo | undefined => {
  if (!isValidURL(link)) {
    return;
  }
  const url = new URL(link);
  let patternThumbnailUrl: string | undefined;
  let type: string = 'webpage';
  let mime: string | undefined;

  // Check for common dynamic image URL patterns
  if (link.includes('/_next/image?')) {
    // Next.js Image component
    return { url: link, type: 'image' };
  }

  try {
    mime = extName(url.pathname.slice(url.pathname.lastIndexOf('/') + 1))[0]?.mime;
    if (mime) {
      if (mime.startsWith('image')) {
        type = mime === 'image/gif' ? 'gif' : 'image';
      } else if (mime.startsWith('video')) {
        type = 'video';
      } else if (mime.startsWith('audio')) {
        type = 'audio';
      }
    }

    if (canEmbed(url) || isCustomYoutubeUrl(url)) {
      type = 'iframe';
      patternThumbnailUrl = getPatternThumbnailUrl(url);
    }
  } catch (e) {
    console.error(e);
  }

  return { url: link, type, patternThumbnailUrl };
};

const getCommentMediaInfo = (comment: Comment): CommentMediaInfo | undefined => {
  if (!comment?.thumbnailUrl && !comment?.link) {
    return;
  }
  const linkInfo = comment.link ? getLinkMediaInfo(comment.link) : undefined;
  if (linkInfo) {
    linkInfo.thumbnail = comment.thumbnailUrl || linkInfo.thumbnail;
    return linkInfo;
  }
  return;
};

export const getCommentMediaInfoMemoized = memoize(getCommentMediaInfo, { max: 1000 });
export const getLinkMediaInfoMemoized = memoize(getLinkMediaInfo, { max: 1000 });
