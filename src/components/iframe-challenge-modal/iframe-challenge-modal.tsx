import { useEffect, useRef, useState } from 'react';
import { FloatingFocusManager, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import useChallengesStore from '../../stores/use-challenges-store';
import useTheme from '../../hooks/use-theme';
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
  const [theme] = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    // Validate and encode user address before URL substitution
    const userAddress = account?.author?.address || '';

    // Encode the user address for safe URL usage
    const encodedAddress = encodeURIComponent(userAddress);

    let processedUrl = url;

    // Only replace {userAddress} placeholder if it exists in the URL
    if (url.includes('{userAddress}')) {
      if (!userAddress) {
        // If no address is available, remove the placeholder (empty string)
        processedUrl = url.replace(/\{userAddress\}/g, '');
      } else {
        processedUrl = url.replace(/\{userAddress\}/g, encodedAddress);
      }
    }

    // Add theme parameter if the URL doesn't already have query parameters
    if (!processedUrl.includes('?')) {
      processedUrl += `?theme=${theme}`;
    } else {
      // If URL already has query parameters, append theme parameter
      processedUrl += `&theme=${theme}`;
    }

    // Validate that the final URL is well-formed
    try {
      new URL(processedUrl);
      setIframeUrl(processedUrl);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Invalid URL constructed for iframe:', processedUrl, error);
      alert('Error: Invalid URL for authentication challenge');
      closeModal();
    }
  };

  // Communicate theme to iframe when it loads or theme changes
  useEffect(() => {
    if (iframeRef.current && iframeUrl && !showConfirmation) {
      const sendThemeToIframe = () => {
        try {
          // Try to send theme information to the iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'plebbit-theme',
              theme: theme,
              source: 'plebbit-seedit',
            },
            '*',
          );
        } catch (error) {
          // Silently fail if postMessage isn't supported or iframe isn't ready
          console.warn('Could not send theme to iframe:', error);
        }
      };

      // Send theme immediately if iframe is already loaded
      if (iframeRef.current.contentDocument || iframeRef.current.contentWindow) {
        sendThemeToIframe();
      } else {
        // Wait for iframe to load and then send theme
        iframeRef.current.onload = sendThemeToIframe;
      }
    }
  }, [theme, iframeUrl, showConfirmation]);

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
          <div className={styles.challengeMediaWrapper} style={{ height: '70vh', marginTop: '20px', maxHeight: '600px' }}>
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              sandbox='allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation'
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid var(--border-text)',
                backgroundColor: 'white',
              }}
              title={t('challenge_iframe', { defaultValue: 'Challenge authentication' })}
            />
          </div>
          <div className={styles.challengeFooter} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              {t('iframe_challenge_keep_open', { defaultValue: 'Complete authentication in the iframe above. Keep this window open until done.' })}
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button onClick={closeModal}>{t('close', { defaultValue: 'close' })}</button>
            </div>
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
