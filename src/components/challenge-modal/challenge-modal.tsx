import { useEffect, useState } from 'react';
import { FloatingFocusManager, useClick, useDismiss, useFloating, useId, useInteractions, useRole } from '@floating-ui/react';
import { Challenge as ChallengeType } from '@plebbit/plebbit-react-hooks';
import useSubplebbitsPagesStore from '@plebbit/plebbit-react-hooks/dist/stores/subplebbits-pages';
import { useTranslation } from 'react-i18next';
import useChallenges from '../../stores/use-challenges-store';
import styles from './challenge-modal.module.css';
import { getPublicationPreview, getPublicationType, getVotePreview } from '../../lib/utils/challenge-utils';

interface ChallengeProps {
  challenge: ChallengeType;
  closeModal: () => void;
}

const Challenge = ({ challenge, closeModal }: ChallengeProps) => {
  const challenges = challenge?.[0]?.challenges;
  const publication = challenge?.[1];
  const publicationTarget = challenge?.[2];
  const publicationType = getPublicationType(publication);
  const publicationContent = publicationType === 'vote' ? getPublicationPreview(publicationTarget) : getPublicationPreview(publication);
  const votePreview = getVotePreview(publication);

  const { parentCid, shortSubplebbitAddress, subplebbitAddress } = publication || {};
  const { t } = useTranslation();
  const parentComment = useSubplebbitsPagesStore((state) => state.comments[parentCid]);

  const parentAddress = parentComment?.author?.shortAddress;

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const isTextChallenge = challenges[currentChallengeIndex].type === 'text/plain';
  const isImageChallenge = challenges[currentChallengeIndex].type === 'image/png';

  const onAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentChallengeIndex] = e.target.value;
      return updatedAnswers;
    });
  };

  const onSubmit = () => {
    publication.publishChallengeAnswers(answers);
    setAnswers([]);
    closeModal();
  };

  const onEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    if (!answers[currentChallengeIndex]) return;
    if (challenges[currentChallengeIndex + 1]) {
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      onSubmit();
    }
  };

  useEffect(() => {
    const onEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', onEscapeKey);
    return () => document.removeEventListener('keydown', onEscapeKey);
  }, [closeModal]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t('challenge_from', { subplebbit: shortSubplebbitAddress || subplebbitAddress })}</div>
      <div className={styles.subTitle}>
        {publicationType === 'vote' && votePreview + ' '}
        {parentCid
          ? t('challenge_for_reply', { parentAddress, publicationContent, interpolation: { escapeValue: false } })
          : t('challenge_for_post', { publicationContent, interpolation: { escapeValue: false } })}
      </div>
      <div className={styles.challengeMediaWrapper}>
        {isTextChallenge && <div className={styles.challengeMedia}>{challenges[currentChallengeIndex]?.challenge}</div>}
        {isImageChallenge && <img alt={t('loading')} className={styles.challengeMedia} src={`data:image/png;base64,${challenges[currentChallengeIndex]?.challenge}`} />}
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
          {!challenges[currentChallengeIndex + 1] && (
            <button onClick={onSubmit} disabled={!answers[currentChallengeIndex]}>
              {t('submit')}
            </button>
          )}
          <button onClick={closeModal}>{t('cancel')}</button>
          {challenges.length > 1 && (
            <button disabled={!challenges[currentChallengeIndex - 1]} onClick={() => setCurrentChallengeIndex((prev) => prev - 1)}>
              {t('previous')}
            </button>
          )}
          {challenges[currentChallengeIndex + 1] && <button onClick={() => setCurrentChallengeIndex((prev) => prev + 1)}>{t('next')}</button>}
        </span>
      </div>
    </div>
  );
};

const ChallengeModal = () => {
  const { challenges, removeChallenge } = useChallenges();
  const isOpen = !!challenges.length;
  const closeModal = () => removeChallenge();
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
            <Challenge challenge={challenges[0]} closeModal={closeModal} />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

export default ChallengeModal;
