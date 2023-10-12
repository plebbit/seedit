import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import useTheme from './hooks/use-theme';
import styles from './app.module.css';
import Home from './components/home';

function App() {
  const [theme] = useTheme();

  useEffect(() => {
    document.body.classList.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className={[styles.app, theme].join(' ')}>
      <Routes>
        <Route path='/:sortType?' element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
