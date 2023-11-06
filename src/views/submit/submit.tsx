import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Challenge, usePublishComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import styles from './submit.module.css';
import useCurrentView from '../../hooks/use-current-view';
import challengesStore from '../../hooks/use-challenges';
import { alertChallengeVerificationFailed, isValidENS, isValidIPFS, isValidURL } from '../../lib/utils';

type SubmitStoreState = {
  subplebbitAddress: string | undefined;
  title: string | undefined;
  content: string | undefined;
  link: string | undefined;
  publishCommentOptions: any;
  setSubmitStore: (data: Partial<SubmitStoreState>) => void;
  resetSubmitStore: () => void;
};

const { addChallenge } = challengesStore.getState();

const useSubmitStore = create<SubmitStoreState>((set) => ({
  subplebbitAddress: undefined,
  title: undefined,
  content: undefined,
  link: undefined,
  publishCommentOptions: undefined,
  setSubmitStore: ({ subplebbitAddress, title, content, link }) =>
    set((state) => {
      const nextState = { ...state };
      if (subplebbitAddress !== undefined) {
        nextState.subplebbitAddress = subplebbitAddress;
      }
      if (title !== undefined) {
        nextState.title = title;
      }
      if (content !== undefined) {
        nextState.content = content;
      }
      if (link !== undefined) {
        nextState.link = link;
      }
      nextState.publishCommentOptions = {
        ...nextState,
        onChallenge: (challenge: Challenge) => addChallenge(challenge),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
          alert(error.message);
        },
      };
      return nextState;
    }),
  resetSubmitStore: () => set({ subplebbitAddress: undefined, title: undefined, content: undefined, link: undefined, publishCommentOptions: undefined }),
}));

const Submit = () => {
  const { t } = useTranslation();
  const { isSubplebbitSubmitView } = useCurrentView();
  const { subplebbitAddress } = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};
  const navigate = useNavigate();

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const urlRef = useRef<HTMLInputElement | null>(null);
  const subplebbitAddressRef = useRef<HTMLInputElement | null>(null);

  const { publishCommentOptions, setSubmitStore, resetSubmitStore } = useSubmitStore();

  const { index, publishComment } = usePublishComment(publishCommentOptions);

  const onPublish = () => {
    const titleValue = titleRef.current?.value;
    const textValue = textRef.current?.value;
    const urlValue = urlRef.current?.value;
    const subplebbitAddressValue = subplebbitAddressRef.current?.value;

    setSubmitStore({
      subplebbitAddress: subplebbitAddressValue,
      title: titleValue,
      content: textValue,
      link: urlValue,
    });

    if (!titleValue) {
      alert(`Missing title`);
      return;
    }
    if (!textValue && !urlValue) {
      alert(`Provide either a link or text`);
      return;
    }
    if (urlValue && !isValidURL(urlValue)) {
      alert(`Invalid URL`);
      return;
    }
    if (!subplebbitAddressValue) {
      alert(`Missing community address`);
      return;
    }
    if (!isValidENS(subplebbitAddressValue) && !isValidIPFS(subplebbitAddressValue)) {
      alert(`Invalid community address`);
      return;
    }
    publishComment();
    resetSubmitStore();
  };

  const subLocation = (
    <Link to={`/p/${subplebbitAddress}`} className={styles.location} onClick={(e) => e.preventDefault()}>
      {title || shortAddress}
    </Link>
  );

  useEffect(() => {
    if (typeof index === 'number') {
      resetSubmitStore();
      navigate(`/profile/${index}`);
    }
  }, [index, resetSubmitStore, navigate]);

  return (
    <div className={styles.content}>
      <h1>
        {t('submit_to_before')}
        {isSubplebbitSubmitView ? subLocation : 'seedit'}
        {t('submit_to_after')}
      </h1>
      <div className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>url</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <input className={`${styles.input} ${styles.inputUrl}`} type='text' ref={urlRef} />
              <div className={styles.description}>{t('submit_url_description')}</div>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('title')}</span>
            <div className={styles.fieldContent}>
              <textarea className={`${styles.input} ${styles.inputTitle}`} ref={titleRef} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>{t('text')}</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <textarea className={`${styles.input} ${styles.inputText}`} ref={textRef} />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('submit_choose')}</span>
            <div className={styles.fieldContent}>
              <span className={styles.fieldSubtitle}>{t('community_address')}:</span>
              <input
                className={`${styles.input} ${styles.inputCommunity}`}
                type='text'
                placeholder='"community.eth" or "12D3KooW..."'
                ref={subplebbitAddressRef}
              />
            </div>
          </div>
          <div className={`${styles.field} ${styles.notice}`}>{t('submit_notice')}</div>
          <div>*{t('required')}</div>
          <div className={styles.submit}>
            <button className={styles.submitButton} onClick={onPublish}>
              {t('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
