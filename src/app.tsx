import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import useTheme from './hooks/use-theme';
import styles from './app.module.css';
import AboutView from './views/about';
import All from './views/all';
import Author from './views/author';
import Home from './views/home';
import Inbox from './views/inbox';
import Mod from './views/mod';
import NotFound from './views/not-found';
import PendingPost from './views/pending-post';
import PostPage from './views/post-page';
import Profile from './views/profile';
import Settings from './views/settings';
import SubmitPage from './views/submit-page';
import Subplebbit from './views/subplebbit';
import SubplebbitSettings from './views/subplebbit-settings';
import Subplebbits from './views/subplebbits';
import AccountBar from './components/account-bar/';
import ChallengeModal from './components/challenge-modal';
import Header from './components/header';
import StickyHeader from './components/sticky-header';
import TopBar from './components/topbar';

export const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];

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

  // react router doesn't handle the %23 hash correctly, so we need to replace it with #
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname + location.hash;
    if (currentPath.includes('%23')) {
      const correctedPath = currentPath.replace('%23', '#');
      navigate(correctedPath, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className={`${styles.app} ${theme}`}>
      <Routes>
        <Route element={globalLayout}>
          <Route element={pagesLayout}>
            <Route path='/about' element={<AboutView />} />
            <Route path='/submit' element={<SubmitPage />} />

            <Route path='/p/:subplebbitAddress/c/:commentCid' element={<PostPage />} />
            <Route path='/p/:subplebbitAddress/c/:commentCid?context=3' element={<PostPage />} />
            <Route path='/p/:subplebbitAddress/c/:commentCid/about' element={<AboutView />} />

            <Route path='/p/:subplebbitAddress/submit' element={<SubmitPage />} />
            <Route path='/p/:subplebbitAddress/about' element={<AboutView />} />

            <Route path='/settings' element={<Settings />} />
            <Route path='/p/:subplebbitAddress/settings' element={<SubplebbitSettings />} />
            <Route path='/settings/plebbit-options' element={<Settings />} />

            <Route path='/profile/about' element={<AboutView />} />

            <Route path='/u/:authorAddress/c/:commentCid/about' element={<AboutView />} />

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
            <Route path='/communities/vote/tag/:tag' element={<Subplebbits />} />
            <Route path='/communities/create' element={<SubplebbitSettings />} />
          </Route>
          <Route element={feedLayout}>
            <Route path='/:sortType?/:timeFilterName?' element={<Home />} />

            <Route path='/p/all/:sortType?/:timeFilterName?' element={<All />} />

            <Route path='/p/mod/:sortType?/:timeFilterName?' element={<Mod />} />

            <Route path='/p/:subplebbitAddress/:sortType?/:timeFilterName?' element={<Subplebbit />} />

            <Route path='/profile/:accountCommentIndex' element={<PendingPost />} />

            <Route path='/profile' element={<Profile />}>
              <Route index element={<Profile.Overview />} />
              <Route path='upvoted' element={<Profile.VotedComments voteType={1} />} />
              <Route path='downvoted' element={<Profile.VotedComments voteType={-1} />} />
              <Route path='hidden' element={<Profile.HiddenComments />} />
              <Route path='comments' element={<Profile.Comments />} />
              <Route path='submitted' element={<Profile.Submitted />} />
            </Route>

            <Route path='/u/:authorAddress/c/:commentCid?/:sortType?/:timeFilterName?' element={<Author />} />
            <Route path='/u/:authorAddress/c/:commentCid?/comments/:sortType?/:timeFilterName?' element={<Author />} />
            <Route path='/u/:authorAddress/c/:commentCid?/submitted/:sortType?/:timeFilterName?' element={<Author />} />

            <Route path='*' element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
