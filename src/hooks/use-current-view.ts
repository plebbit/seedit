import { useLocation, useParams } from 'react-router-dom';

type CurrentView = {
  isHomeView: boolean;
  isSubplebbitView: boolean;
  isPostView: boolean;
  isSubmitView: boolean;
  isSubplebbitSubmitView: boolean;
};

type ParamsType = {
  subplebbitAddress?: string;
  commentCid?: string;
};

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const useCurrentView = (): CurrentView => {
  const location = useLocation();
  const { subplebbitAddress, commentCid } = useParams<ParamsType>();
  const pathname = location.pathname;

  const isHomeView = pathname === `/` || sortTypes.includes(pathname);
  const isSubplebbitView = subplebbitAddress ? pathname.startsWith(`/p/${subplebbitAddress}`) : false;
  const isPostView = subplebbitAddress && commentCid ? pathname.startsWith(`/p/${subplebbitAddress}/c/${commentCid}`) : false;
  const isSubmitView = pathname === `/submit`;
  const isSubplebbitSubmitView = subplebbitAddress ? pathname === `/p/${subplebbitAddress}/submit` : false;

  return { isHomeView, isSubplebbitView, isPostView, isSubmitView, isSubplebbitSubmitView };
};

export default useCurrentView;
