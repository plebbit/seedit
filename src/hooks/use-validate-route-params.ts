import { useLocation } from 'react-router-dom';
import { useAccountComments } from '@plebbit/plebbit-react-hooks';
import { useParams } from 'react-router-dom';
import { isHomeAboutView } from '../lib/utils/view-utils';
import useTimeFilter from './use-time-filter';
import { sortTypes } from '../app';

const useValidateRouteParams = () => {
  const { accountCommentIndex, sortType, timeFilterName } = useParams();
  const { timeFilterNames, lastVisitTimeFilterName } = useTimeFilter();
  const { accountComments } = useAccountComments();
  const isSortTypeValid = !sortType || sortTypes.includes(sortType);

  const isValidAccountCommentIndex =
    !accountCommentIndex ||
    (!isNaN(parseInt(accountCommentIndex)) &&
      parseInt(accountCommentIndex) >= 0 &&
      accountComments?.length > 0 &&
      parseInt(accountCommentIndex) < accountComments.length);

  const isDynamicTimeFilter = (filter: string) => /^\d+[hdwmy]$/.test(filter);
  const isTimeFilterNameValid =
    !timeFilterName || timeFilterNames.includes(timeFilterName as any) || timeFilterName === lastVisitTimeFilterName || isDynamicTimeFilter(timeFilterName);

  const isAccountCommentIndexValid = !accountCommentIndex || !isNaN(parseInt(accountCommentIndex));
  const location = useLocation();
  const isInHomeAboutView = isHomeAboutView(location.pathname);

  if (!isValidAccountCommentIndex || (!isSortTypeValid && !isInHomeAboutView) || !isTimeFilterNameValid || !isAccountCommentIndexValid) {
    return false;
  }

  return true;
};

export default useValidateRouteParams;
