import { useLocation, useParams } from 'react-router-dom';

type CurrentView = {
  isHomeView: boolean;
  isPendingView: boolean;
  isPostView: boolean;
  isSubmitView: boolean;
  isSubplebbitView: boolean;
  isSubplebbitSubmitView: boolean;
};

type ParamsType = {
  accountCommentIndex?: string;
  commentCid?: string;
  subplebbitAddress?: string;
};

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const useCurrentView = (): CurrentView => {
  const location = useLocation();
  const { accountCommentIndex, commentCid, subplebbitAddress } = useParams<ParamsType>();
  const pathname = location.pathname;

  const isHomeView = pathname === `/` || sortTypes.includes(pathname);
  const isPendingView = pathname === `/profile/${accountCommentIndex}`;
  const isPostView = subplebbitAddress && commentCid ? pathname.startsWith(`/p/${subplebbitAddress}/c/${commentCid}`) : false;
  const isSubmitView = pathname === `/submit`;
  const isSubplebbitView = subplebbitAddress ? pathname.startsWith(`/p/${subplebbitAddress}`) : false;
  const isSubplebbitSubmitView = subplebbitAddress ? pathname === `/p/${subplebbitAddress}/submit` : false;

  return { isHomeView, isSubplebbitView, isPendingView, isPostView, isSubmitView, isSubplebbitSubmitView };
};

export default useCurrentView;
