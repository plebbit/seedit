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

const getYouTubeVideoId = (url: URL): string | null => {
  if (url.host.includes('youtu.be')) {
    return url.pathname.slice(1);
  } else if (url.searchParams.has('v')) {
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

export const getLinkMediaInfo = memoize(
  (link: string): CommentMediaInfo | undefined => {
    if (!isValidURL(link)) {
      return;
    }
    const url = new URL(link);
    let patternThumbnailUrl: string | undefined;
    let type: string = 'webpage';
    let mime: string | undefined;

    if (url.pathname === '/_next/image' && url.search.startsWith('?url=')) {
      return { url: link, type: 'image' };
    }

    try {
      mime = extName(new URL(link).pathname.toLowerCase().replace('/', ''))[0]?.mime;
      if (mime) {
        if (mime.startsWith('image')) {
          type = mime === 'image/gif' ? 'gif' : 'image';
        } else if (mime.startsWith('video')) {
          type = 'video';
        } else if (mime.startsWith('audio')) {
          type = 'audio';
        }
      }

      if (!url.pathname.includes('.')) {
        type = 'webpage';
      }

      if (canEmbed(url) || url.host.startsWith('yt.')) {
        type = 'iframe';
        patternThumbnailUrl = getPatternThumbnailUrl(url);
      }
    } catch (e) {
      console.error(e);
    }

    return { url: link, type, patternThumbnailUrl };
  },
  { max: 1000 },
);

export const getCommentMediaInfo = (comment: Comment): CommentMediaInfo | undefined => {
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

// some sites have CORS access, so the thumbnail can be fetched client-side, which is helpful if subplebbit.settings.fetchThumbnailUrls is false
const fetchWebpageThumbnail = async (url: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Try to find Open Graph image
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.getAttribute('content')) {
      return ogImage.getAttribute('content')!;
    }

    // If no Open Graph image, try to find the first image
    const firstImage = doc.querySelector('img');
    if (firstImage && firstImage.getAttribute('src')) {
      return new URL(firstImage.getAttribute('src')!, url).href;
    }

    return undefined;
  } catch (error) {
    console.error('Error fetching webpage thumbnail:', error);
    return undefined;
  }
};

export const fetchWebpageThumbnailIfNeeded = async (commentMediaInfo: CommentMediaInfo): Promise<CommentMediaInfo> => {
  if (commentMediaInfo.type === 'webpage' && !commentMediaInfo.thumbnail) {
    const cachedThumbnail = getCachedThumbnail(commentMediaInfo.url);
    if (cachedThumbnail) {
      return { ...commentMediaInfo, thumbnail: cachedThumbnail };
    }
    const thumbnail = await fetchWebpageThumbnail(commentMediaInfo.url);
    if (thumbnail) {
      setCachedThumbnail(commentMediaInfo.url, thumbnail);
    }
    return { ...commentMediaInfo, thumbnail };
  }
  return commentMediaInfo;
};
const THUMBNAIL_CACHE_KEY = 'webpageThumbnailCache';

export const getCachedThumbnail = (url: string): string | null => {
  const cache = JSON.parse(localStorage.getItem(THUMBNAIL_CACHE_KEY) || '{}');
  return cache[url] || null;
};

export const setCachedThumbnail = (url: string, thumbnail: string): void => {
  const cache = JSON.parse(localStorage.getItem(THUMBNAIL_CACHE_KEY) || '{}');
  cache[url] = thumbnail;
  localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cache));
};
