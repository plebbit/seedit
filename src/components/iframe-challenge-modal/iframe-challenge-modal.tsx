import { useEffect, useState } from 'react';
import { FloatingFocusManager, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import useChallengesStore from '../../stores/use-challenges-store';
import styles from '../challenge-modal/challenge-modal.module.css';
import { getPublicationPreview, getPublicationType, getVotePreview } from '../../lib/utils/challenge-utils';

interface IframeChallengeProps {
  url: string;
  publication: any;
  closeModal: () => void;
}

const IframeChallenge = ({ url, publication, closeModal }: IframeChallengeProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string>('');

  const publicationType = getPublicationType(publication);
  const publicationContent = getPublicationPreview(publication);
  const votePreview = getVotePreview(publication);
  const { shortSubplebbitAddress, subplebbitAddress, parentCid } = publication || {};

  useEffect(() => {
    const onEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', onEscapeKey);
    return () => document.removeEventListener('keydown', onEscapeKey);
  }, [closeModal]);

  const handleLoadIframe = () => {
    // Replace {userAddress} placeholder with actual user address
    const userAddress = account?.author?.address || '';
    const processedUrl = url.replace(/\{userAddress\}/g, userAddress);
    setIframeUrl(processedUrl);
    setShowConfirmation(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t('challenge_from', { subplebbit: shortSubplebbitAddress || subplebbitAddress })}</div>
      <div className={styles.subTitle}>
        {publicationType === 'vote' && votePreview + ' '}
        {parentCid
          ? t('challenge_for_reply', { parentAddress: '', publicationContent, interpolation: { escapeValue: false } })
          : t('challenge_for_post', { publicationContent, interpolation: { escapeValue: false } })}
      </div>

      {showConfirmation ? (
        <>
          <div className={styles.challengeMediaWrapper}>
            <div className={styles.challengeMedia} style={{ fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              {t('iframe_challenge_warning', {
                defaultValue: 'This challenge requires loading an external website. Loading it will reveal your IP address to that website. Do you want to continue?',
              })}
            </div>
          </div>
          <div className={styles.challengeFooter}>
            <span className={styles.buttons}>
              <button onClick={handleLoadIframe}>{t('load_external_resource', { defaultValue: 'load' })}</button>
              <button onClick={closeModal}>{t('cancel')}</button>
            </span>
          </div>
        </>
      ) : (
        <>
          <div className={styles.challengeMediaWrapper} style={{ height: '400px', marginTop: '20px' }}>
            <iframe
              src={iframeUrl}
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid var(--border-text)',
                backgroundColor: 'white',
              }}
              title={t('challenge_iframe', { defaultValue: 'Challenge authentication' })}
            />
          </div>
          <div className={styles.challengeFooter}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>
              {t('iframe_challenge_keep_open', { defaultValue: 'Complete authentication in the iframe above. Keep this window open until done.' })}
            </div>
            <span className={styles.buttons}>
              <button onClick={closeModal}>{t('close', { defaultValue: 'close' })}</button>
            </span>
          </div>
        </>
      )}
    </div>
  );
};

const IframeChallengeModal = () => {
  const { iframeModalOpen, iframeModalUrl, iframeModalPublication, closeIframeModal } = useChallengesStore();
  const { refs, context } = useFloating({
    open: iframeModalOpen,
    onOpenChange: (open) => {
      if (!open) closeIframeModal();
    },
  });
  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePress: false });
  const role = useRole(context);
  const headingId = useId();
  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      {iframeModalOpen && iframeModalUrl && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} aria-labelledby={headingId} {...getFloatingProps()}>
            <IframeChallenge url={iframeModalUrl} publication={iframeModalPublication} closeModal={closeIframeModal} />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default IframeChallengeModal;
