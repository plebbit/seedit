import { useState, useEffect } from 'react';
import styles from './new-posts-button.module.css';

interface NewPostsButtonProps {
  subplebbitAddressesWithNewerPosts: string[];
  reset: () => void;
}

const NewPostsButton = ({ reset, subplebbitAddressesWithNewerPosts }: NewPostsButtonProps) => {
  const [hideButton, setHideButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(80);
  const hide = hideButton || subplebbitAddressesWithNewerPosts.length === 0;

  const handleNewPostsButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // Delay the reset and hide actions to ensure smooth scrolling completes first
    setTimeout(() => {
      reset();
      setHideButton(true);
    }, 300); // Adjust the delay as needed
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 60) {
      setButtonPosition(20);
    } else {
      setButtonPosition(80 - scrollTop);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`${styles.newPostsButton} ${!hide && styles.show} ${hide && styles.hide}`} style={{ top: `${buttonPosition}px` }}>
      <span className={styles.resetButton} onClick={handleNewPostsButtonClick}>
        New Posts
      </span>
      <span className={styles.hideButtonWrapper}>
        <span className={styles.hideButton} onClick={() => setHideButton(true)} />
      </span>
    </div>
  );
};

export default NewPostsButton;
