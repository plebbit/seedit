import { FC, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './sort-buttons.module.css';

const choices = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const SortButtons: FC = () => {
  const { sortType } = useParams<{ sortType: string }>();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(sortType || '/topMonth');

  const labels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];

  const handleSelect = (choice: string) => {
    setSelected(choice);
  };

  useEffect(() => {
    if (sortType) {
      setSelected('/' + sortType);
    } else {
      setSelected('/hot');
    }
  }, [sortType]);

  const menuItems = choices.map((choice, index) => (
    <li key={choice}>
      <Link to={choice} className={selected === choice ? styles.selected : styles.choice} onClick={() => handleSelect(choice)}>
        {labels[index]}
      </Link>
    </li>
  ));

  return (
    <ul className={styles.tabMenu}>
      {menuItems}
      <li>
        <Link to='/wiki' className={styles.choice} onClick={(event) => event.preventDefault()}>
          {t('header_wiki')}
        </Link>
      </li>
    </ul>
  );
};

export default SortButtons;
