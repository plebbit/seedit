import { useEffect, useRef, useState } from 'react';
import styles from './sticky-header.module.css';
import AccountBar from '../account-bar';
import TopBar from '../topbar';
import { debounce } from 'lodash';

const StickyHeader = () => {
  // navbar animation on scroll
  const [visible, setVisible] = useState(true);
  const prevScrollPosRef = useRef(0);

  useEffect(() => {
    const debouncedHandleScroll = debounce(() => {
      const currentScrollPos = window.scrollY;
      const prevScrollPos = prevScrollPosRef.current;

      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      prevScrollPosRef.current = currentScrollPos;
    }, 50);

    window.addEventListener('scroll', debouncedHandleScroll);

    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, []);

  return (
    <div className={styles.content} style={{ top: visible ? 0 : '-40px' }}>
      <TopBar />
      <AccountBar />
    </div>
  );
};

export default StickyHeader;
