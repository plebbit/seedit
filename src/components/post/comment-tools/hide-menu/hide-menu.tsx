import { useState } from 'react';
import { Author, useBlock } from '@plebbit/plebbit-react-hooks';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import styles from './hide-menu.module.css';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';

type HideMenuProps = {
  author?: Author | undefined;
  cid?: string;
  isMod?: boolean;
  toggleIsMenuOpen?: () => void;
  subplebbitAddress?: string;
};

const BlockAuthorButton = ({ author, toggleIsMenuOpen }: HideMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: author?.address });

  return (
    <div
      className={styles.menuItem}
      onClick={() => {
        (blocked ? unblock : block)();
        toggleIsMenuOpen && toggleIsMenuOpen();
      }}
    >
      {blocked ? `${t('unblock')}` : `${t('block')}`} u/{author?.shortAddress}
    </div>
  );
};

const BlockSubplebbitButton = ({ subplebbitAddress }: HideMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: subplebbitAddress });

  return (
    <div className={styles.menuItem} onClick={blocked ? unblock : block}>
      {blocked ? `${t('unblock')}` : `${t('block')}`} p/{subplebbitAddress && getShortAddress(subplebbitAddress)}
    </div>
  );
};

const BlockCommentButton = ({ cid }: HideMenuProps) => {
  const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: cid });

  return (
    <div className={styles.menuItem} onClick={blocked ? unblock : block}>
      {blocked ? `${t('unhide')}` : `${t('hide')}`} {t('post')}
    </div>
  );
};

const HideMenu = ({ author, cid, isMod, subplebbitAddress }: HideMenuProps) => {
  const { t } = useTranslation();
  const [isHideMenuOpen, setIsHideMenuOpen] = useState(false);
  const toggleIsMenuOpen = () => setIsHideMenuOpen(!isHideMenuOpen);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isHideMenuOpen,
    onOpenChange: setIsHideMenuOpen,
    middleware: [offset(2), flip({ fallbackAxisSideDirection: 'end' }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const headingId = useId();

  return (
    <>
      <li className={styles.button} ref={refs.setReference} {...getReferenceProps()}>
        <span onClick={() => setIsHideMenuOpen(!isHideMenuOpen)}>{t('hide')}</span>
      </li>
      {isHideMenuOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.menu}>
              <BlockCommentButton cid={cid} toggleIsMenuOpen={toggleIsMenuOpen} />
              <BlockSubplebbitButton subplebbitAddress={subplebbitAddress} />
              <BlockAuthorButton author={author} />
              {!isMod && <div className={`${styles.menuItem} ${styles.reportButton}`}>{t('report')}</div>}
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default HideMenu;
