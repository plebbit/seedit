import { useEffect } from 'react';
import { Outlet, Route, Routes, useParams } from 'react-router-dom';
import useTheme from './hooks/use-theme';
import { timeFilterNames } from './hooks/use-time-filter';
import styles from './app.module.css';
import All from './views/all';
import About from './views/about';
import Author from './views/author';
import Home from './views/home';
import Inbox from './views/inbox';
import NotFound from './views/not-found';
import PendingPost from './views/pending-post';
import PostPage from './views/post-page';
import Profile from './views/profile';
import Settings from './views/settings';
import SubmitPage from './views/submit-page';
import Subplebbit from './views/subplebbit';
import SubplebbitSettings from './views/subplebbit/subplebbit-settings';
import Subplebbits from './views/subplebbits';
import AccountBar from './components/account-bar/';
import ChallengeModal from './components/challenge-modal';
import Header from './components/header';
import StickyHeader from './components/sticky-header';
import TopBar from './components/topbar';

export const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];

const CheckRouteParams = () => {
  const { accountCommentIndex, commentCid, sortType, subplebbitAddress, timeFilterName } = useParams();

  const isValidAccountCommentIndex = !accountCommentIndex || (!isNaN(parseInt(accountCommentIndex)) && parseInt(accountCommentIndex) >= 0);
  const isValidCommentCid = !commentCid || /^Qm[a-zA-Z0-9]{44}$/.test(commentCid);
  const isValidSubplebbitAddress = !subplebbitAddress || subplebbitAddress.includes('.') || /^12D3KooW[a-zA-Z0-9]{44}$/.test(subplebbitAddress);
  const isSortTypeValid = !sortType || sortTypes.includes(sortType);
  const isTimeFilterNameValid = !timeFilterName || timeFilterNames.includes(timeFilterName as any);
  const isAccountCommentIndexValid = !accountCommentIndex || !isNaN(parseInt(accountCommentIndex));

  if (!isValidAccountCommentIndex || !isValidCommentCid || !isValidSubplebbitAddress || !isSortTypeValid || !isTimeFilterNameValid || !isAccountCommentIndexValid) {
    return <NotFound />;
  }

  return <Outlet />;
};

const App = () => {
  const globalLayout = (
    <>
      <ChallengeModal />
      <Outlet />
    </>
  );

  const pagesLayout = (
    <>
      <TopBar />
      <AccountBar />
      <Header />
      <Outlet />
    </>
  );

  const feedLayout = (
    <>
      <StickyHeader />
      <Header />
      <Outlet />
    </>
  );

  // add theme className to body so it can set the correct body background in index.css
  const [theme] = useTheme();
  useEffect(() => {
    document.body.classList.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className={`${styles.app} ${theme}`}>
      <Routes>
        <Route element={globalLayout}>
          <Route element={feedLayout}>
            <Route element={<CheckRouteParams />}>
              <Route path='/:sortType?' element={<Home />} />
              <Route path='/:sortType?/:timeFilterName?' element={<Home />} />

              <Route path='/p/all/:sortType?' element={<All />} />
              <Route path='/p/all/:sortType?/:timeFilterName?' element={<All />} />

              <Route path='/p/:subplebbitAddress/:sortType?' element={<Subplebbit />} />
              <Route path='/p/:subplebbitAddress/:sortType?/:timeFilterName?' element={<Subplebbit />} />

              <Route path='/profile/:accountCommentIndex' element={<PendingPost />} />
              <Route path='/profile/:sortType?/:timeFilterName?' element={<Profile />} />
              <Route path='/profile/upvoted/:sortType?/:timeFilterName?' element={<Profile />} />
              <Route path='/profile/downvoted/:sortType?/:timeFilterName?' element={<Profile />} />
              <Route path='/profile/comments/:sortType?/:timeFilterName?' element={<Profile />} />
              <Route path='/profile/submitted/:sortType?/:timeFilterName?' element={<Profile />} />
              <Route path='/profile/hidden/:sortType?/:timeFilterName?' element={<Profile />} />

              <Route path='/u/:authorAddress/c/:commentCid?/:sortType?/:timeFilterName?' element={<Author />} />
              <Route path='/u/:authorAddress/c/:commentCid?/comments/:sortType?/:timeFilterName?' element={<Author />} />
              <Route path='/u/:authorAddress/c/:commentCid?/submitted/:sortType?/:timeFilterName?' element={<Author />} />
            </Route>
          </Route>
          <Route element={pagesLayout}>
            <Route path='/submit' element={<SubmitPage />} />
            <Route path='/about' element={<About />} />

            <Route path='/p/all/about' element={<About />} />

            <Route path='/p/:subplebbitAddress/c/:commentCid' element={<PostPage />} />
            <Route path='/p/:subplebbitAddress/c/:commentCid?context=3' element={<PostPage />} />
            <Route path='/p/:subplebbitAddress/c/:commentCid/about' element={<About />} />

            <Route path='/p/:subplebbitAddress/submit' element={<SubmitPage />} />
            <Route path='/p/:subplebbitAddress/about' element={<About />} />

            <Route path='/settings' element={<Settings />} />
            <Route path='/p/:subplebbitAddress/settings' element={<SubplebbitSettings />} />
            <Route path='/settings/plebbit-options' element={<Settings />} />

            <Route path='/profile/about' element={<About />} />

            <Route path='/u/:authorAddress/c/:commentCid/about' element={<About />} />

            <Route path='/inbox' element={<Inbox />} />
            <Route path='/inbox/unread' element={<Inbox />} />
            <Route path='/inbox/commentreplies' element={<Inbox />} />
            <Route path='/inbox/postreplies' element={<Inbox />} />

            <Route path='/communities' element={<Subplebbits />} />
            <Route path='/communities/subscriber' element={<Subplebbits />} />
            <Route path='/communities/moderator' element={<Subplebbits />} />
            <Route path='/communities/admin' element={<Subplebbits />} />
            <Route path='/communities/owner' element={<Subplebbits />} />
            <Route path='/communities/vote' element={<Subplebbits />} />
            <Route path='/communities/vote/passing' element={<Subplebbits />} />
            <Route path='/communities/vote/rejecting' element={<Subplebbits />} />

            <Route path='/communities/create' element={<SubplebbitSettings />} />

            <Route path='*' element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
