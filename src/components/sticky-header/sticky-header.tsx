import styles from './sticky-header.module.css';
import AccountBar from '../account-bar';
import TopBar from '../topbar';

const StickyHeader = () => {
  return (
    <div>
      <div className={styles.content} id='sticky-menu'>
        <TopBar />
        <AccountBar />
      </div>
    </div>
  );
};

// sticky menu animation
// will trigger more than once with hot reloading during development
if (!window.STICKY_MENU_SCROLL_LISTENER) {
  window.STICKY_MENU_SCROLL_LISTENER = true;

  const scrollRange = 50; // the animation css px range in stickyMenuAnimation, must also edit css animation 100%: {top}
  let currentScrollInRange = 0,
    previousScroll = 0;

  window.addEventListener('scroll', () => {
    // find difference between current and last scroll position
    const currentScroll = window.scrollY;

    // Get the menu element
    const menuElement = document.getElementById('sticky-menu');
    if (!menuElement) {
      return;
    }

    if (currentScroll >= 100) {
      menuElement.classList.remove(styles.hidden); // Show menu
    }

    const scrollDifference = currentScroll - previousScroll;
    previousScroll = currentScroll;

    // no changes on mobile overscroll behavior
    if (currentScroll <= 0) {
      return;
    }

    // find new current scroll in range
    const previousScrollInRange = currentScrollInRange;
    currentScrollInRange += scrollDifference;
    if (currentScrollInRange > scrollRange) {
      currentScrollInRange = scrollRange;
    } else if (currentScrollInRange < 0) {
      currentScrollInRange = 0;
    }
    // no changes
    if (currentScrollInRange === previousScrollInRange) {
      return;
    }

    // control progress of the animation using negative animation-delay (0 to -1s)
    const animationPercent = currentScrollInRange / scrollRange;
    menuElement.style.animationDelay = animationPercent * -1 + 's';
  });
}

export default StickyHeader;
