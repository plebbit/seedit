import assert from 'assert';
import { useLocation, useParams } from 'react-router-dom';
import { isSubplebbitView } from '../lib/utils/view-utils';

// the timestamp the last time the user visited
const lastVisitTimestamp = localStorage.getItem('seeditLastVisitTimestamp');

// update the last visited timestamp every n seconds
setInterval(() => {
  localStorage.setItem('seeditLastVisitTimestamp', Date.now().toString());
}, 60 * 1000);

const timeFilterNamesToSeconds: Record<string, number | undefined> = {
  '1h': 60 * 60,
  '24h': 60 * 60 * 24,
  '1w': 60 * 60 * 24 * 7,
  '1m': 60 * 60 * 24 * 30,
  '1y': 60 * 60 * 24 * 365,
  all: undefined,
};

// calculate the last visit timeFilterNamesToSeconds
const secondsSinceLastVisit = lastVisitTimestamp ? (Date.now() - parseInt(lastVisitTimestamp, 10)) / 1000 : Infinity;
const day = 24 * 60 * 60;
let lastVisitTimeFilterName: string | undefined;
if (secondsSinceLastVisit > 30 * day) {
  lastVisitTimeFilterName = '1m';
  timeFilterNamesToSeconds[lastVisitTimeFilterName] = timeFilterNamesToSeconds['1m'];
} else if (secondsSinceLastVisit > 7 * day) {
  const weeks = Math.ceil(secondsSinceLastVisit / day / 7);
  lastVisitTimeFilterName = `${weeks}w`;
  timeFilterNamesToSeconds[lastVisitTimeFilterName] = 60 * 60 * 24 * 7 * weeks;
} else if (secondsSinceLastVisit > day) {
  const days = Math.ceil(secondsSinceLastVisit / day);
  lastVisitTimeFilterName = `${days}d`;
  timeFilterNamesToSeconds[lastVisitTimeFilterName] = 60 * 60 * 24 * days;
} else {
  lastVisitTimeFilterName = '24h';
  timeFilterNamesToSeconds[lastVisitTimeFilterName] = timeFilterNamesToSeconds['24h'];
}

export const timeFilterNames = ['1h', '24h', '1w', '1m', '1y', 'all', lastVisitTimeFilterName];

const useTimeFilter = () => {
  const params = useParams();
  const location = useLocation();
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);

  let timeFilterName = params.timeFilterName;
  // the default time filter is the last visit time filter
  if (!timeFilterName) {
    if (isInSubplebbitView) {
      timeFilterName = 'all';
    } else {
      timeFilterName = lastVisitTimeFilterName;
    }
  }

  assert(!timeFilterName || typeof timeFilterName === 'string', `useTimeFilter timeFilterName argument '${timeFilterName}' not a string`);
  const timeFilterSeconds = timeFilterNamesToSeconds[timeFilterName as keyof typeof timeFilterNamesToSeconds];
  assert(!timeFilterName || timeFilterName === 'all' || timeFilterSeconds !== undefined, `useTimeFilter no filter for timeFilterName '${timeFilterName}'`);
  return { timeFilterSeconds, timeFilterNames, timeFilterName, lastVisitTimeFilterName };
};

export default useTimeFilter;
