import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import styles from './share-menu.module.css';
import { copyShareLinkToClipboard } from '../../../../lib/utils/url-utils';

type ShareMenuProps = {
  cid: string;
  subplebbitAddress: string;
};

const ShareButton = ({ cid, subplebbitAddress }: ShareMenuProps) => {
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (hasShared) {
      setTimeout(() => setHasShared(false), 2000);
    }
  }, [hasShared]);

  return (
    <div className={`${!hasShared ? styles.menuItem : styles.text}`}>
      <span
        onClick={() => {
          setHasShared(true);
          copyShareLinkToClipboard(subplebbitAddress, cid);
        }}
      >
        {hasShared ? 'link copied' : 'copy link'}
      </span>
    </div>
  );
};

const ShareMenu = ({ cid, subplebbitAddress }: ShareMenuProps) => {
  const { t } = useTranslation();
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isShareMenuOpen,
    onOpenChange: setIsShareMenuOpen,
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
        <span onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}>{t('share')}</span>
      </li>
      {isShareMenuOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.modMenu}>
              <ShareButton cid={cid} subplebbitAddress={subplebbitAddress} />
              <div className={styles.menuItem}>
                <a href={`https://plebchan.eth.limo/#/p/${subplebbitAddress}/c/${cid}`} target='_blank' rel='noopener noreferrer'>
                  view on plebchan
                </a>
              </div>
              <div className={styles.menuItem}>
                <a href={`https://plebones.eth.limo/#/p/${subplebbitAddress}/c/${cid}`} target='_blank' rel='noopener noreferrer'>
                  view on plebones
                </a>
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default ShareMenu;
