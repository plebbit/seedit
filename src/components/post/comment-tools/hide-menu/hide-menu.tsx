import { useState } from 'react';
import { Author, useBlock } from '@plebbit/plebbit-react-hooks';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import styles from './hide-menu.module.css';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';

type HideMenuProps = {
  author?: Author | undefined;
  cid?: string;
  subplebbitAddress?: string;
};

const BlockAuthorButton = ({ author }: HideMenuProps) => {
  // const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: author?.address });

  return (
    <>
      <div className={styles.menuItem} onClick={blocked ? unblock : block}>
        {blocked ? 'unblock' : 'block'} u/{author?.shortAddress}
      </div>
    </>
  );
};

const BlockSubplebbitButton = ({ subplebbitAddress }: HideMenuProps) => {
  // const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: subplebbitAddress });

  return (
    <>
      <div className={styles.menuItem} onClick={blocked ? unblock : block}>
        {blocked ? 'unblock' : 'block'} p/{subplebbitAddress && getShortAddress(subplebbitAddress)}
      </div>
    </>
  );
};

const BlockCommentButton = ({ cid }: HideMenuProps) => {
  // const { t } = useTranslation();
  const { blocked, unblock, block } = useBlock({ address: cid });

  return (
    <>
      <div className={styles.menuItem} onClick={blocked ? unblock : block}>
        {blocked ? 'unhide' : 'hide'} post
      </div>
    </>
  );
};

const HideMenu = ({ author, cid, subplebbitAddress }: HideMenuProps) => {
  const { t } = useTranslation();
  const [isHideMenuOpen, setIsHideMenuOpen] = useState(false);

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
        <span onClick={() => setIsHideMenuOpen(!isHideMenuOpen)}>{t('post_hide')}</span>
      </li>
      {isHideMenuOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.modMenu}>
              <BlockCommentButton cid={cid} />
              <BlockSubplebbitButton subplebbitAddress={subplebbitAddress} />
              <BlockAuthorButton author={author} />
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default HideMenu;
