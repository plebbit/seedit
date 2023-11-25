import styles from './sticky-header.module.css';

const StickyHeader = () => {
  return (
    <div className={styles.content} id='sticky-menu'>
      <span className={styles.button}>[p/all]</span>
      <span className={styles.button}>[hot]</span>
      <span className={styles.button}>[24h]</span>
      <span className={styles.button}>name.eth</span>
      <span className={styles.button}>✉️</span>
      <span className={styles.button}>🔎</span>
      <span className={styles.button}>[en]</span>
      <span className={styles.button}>[light]</span>
      <span className={styles.button}>preferences</span>
    </div>
  );
};

// sticky menu animation
// will trigger more than once with hot reloading during development
if (!window.STICKY_MENU_SCROLL_LISTENER) {
  window.STICKY_MENU_SCROLL_LISTENER = true;

  const scrollRange = 50; // the animation css px range in stickyMenuAnimation, must also edit css animation 100%: {top}
  // const topThreshold = 500 // Threshold near the top of the page where the animation starts
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

    // Automatically hide menu if the user is within 500px of the top
    if (currentScroll < 100) {
      menuElement.style.animationDelay = '-1s';
      return;
    }

    const scrollDifference = currentScroll - previousScroll;
    previousScroll = currentScroll;

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
