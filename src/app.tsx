import { useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import useTheme from './hooks/use-theme';
import styles from './app.module.css';
import Home from './components/views/home';
import Comments from './components/views/comments';
import TopBar from './components/topbar/topbar';
import Header from './components/header/header';

function App() {
  const [theme] = useTheme();

  useEffect(() => {
    document.body.classList.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(theme);
  }, [theme]);

  const homeLayout = (
    <>
      <TopBar />
      <Header />
      <Outlet />
    </>
  );

  return (
    <div className={`${styles.app} ${theme}`}>
      <Routes>
        <Route element={homeLayout}>
          <Route path='/:sortType?' element={<Home />} />
          <Route path='p/:subplebbitAddress/c/:commentCid' element={<Comments />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
