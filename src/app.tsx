import { useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import useTheme from './hooks/use-theme';
import styles from './app.module.css';
import Home from './views/home';
import Post from './views/post';
import TopBar from './components/topbar/topbar';
import Header from './components/header/header';
import Submit from './views/submit/submit';

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
          <Route path='/submit' element={<Submit />} />
          <Route path='p/:subplebbitAddress/c/:commentCid' element={<Post />} />
          <Route path='p/:subplebbitAddress/submit' element={<Submit />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
