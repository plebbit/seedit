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
    timeFilterName = isInSubplebbitView ? 'all' : lastVisitTimeFilterName;
  }

  let timeFilterSeconds: number | undefined;

  if (timeFilterName === 'all') {
    timeFilterSeconds = undefined;
  } else if (timeFilterName && timeFilterName in timeFilterNamesToSeconds) {
    timeFilterSeconds = timeFilterNamesToSeconds[timeFilterName as keyof typeof timeFilterNamesToSeconds];
  } else if (timeFilterName) {
    // Handle dynamic time filters (e.g., "3d", "2w")
    const match = timeFilterName.match(/^(\d+)([dwmy])$/);
    if (match) {
      const [, value, unit] = match;
      const numValue = parseInt(value, 10);
      switch (unit) {
        case 'd':
          timeFilterSeconds = numValue * 24 * 60 * 60;
          break;
        case 'w':
          timeFilterSeconds = numValue * 7 * 24 * 60 * 60;
          break;
        case 'm':
          timeFilterSeconds = numValue * 30 * 24 * 60 * 60;
          break;
        case 'y':
          timeFilterSeconds = numValue * 365 * 24 * 60 * 60;
          break;
      }
    }
  }

  // If we still don't have a valid timeFilterSeconds, use the default (24h)
  if (timeFilterSeconds === undefined && timeFilterName !== 'all') {
    timeFilterSeconds = timeFilterNamesToSeconds['24h'];
  }

  assert(timeFilterName === 'all' || timeFilterSeconds !== undefined, `useTimeFilter no filter for timeFilterName '${timeFilterName}'`);

  return { timeFilterSeconds, timeFilterNames, timeFilterName, lastVisitTimeFilterName };
};

export default useTimeFilter;
