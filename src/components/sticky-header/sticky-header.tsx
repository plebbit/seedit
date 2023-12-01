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

    // TODO: reomve after debugging
    // alert([
    //   'scrollDifference',
    //   scrollDifference,
    //   'currentScroll',
    //    currentScroll,
    //    'previousScroll',
    //    currentScroll - scrollDifference,
    //    'currentScrollInRange',
    //    currentScrollInRange,
    //    'previousScrollInRange',
    //    previousScrollInRange,
    //   'animationPercent',
    //   currentScrollInRange / scrollRange
    // ].join(' '))
    console.log([
      'scrollDifference',
      scrollDifference,
      'currentScroll',
      currentScroll,
      'previousScroll',
      currentScroll - scrollDifference,
      'currentScrollInRange',
      currentScrollInRange,
      'previousScrollInRange',
      previousScrollInRange,
      'animationPercent',
      currentScrollInRange / scrollRange,
      ].join(' ')
    );

    // fix mobile overflow scroll bug
    if (currentScroll === 0) {
      currentScrollInRange = 0;
    }

    // no changes
    if (currentScrollInRange === previousScrollInRange) {
      return;
    }

    // Get the menu element
    const menuElement = document.getElementById('sticky-menu');
    if (!menuElement) {
      return;
    }

    // control progress of the animation using negative animation-delay (0 to -1s)
    const animationPercent = currentScrollInRange / scrollRange;
    menuElement.style.animationDelay = animationPercent * -1 + 's';
  });
}

export default StickyHeader;
