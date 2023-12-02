import assert from 'assert';
import { Comment } from '@plebbit/plebbit-react-hooks';

type TimeFilter = (comment: Comment) => boolean;
export type TimeFilterKey = '1h' | '24h' | '1w' | '1m' | '1y' | 'all';
type TimeFilters = { [key in TimeFilterKey]: TimeFilter | undefined };

const timeFilters: TimeFilters = {
  '1h': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60,
  '24h': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24,
  '1w': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24 * 7,
  '1m': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24 * 30,
  '1y': (comment) => comment.timestamp > Date.now() / 1000 - 60 * 60 * 24 * 365,
  'all': undefined,
};

const lastVisitTimestamp = Number(localStorage.getItem('seeditLastVisitTimestamp')) || Date.now();
const secondsSinceLastVisit = (Date.now() - lastVisitTimestamp) / 1000;
const day = 24 * 60 * 60;
let lastVisitTimeFilterName: TimeFilterKey = '24h';

if (secondsSinceLastVisit > 30 * day) {
  lastVisitTimeFilterName = '1m';
} else if (secondsSinceLastVisit > 7 * day) {
  lastVisitTimeFilterName = '1w';
} else if (secondsSinceLastVisit > day) {
  lastVisitTimeFilterName = '24h';
} else {
  lastVisitTimeFilterName = '1h';
}

const timeFilterNames: TimeFilterKey[] = ['1h', '24h', '1w', '1m', '1y', 'all'];

const useTimeFilter = (sortType: string = 'hot', timeFilterName: TimeFilterKey = lastVisitTimeFilterName) => {
  assert(typeof sortType === 'string', `useTimeFilter sortType argument '${sortType}' not a string`);
  assert(typeof timeFilterName === 'string', `useTimeFilter timeFilterName argument '${timeFilterName}' not a string`);

  const timeFilter = timeFilters[timeFilterName];
  assert(timeFilterName === 'all' || timeFilter !== undefined, `useTimeFilter no filter for timeFilterName '${timeFilterName}'`);

  return { timeFilter, timeFilterNames };
};

export default useTimeFilter;
