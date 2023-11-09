export type ParamsType = {
  accountCommentIndex?: string;
  commentCid?: string;
  subplebbitAddress?: string;
};

export type ViewType = 'home' | 'pending' | 'post' | 'submit' | 'subplebbit' | 'subplebbit/submit';

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

export const checkCurrentView = (view: ViewType, pathname: string, params: ParamsType): boolean => {
  switch (view) {
    case 'home':
      return pathname === '/' || sortTypes.includes(pathname);
    case 'pending':
      return pathname === `/profile/${params.accountCommentIndex}`;
    case 'post':
      return params.subplebbitAddress && params.commentCid ? pathname.startsWith(`/p/${params.subplebbitAddress}/c/${params.commentCid}`) : false;
    case 'submit':
      return pathname === '/submit';
    case 'subplebbit':
      return params.subplebbitAddress ? pathname.startsWith(`/p/${params.subplebbitAddress}`) : false;
    case 'subplebbit/submit':
      return params.subplebbitAddress ? pathname === `/p/${params.subplebbitAddress}/submit` : false;
    default:
      return false;
  }
};
