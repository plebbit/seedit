import { FC } from 'react';
import useTheme from '../../hooks/use-theme';

const Theme: FC = () => {
  const [theme, setTheme] = useTheme();
  return (
    <div style={{ padding: '5px' }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value='light'>light</option>
        <option value='dark'>dark</option>
      </select>
    </div>
  );
};

export default Theme;
