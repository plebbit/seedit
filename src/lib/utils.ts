import i18next from 'i18next';
import memoize from 'memoizee';
import extName from 'ext-name';
import { ChallengeVerification, Comment } from '@plebbit/plebbit-react-hooks';
import { canEmbed } from '../components/post/embed';

export interface CommentMediaInfo {
  url: string;
  type: string;
  thumbnail?: string;
  patternThumbnailUrl?: string;
}

export const alertChallengeVerificationFailed = (challengeVerification: ChallengeVerification) => {
  if (challengeVerification?.challengeSuccess === false) {
    console.warn(challengeVerification);
    alert(`challenge error: ${[...(challengeVerification?.challengeErrors || []), challengeVerification?.reason].join(' ')}`);
  } else {
    console.log(challengeVerification);
  }
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

    if (['youtube.com', 'www.youtube.com', 'youtu.be'].includes(host)) {
      const videoId = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
      patternThumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
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

const getCommentMediaInfoMemoized = memoize(getCommentMediaInfo, { max: 1000 });

const getFormattedTime = (unixTimestamp: number): string => {
  const currentTime = Date.now() / 1000;
  const timeDifference = currentTime - unixTimestamp;
  const t = i18next.t;

  if (timeDifference < 60) {
    return t('time_1_minute_ago');
  }
  if (timeDifference < 3600) {
    return t('time_x_minutes_ago', { count: Math.floor(timeDifference / 60) });
  }
  if (timeDifference < 7200) {
    return t('time_1_hour_ago');
  }
  if (timeDifference < 86400) {
    return t('time_x_hours_ago', { count: Math.floor(timeDifference / 3600) });
  }
  if (timeDifference < 172800) {
    return t('time_1_day_ago');
  }
  if (timeDifference < 2592000) {
    return t('time_x_days_ago', { count: Math.floor(timeDifference / 86400) });
  }
  if (timeDifference < 5184000) {
    return t('time_1_month_ago');
  }
  if (timeDifference < 31104000) {
    return t('time_x_months_ago', { count: Math.floor(timeDifference / 2592000) });
  }
  if (timeDifference < 62208000) {
    return t('time_1_year_ago');
  }
  return t('time_x_years_ago', { count: Math.floor(timeDifference / 31104000) });
};

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
};

const hasThumbnail = (commentMediaInfo: CommentMediaInfo | undefined, link: string | undefined): boolean => {
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

export const isValidENS = (address: string) => {
  return address.endsWith('.eth');
};

export const isValidIPFS = (address: string) => {
  const IPFS_REGEX = /^12D3KooW[A-Za-z0-9]+$/;
  return IPFS_REGEX.test(address) && address.length === 52;
};

export const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const utils = {
  alertChallengeVerificationFailed,
  getCommentMediaInfoMemoized,
  getFormattedTime,
  getHostname,
  hasThumbnail,
  isValidENS,
  isValidIPFS,
  isValidURL,
};

export default utils;
