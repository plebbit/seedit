import { useEffect, useRef, useState } from 'react';
import { FloatingFocusManager, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { Challenge as ChallengeType, useComment, useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import useChallengesStore from '../../stores/use-challenges-store';
import useTheme from '../../hooks/use-theme';
import styles from './challenge-modal.module.css';
import { getPublicationPreview, getPublicationType, getVotePreview } from '../../lib/utils/challenge-utils';

interface ChallengeProps {
  challenge?: ChallengeType;
  iframeUrl?: string | null;
  publication?: any;
  closeModal: () => void;
}

const ChallengeContent = ({ challenge, iframeUrl, publication, closeModal }: ChallengeProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const [theme] = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [iframeUrlState, setIframeUrl] = useState<string>('');
  const [iframeOrigin, setIframeOrigin] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle regular challenges
  if (challenge && !iframeUrl) {
    const challenges = challenge?.[0]?.challenges;
    const publicationTarget = challenge?.[2];
    const publicationType = getPublicationType(challenge?.[1]);
    const publicationContent = publicationType === 'vote' ? getPublicationPreview(publicationTarget) : getPublicationPreview(challenge?.[1]);
    const votePreview = getVotePreview(challenge?.[1]);

    const { parentCid, shortSubplebbitAddress, subplebbitAddress } = challenge?.[1] || {};
    const parentComment = useComment({ commentCid: parentCid, onlyIfCached: true });
    const parentAddress = parentComment?.author?.shortAddress;

    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    const isTextChallenge = challenges?.[currentChallengeIndex]?.type === 'text/plain';
    const isImageChallenge = challenges?.[currentChallengeIndex]?.type === 'image/png';

    const isValidAnswer = (index: number) => {
      return !!answers[index] && answers[index].trim() !== '';
    };

    const onAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentChallengeIndex] = e.target.value;
        return updatedAnswers;
      });
    };

    const onSubmit = () => {
      challenge[1].publishChallengeAnswers(answers);
      setAnswers([]);
      closeModal();
    };

    const onEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      if (!isValidAnswer(currentChallengeIndex)) return;
      if (challenges?.[currentChallengeIndex + 1]) {
        setCurrentChallengeIndex((prev) => prev + 1);
      } else {
        onSubmit();
      }
    };

    return (
      <>
        <div className={styles.title}>{t('challenge_from', { subplebbit: shortSubplebbitAddress || subplebbitAddress })}</div>
        <div className={styles.subTitle}>
          {publicationType === 'vote' && votePreview + ' '}
          {parentCid
            ? t('challenge_for_reply', { parentAddress, publicationContent, interpolation: { escapeValue: false } })
            : t('challenge_for_post', { publicationContent, interpolation: { escapeValue: false } })}
        </div>
        <div className={styles.challengeMediaWrapper}>
          {isTextChallenge && <div className={styles.challengeMedia}>{challenges?.[currentChallengeIndex]?.challenge}</div>}
          {isImageChallenge && (
            <img alt={t('loading')} className={styles.challengeMedia} src={`data:image/png;base64,${challenges?.[currentChallengeIndex]?.challenge}`} />
          )}
        </div>
        <div>
          <input
            onKeyDown={onEnterKey}
            onChange={onAnswersChange}
            value={answers[currentChallengeIndex] || ''}
            className={styles.challengeInput}
            autoCorrect='off'
            autoComplete='off'
            spellCheck='false'
          />
        </div>
        <div className={styles.challengeFooter}>
          <div className={styles.counter}>{t('challenge_counter', { index: currentChallengeIndex + 1, total: challenges?.length })}</div>
          <span className={styles.buttons}>
            {!challenges?.[currentChallengeIndex + 1] && (
              <button onClick={onSubmit} disabled={!isValidAnswer(currentChallengeIndex)}>
                {t('submit')}
              </button>
            )}
            <button onClick={closeModal}>{t('cancel')}</button>
            {challenges && challenges.length > 1 && (
              <button disabled={!challenges[currentChallengeIndex - 1]} onClick={() => setCurrentChallengeIndex((prev) => prev - 1)}>
                {t('previous')}
              </button>
            )}
            {challenges?.[currentChallengeIndex + 1] && <button onClick={() => setCurrentChallengeIndex((prev) => prev + 1)}>{t('next')}</button>}
          </span>
        </div>
      </>
    );
  }

  // Handle iframe challenges
  if (iframeUrl && publication) {
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

      let processedUrl = iframeUrl;

      // Only replace {userAddress} placeholder if it exists in the URL
      if (iframeUrl.includes('{userAddress}')) {
        if (!userAddress) {
          // If no address is available, remove the placeholder (empty string)
          processedUrl = iframeUrl.replace(/\{userAddress\}/g, '');
        } else {
          processedUrl = iframeUrl.replace(/\{userAddress\}/g, encodedAddress);
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
        const validatedUrl = new URL(processedUrl);
        setIframeUrl(validatedUrl.toString());
        setIframeOrigin(validatedUrl.origin);
        setShowConfirmation(false);
      } catch (error) {
        console.error('Invalid URL constructed for iframe:', processedUrl, error);
        alert('Error: Invalid URL for authentication challenge');
        closeModal();
      }
    };

    // Send theme information to iframe via postMessage
    const sendThemeToIframe = () => {
      if (!iframeRef.current) {
        return;
      }

      try {
        iframeRef.current.contentWindow?.postMessage(
          {
            type: 'plebbit-theme',
            theme: theme,
            source: 'plebbit-seedit',
          },
          iframeOrigin,
        );
      } catch (error) {
        console.warn('Could not send theme to iframe:', error);
      }
    };

    // Handle iframe load event
    const handleIframeLoad = () => {
      sendThemeToIframe();
    };

    // Re-send theme to iframe when theme changes (synchronize with external iframe system)
    useEffect(() => {
      if (iframeRef.current && iframeUrlState && iframeOrigin && !showConfirmation) {
        sendThemeToIframe();
      }
    }, [theme, iframeOrigin]);

    return (
      <>
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
                src={iframeUrlState}
                sandbox='allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation'
                onLoad={handleIframeLoad}
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
      </>
    );
  }

  return null;
};

const ChallengeModal = () => {
  const { challenges, removeChallenge, iframeModalOpen, iframeModalUrl, iframeModalPublication, closeIframeModal } = useChallengesStore();

  // Determine which modal should be open
  const isRegularChallengeOpen = !!challenges.length;
  const isIframeChallengeOpen = iframeModalOpen && iframeModalUrl;

  const isOpen = isRegularChallengeOpen || isIframeChallengeOpen;
  const closeModal = () => {
    if (isRegularChallengeOpen) {
      removeChallenge();
    }
    if (isIframeChallengeOpen) {
      closeIframeModal();
    }
  };

  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: closeModal,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePress: false });
  const role = useRole(context);
  const headingId = useId();
  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div className={styles.modal} ref={refs.setFloating} aria-labelledby={headingId} {...getFloatingProps()}>
            <div className={styles.container}>
              <ChallengeContent
                challenge={isRegularChallengeOpen ? challenges[0] : undefined}
                iframeUrl={iframeModalUrl}
                publication={iframeModalPublication}
                closeModal={closeModal}
              />
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default ChallengeModal;
