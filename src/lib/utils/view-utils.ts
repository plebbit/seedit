import { timeFilterNames, TimeFilterKey } from "../../hooks/use-time-filter";

export type ParamsType = {
  accountCommentIndex?: string;
  commentCid?: string;
  subplebbitAddress?: string;
  timeFilterName?: string;
};

export type ViewType = 'home' | 'pending' | 'post' | 'submit' | 'subplebbit' | 'subplebbit/submit';

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

export const getAboutLink = (pathname: string, params: ParamsType): string => {
  if (pathname.startsWith(`/p/${params.subplebbitAddress}/c/${params.commentCid}`)) {
    return `/p/${params.subplebbitAddress}/c/${params.commentCid}/about`;
  } else if (pathname.startsWith(`/p/${params.subplebbitAddress}`)) {
    return `/p/${params.subplebbitAddress}/about`;
  } else if (pathname.startsWith('/profile')) {
    return '/profile/about';
  } else {
    return '/about';
  }
};

export const isAboutView = (pathname: string): boolean => {
  return pathname.endsWith('/about');
}

export const isHomeView = (pathname: string, params: ParamsType): boolean => {
  return pathname === '/' || sortTypes.includes(pathname) || (timeFilterNames.includes(params.timeFilterName as TimeFilterKey));
};

export const isPendingView = (pathname: string, params: ParamsType): boolean => {
  return pathname === `/profile/${params.accountCommentIndex}`;
};

export const isPostView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress && params.commentCid ? pathname.startsWith(`/p/${params.subplebbitAddress}/c/${params.commentCid}`) : false;
};

export const isProfileView = (pathname: string): boolean => {
  return pathname.startsWith(`/profile`);
}

export const isSettingsView = (pathname: string): boolean => {
  return pathname === '/settings';
}

export const isSubmitView = (pathname: string): boolean => {
  return pathname === '/submit';
};

export const isSubplebbitView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress ? pathname.startsWith(`/p/${params.subplebbitAddress}`) : false;
};

export const isSubplebbitSubmitView = (pathname: string, params: ParamsType): boolean => {
  return params.subplebbitAddress ? pathname === `/p/${params.subplebbitAddress}/submit` : false;
};
