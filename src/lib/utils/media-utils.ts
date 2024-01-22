import { Comment } from '@plebbit/plebbit-react-hooks';
import extName from 'ext-name';
import { canEmbed } from '../../components/post/embed';
import memoize from 'memoizee';

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
      (commentMediaInfo.type === 'webpage' && commentMediaInfo.thumbnail) ||
      (commentMediaInfo.type === 'iframe' && iframeThumbnail))
    ? true
    : false;
};

const getCommentMediaInfo = (comment: Comment) => {
  if (!comment?.thumbnailUrl && !comment?.link) {
    return;
  }

  if (comment?.link) {
    let mime: string | undefined;
    try {
      mime = extName(new URL(comment?.link).pathname.toLowerCase().replace('/', ''))[0]?.mime;
    } catch (e) {
      return;
    }

    const url = new URL(comment.link);
    const host = url.hostname;
    let patternThumbnailUrl;

    if (['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be', 'm.youtube.com'].includes(host)) {
      const videoId = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
      patternThumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    } else if (host.includes('streamable.com')) {
      const videoId = url.pathname.split('/')[1];
      patternThumbnailUrl = `https://cdn-cf-east.streamable.com/image/${videoId}.jpg`;
    }

    if (canEmbed(url)) {
      return {
        url: comment.link,
        type: 'iframe',
        thumbnail: comment.thumbnailUrl,
        patternThumbnailUrl,
      };
    }

    if (mime?.startsWith('image')) {
      return { url: comment.link, type: 'image' };
    }
    if (mime?.startsWith('video')) {
      return { url: comment.link, type: 'video', thumbnail: comment.thumbnailUrl };
    }
    if (mime?.startsWith('audio')) {
      return { url: comment.link, type: 'audio' };
    }

    if (comment?.thumbnailUrl && comment?.thumbnailUrl !== comment?.link) {
      return { url: comment.link, type: 'webpage', thumbnail: comment.thumbnailUrl };
    }

    if (comment?.link) {
      return { url: comment.link, type: 'webpage' };
    }
  }
};

export const getCommentMediaInfoMemoized = memoize(getCommentMediaInfo, { max: 1000 });
