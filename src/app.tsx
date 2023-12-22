import { useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import useTheme from './hooks/use-theme';
import styles from './app.module.css';
import All from './views/all';
import Inbox from './views/inbox';
import Home from './views/home';
import PendingPost from './views/pending-post';
import Post from './views/post';
import About from './views/about/about';
import Author from './views/author';
import Profile from './views/profile';
import Settings from './views/settings';
import Submit from './views/submit';
import Subplebbit from './views/subplebbit';
import AccountBar from './components/account-bar/';
import ChallengeModal from './components/challenge-modal';
import Header from './components/header';
import StickyHeader from './components/sticky-header';
import TopBar from './components/topbar';

function App() {
  const [theme] = useTheme();

  useEffect(() => {
    document.body.classList.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(theme);
  }, [theme]);

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

  return (
    <div className={`${styles.app} ${theme}`}>
      <Routes>
        <Route element={globalLayout}>
          <Route element={feedLayout}>
            <Route path='/:sortType?' element={<Home />} />
            <Route path='/:sortType?/:timeFilterName?' element={<Home />} />

            <Route path='/p/all/:sortType?' element={<All />} />
            <Route path='/p/all/:sortType?/:timeFilterName?' element={<All />} />

            <Route path='/p/:subplebbitAddress/:sortType?' element={<Subplebbit />} />
            <Route path='/p/:subplebbitAddress/:sortType?/:timeFilterName?' element={<Subplebbit />} />

            <Route path='/profile/:accountCommentIndex' element={<Post />} />
            <Route path='/profile/:sortType?/:timeFilterName?' element={<Profile />} />
            <Route path='/profile/upvoted/:sortType?/:timeFilterName?' element={<Profile />} />
            <Route path='/profile/downvoted/:sortType?/:timeFilterName?' element={<Profile />} />
            <Route path='/profile/comments/:sortType?/:timeFilterName?' element={<Profile />} />
            <Route path='/profile/submitted/:sortType?/:timeFilterName?' element={<Profile />} />

            <Route path='u/:authorAddress/c/:commentCid?/:sortType?/:timeFilterName?' element={<Author />} />
            <Route path='u/:authorAddress/c/:commentCid?/comments/:sortType?/:timeFilterName?' element={<Author />} />
            <Route path='u/:authorAddress/c/:commentCid?/submitted/:sortType?/:timeFilterName?' element={<Author />} />
          </Route>
          <Route element={pagesLayout}>
            <Route path='/submit' element={<Submit />} />

            <Route path='/p/:subplebbitAddress/c/:commentCid' element={<Post />} />
            <Route path='/p/:subplebbitAddress/c/:commentCid/about' element={<About />} />

            <Route path='/p/:subplebbitAddress/submit' element={<Submit />} />
            <Route path='/p/:subplebbitAddress/about' element={<About />} />

            <Route path='/settings' element={<Settings />} />

            <Route path='/profile/:accountCommentIndex' element={<PendingPost />} />
            <Route path='/profile/about' element={<About />} />

            <Route path='/u/:authorAddress/c/:commentCid/about' element={<About />} />

            <Route path='/inbox' element={<Inbox />} />
            <Route path='inbox/unread' element={<Inbox />} />
            <Route path='inbox/commentreplies' element={<Inbox />} />
            <Route path='inbox/postreplies' element={<Inbox />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
