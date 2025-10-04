import { useCallback, useEffect, useRef, useState } from 'react';
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

interface ChallengeHeaderProps {
  publicationType: string | null;
  votePreview: string;
  parentCid?: string;
  parentAddress?: string;
  publicationContent: string;
  subplebbit?: string;
}

const useParentAddress = (parentCid?: string) => {
  const parentComment = useComment({ commentCid: parentCid, onlyIfCached: true });
  return parentComment?.author?.shortAddress;
};

const ChallengeHeader = ({ publicationType, votePreview, parentCid, parentAddress, publicationContent, subplebbit }: ChallengeHeaderProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.title}>{t('challenge_from', { subplebbit })}</div>
      <div className={styles.subTitle}>
        {publicationType === 'vote' && votePreview + ' '}
        {parentCid
          ? t('challenge_for_reply', { parentAddress, publicationContent, interpolation: { escapeValue: false } })
          : t('challenge_for_post', { publicationContent, interpolation: { escapeValue: false } })}
      </div>
    </>
  );
};

interface RegularChallengeContentProps {
  challenge: ChallengeType;
  closeModal: () => void;
}

const RegularChallengeContent = ({ challenge, closeModal }: RegularChallengeContentProps) => {
  const { t } = useTranslation();
  const challenges = challenge?.[0]?.challenges;
  const publicationTarget = challenge?.[2];
  const publicationType = getPublicationType(challenge?.[1]);
  const publicationContent = publicationType === 'vote' ? getPublicationPreview(publicationTarget) : getPublicationPreview(challenge?.[1]);
  const votePreview = getVotePreview(challenge?.[1]);

  const { parentCid, shortSubplebbitAddress, subplebbitAddress } = challenge?.[1] || {};
  const parentAddress = useParentAddress(parentCid);

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const currentChallenge = challenges?.[currentChallengeIndex];
  const isTextChallenge = currentChallenge?.type === 'text/plain';
  const isImageChallenge = currentChallenge?.type === 'image/png';

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

  const subplebbit = shortSubplebbitAddress || subplebbitAddress;

  return (
    <>
      <ChallengeHeader
        publicationType={publicationType ?? null}
        votePreview={votePreview}
        parentCid={parentCid}
        parentAddress={parentAddress}
        publicationContent={publicationContent}
        subplebbit={subplebbit}
      />
      <div className={styles.challengeMediaWrapper}>
        {isTextChallenge && <div className={styles.challengeMedia}>{currentChallenge?.challenge}</div>}
        {isImageChallenge && <img alt={t('loading')} className={styles.challengeMedia} src={`data:image/png;base64,${currentChallenge?.challenge}`} />}
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
};

interface IframeChallengeContentProps {
  iframeUrl: string;
  publication: any;
  closeModal: () => void;
}

const IframeChallengeContent = ({ iframeUrl, publication, closeModal }: IframeChallengeContentProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const [theme] = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [iframeUrlState, setIframeUrl] = useState<string>('');
  const [iframeOrigin, setIframeOrigin] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const publicationType = getPublicationType(publication);
  const publicationContent = getPublicationPreview(publication);
  const votePreview = getVotePreview(publication);
  const { shortSubplebbitAddress, subplebbitAddress, parentCid } = publication || {};
  const parentComment = useComment({ commentCid: parentCid, onlyIfCached: true });
  const parentAddress = parentComment?.author?.shortAddress || '';

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
    const rawUserAddress = account?.author?.address?.trim();
    const requiresUserAddress = iframeUrl.includes('{userAddress}');

    if (requiresUserAddress && !rawUserAddress) {
      alert(
        t('iframe_challenge_missing_user_address', {
          defaultValue: 'Error: Unable to load challenge without your address. Please sign in and try again.',
        }),
      );
      return;
    }

    const encodedAddress = rawUserAddress ? encodeURIComponent(rawUserAddress) : undefined;
    const replacedUrl = requiresUserAddress && encodedAddress ? iframeUrl.replace(/\{userAddress\}/g, encodedAddress) : iframeUrl;

    try {
      const validatedUrl = new URL(replacedUrl);

      if (validatedUrl.protocol !== 'https:') {
        throw new Error('Only HTTPS iframe challenges are supported');
      }

      validatedUrl.pathname = validatedUrl.pathname.replace(/\/{2,}/g, '/');
      validatedUrl.searchParams.set('theme', theme);

      const finalUrl = validatedUrl.toString();
      setIframeUrl(finalUrl);
      setIframeOrigin(validatedUrl.origin);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Invalid iframe challenge URL', { error });
      alert('Error: Invalid URL for authentication challenge');
      closeModal();
    }
  };

  const sendThemeToIframe = useCallback(() => {
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
  }, [iframeOrigin, theme]);

  const handleIframeLoad = () => {
    sendThemeToIframe();
  };

  useEffect(() => {
    if (iframeRef.current && iframeUrlState && iframeOrigin && !showConfirmation) {
      sendThemeToIframe();
    }
  }, [iframeOrigin, iframeUrlState, sendThemeToIframe, showConfirmation]);

  const subplebbit = shortSubplebbitAddress || subplebbitAddress;

  return (
    <>
      <ChallengeHeader
        publicationType={publicationType ?? null}
        votePreview={votePreview}
        parentCid={parentCid}
        parentAddress={parentAddress}
        publicationContent={publicationContent}
        subplebbit={subplebbit}
      />

      {showConfirmation ? (
        <>
          <div className={styles.challengeMediaWrapper}>
            <div className={`${styles.challengeMedia} ${styles.iframeChallengeWarning}`}>
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
          <div className={`${styles.challengeMediaWrapper} ${styles.iframeWrapper}`}>
            <iframe
              ref={iframeRef}
              src={iframeUrlState}
              sandbox='allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation'
              onLoad={handleIframeLoad}
              className={styles.iframe}
              title={t('challenge_iframe', { defaultValue: 'Challenge authentication' })}
            />
          </div>
          <div className={`${styles.challengeFooter} ${styles.iframeFooter}`}>
            <div className={styles.iframeInstruction}>
              {t('iframe_challenge_keep_open', { defaultValue: 'Complete the challenge in the box above. Keep this window open until done.' })}
            </div>
            <div className={styles.iframeCloseButton}>
              <button onClick={closeModal}>{t('close', { defaultValue: 'close' })}</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const ChallengeContent = ({ challenge, iframeUrl, publication, closeModal }: ChallengeProps) => {
  if (challenge && !iframeUrl) {
    return <RegularChallengeContent challenge={challenge} closeModal={closeModal} />;
  }

  if (iframeUrl && publication) {
    return <IframeChallengeContent iframeUrl={iframeUrl} publication={publication} closeModal={closeModal} />;
  }

  return null;
};

const ChallengeModal = () => {
  const { challenges, removeChallenge, iframeModalOpen, iframeModalUrl, iframeModalPublication, closeIframeModal } = useChallengesStore();

  // Determine which modal should be open
  const isRegularChallengeOpen = !!challenges.length;
  const isIframeChallengeOpen = iframeModalOpen && !!iframeModalUrl;

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
