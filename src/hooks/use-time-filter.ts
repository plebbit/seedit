import assert from 'assert';
import { Comment } from '@plebbit/plebbit-react-hooks';

type TimeFilter = (comment: Comment) => boolean;
export type TimeFilterKey = '1h' | '24h' | '1w' | '1m' | '1y' | 'all';
export const timeFilterNames: TimeFilterKey[] = ['1h', '24h', '1w', '1m', '1y', 'all'];

interface TimeFilters {
  [key: string]: TimeFilter | undefined;
}

const timeFilters: TimeFilters = {
  '1h': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60,
  '24h': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24,
  '1w': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24 * 7,
  '1m': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24 * 30,
  '1y': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24 * 365,
  all: undefined,
};

// the timestamp the last time the user visited
const lastVisitTimestampString = localStorage.getItem('seeditLastVisitTimestamp');

let lastVisitTimeFilterName: TimeFilterKey;

if (lastVisitTimestampString) {
  const lastVisitTimestamp = Number(lastVisitTimestampString);
  const secondsSinceLastVisit = (Date.now() - lastVisitTimestamp) / 1000;
  const day = 24 * 60 * 60;

  if (secondsSinceLastVisit > 30 * day) {
    lastVisitTimeFilterName = '1m';
  } else if (secondsSinceLastVisit > 7 * day) {
    lastVisitTimeFilterName = '1w';
  } else if (secondsSinceLastVisit > day) {
    lastVisitTimeFilterName = '24h';
  } else {
    lastVisitTimeFilterName = '24h';
  }
} else {
  lastVisitTimeFilterName = '1m';
}

// update the last visited timestamp every n seconds
setInterval(() => {
  localStorage.setItem('seeditLastVisitTimestamp', Date.now().toString());
}, 60 * 1000);

const useTimeFilter = (
  sortType?: string,
  timeFilterName: TimeFilterKey = lastVisitTimeFilterName,
): { timeFilter: TimeFilter | undefined; timeFilterNames: TimeFilterKey[]; currentFilterName: TimeFilterKey } => {
  // default to the last visit time filter if no time filter name is provided
  if (!timeFilterName) {
    timeFilterName = lastVisitTimeFilterName;
  }

  assert(!sortType || typeof sortType === 'string', `useTimeFilter sortType argument '${sortType}' not a string`);
  assert(typeof timeFilterName === 'string', `useTimeFilter timeFilterName argument '${timeFilterName}' not a string`);
  const timeFilter = timeFilters[timeFilterName];
  assert(timeFilterName === 'all' || timeFilter !== undefined, `useTimeFilter no filter for timeFilterName '${timeFilterName}'`);

  return { timeFilter, timeFilterNames, currentFilterName: timeFilterName };
};

export default useTimeFilter;
