import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';

const Header = () => {
  const { sortType } = useParams<{ sortType: string }>();
  const [theme] = useTheme();
  const logoSrc = theme === 'dark' ? '/assets/logo/logo-dark.png' : '/assets/logo/logo-light.png';

  const choices = ["/topMonth", "/hot", "/new", "/active", "/controversialAll", "/topAll"];
  const labels = ["best", "hot", "new", "rising", "controversial", "top"];

  const [selected, setSelected] = useState(sortType || "/topMonth");

  useEffect(() => {
    if (sortType) {
      setSelected('/' + sortType);
    }
  }, [sortType]);

  const handleSelect = (choice: string) => {
    setSelected(choice);
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerBottomLeft}>
        <Link to="/" style={{ all: 'unset', cursor: 'pointer' }}>
          <span className={styles.container}>
            <img className={styles.logo} src="/assets/logo/seedit.png" alt="logo" />
            <img className={styles.logoText} src={logoSrc} alt="logo" />
            <ul className={styles.tabMenu}>
              {choices.map((choice, index) => (
                <li key={choice}>
                  <Link 
                    to={choice}
                    className={selected === choice ? styles.selected : styles.choice}
                    onClick={() => handleSelect(choice)}
                  >
                    {labels[index]}
                  </Link>
                </li>
              ))}
            </ul>
          </span>
          &nbsp;
        </Link>
      </div>
    </div>
  );
};

export default Header;
