import { useEffect } from 'react';
import useTheme from './hooks/use-theme';

function App() {
  const [theme] = useTheme();

  useEffect(() => {
    document.body.classList.forEach((className) => document.body.classList.remove(className))
    document.body.classList.add(theme)
  }, [theme])

  return (
    <div className='App'>
      test
    </div>
  );
}

export default App;
