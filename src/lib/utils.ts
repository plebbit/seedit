import i18next from 'i18next';
import memoize from 'memoizee';
import extName from 'ext-name';
import { Comment } from '@plebbit/plebbit-react-hooks';

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

export const getCommentLinkMediaType = memoize(getCommentMediaInfo, { max: 1000 });

export const getFormattedTime = (unixTimestamp: number): string => {
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

const utils = {
  getFormattedTime,
  getCommentMediaInfo,
};

export default utils;
