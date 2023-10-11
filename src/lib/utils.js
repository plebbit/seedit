export const getFormattedTime = (unixTimestamp) => {
  const currentTime = Date.now() / 1000;
  const timeDifference = currentTime - unixTimestamp;

  if (timeDifference < 60) {
    return '1 minute ago';
  }
  if (timeDifference < 3600) {
    return `${Math.floor(timeDifference / 60)} minutes ago`;
  }
  if (timeDifference < 7200) {
    return 'an hour ago';
  }
  if (timeDifference < 86400) {
    return `${Math.floor(timeDifference / 3600)} hours ago`;
  }
  if (timeDifference < 172800) {
    return '1 day ago';
  }
  if (timeDifference < 2592000) {
    return `${Math.floor(timeDifference / 86400)} days ago`;
  }
  if (timeDifference < 5184000) {
    return '1 month ago';
  }
  if (timeDifference < 31104000) {
    return `${Math.floor(timeDifference / 2592000)} months ago`;
  }
  if (timeDifference < 62208000) {
    return 'a year ago';
  }
  return `${Math.floor(timeDifference / 31104000)} years ago`;
};

const utils = {
  getFormattedTime,
};

export default utils;
