import { useState } from 'react';
import { Author, useBlock } from '@plebbit/plebbit-react-hooks';
import { autoUpdate, flip, FloatingFocusManager, offset, shift, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import styles from './hide-tools.module.css';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';

type HideToolsProps = {
  author?: Author | undefined;
  cid?: string;
  subplebbitAddress?: string;
}

const BlockAuthorButton = ({ author }: HideToolsProps) => {
  // const { t } = useTranslation();
  const {blocked, unblock, block} = useBlock({address: author?.address});

  return (
    <>
      <div className={styles.menuItem} onClick={blocked ? unblock : block}>
        {blocked ? 'unblock' : 'block'} u/{author?.shortAddress}
      </div>
    </>
  );
}

const BlockSubplebbitButton = ({ subplebbitAddress }: HideToolsProps) => {
  // const { t } = useTranslation();
  const {blocked, unblock, block} = useBlock({address: subplebbitAddress});

  return (
    <>
      <div className={styles.menuItem} onClick={blocked ? unblock : block}>
        {blocked ? 'unblock' : 'block'} p/{subplebbitAddress && getShortAddress(subplebbitAddress)}
      </div>
    </>
  );
}

const BlockCommentButton = ({ cid }: HideToolsProps) => {
  // const { t } = useTranslation();
  const {blocked, unblock, block} = useBlock({address: cid});

  return (
    <>
      <div className={styles.menuItem} onClick={blocked ? unblock : block}>
        {blocked ? 'unhide' : 'hide'} post
      </div>
    </>
  );
}

const HideTools = ({ author, cid, subplebbitAddress }: HideToolsProps) => {
  const { t } = useTranslation();
  const [isHideToolsOpen, setIsHideToolsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isHideToolsOpen,
    onOpenChange: setIsHideToolsOpen,
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
        <span onClick={() => setIsHideToolsOpen(!isHideToolsOpen)}>{t('post_hide')}</span>
      </li>
      {isHideToolsOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.modTools}>
              <BlockCommentButton cid={cid} />
              <BlockSubplebbitButton subplebbitAddress={subplebbitAddress} />
              <BlockAuthorButton author={author} />
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}

export default HideTools;
