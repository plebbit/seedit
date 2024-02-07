import { ChangeEvent, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PublishCommentOptions, useAccount, usePublishComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import { Trans, useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { getRandomSubplebbits, useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';
import { alertChallengeVerificationFailed } from '../../lib/utils/challenge-utils';
import { getLinkMediaInfo } from '../../lib/utils/media-utils';
import { isValidURL } from '../../lib/utils/url-utils';
import { isSubmitView } from '../../lib/utils/view-utils';
import styles from './submit.module.css';
import challengesStore from '../../hooks/use-challenges';
import Embed from '../../components/post/embed/';

type SubmitState = {
  subplebbitAddress: string | undefined;
  title: string | undefined;
  content: string | undefined;
  link: string | undefined;
  publishCommentOptions: PublishCommentOptions;
  setSubmitStore: (data: Partial<SubmitState>) => void;
  resetSubmitStore: () => void;
};

const { addChallenge } = challengesStore.getState();

const useSubmitStore = create<SubmitState>((set) => ({
  subplebbitAddress: undefined,
  title: undefined,
  content: undefined,
  link: undefined,
  publishCommentOptions: {},
  setSubmitStore: ({ subplebbitAddress, title, content, link }) =>
    set((state) => {
      const nextState = { ...state };
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;
      if (title !== undefined) nextState.title = title;
      if (content !== undefined) nextState.content = content;
      if (link !== undefined) nextState.link = link;

      nextState.publishCommentOptions = {
        ...nextState,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
          let errorMessage = error.message;
          alert(errorMessage);
        },
      };
      return nextState;
    }),
  resetSubmitStore: () => set({ subplebbitAddress: undefined, title: undefined, content: undefined, link: undefined, publishCommentOptions: undefined }),
}));

const UrlField = forwardRef<HTMLInputElement>((_, ref) => {
  const { t } = useTranslation();
  const { setSubmitStore } = useSubmitStore();
  const [mediaError, setMediaError] = useState(false);
  const [url, setUrl] = useState('');
  const [mediaType, setMediaType] = useState('');

  useEffect(() => {
    const mediaInfo = getLinkMediaInfo(url);
    if (mediaInfo?.type) {
      setMediaType(mediaInfo.type);
    }
  }, [url]);

  let mediaComponent;

  if (mediaType === 'image') {
    mediaComponent = <img src={url} alt='' onError={() => setMediaError(true)} />;
  } else if (mediaType === 'video') {
    mediaComponent = <video src={url} controls />;
  } else if (mediaType === 'webpage') {
    mediaComponent = <></>;
  } else if (mediaType === 'audio') {
    mediaComponent = <audio src={url} controls />;
  } else if (mediaType === 'iframe') {
    mediaComponent = <Embed url={url} />;
  }

  return (
    <>
      {url && isValidURL(url) ? (
        <span className={styles.boxTitleOptional}>{mediaType}</span>
      ) : (
        <>
          <span className={styles.boxTitleOptional}>url</span>
          <span className={styles.optional}> ({t('optional')})</span>
        </>
      )}
      <div className={styles.boxContent}>
        <input
          className={`${styles.input} ${styles.inputUrl}`}
          type='text'
          value={url ?? ''}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          ref={ref}
          onChange={(e) => {
            setUrl(e.target.value);
            setMediaError(false);
            setSubmitStore({ link: e.target.value });
          }}
        />
        {url && isValidURL(url) ? (
          <div className={styles.mediaPreview}>{mediaError ? <span className={styles.mediaError}>{t('no_media_found')}</span> : mediaComponent}</div>
        ) : (
          <div className={styles.description}>{t('submit_url_description')}</div>
        )}
      </div>
    </>
  );
});

const Submit = () => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const paramsSubplebbitAddress = params.subplebbitAddress;
  const [inputAddress, setInputAddress] = useState('');
  const [selectedSubplebbit, setSelectedSubplebbit] = useState(paramsSubplebbitAddress);
  const subplebbit = useSubplebbit({ subplebbitAddress: selectedSubplebbit });
  const navigate = useNavigate();

  const location = useLocation();
  const isInSubmitView = isSubmitView(location.pathname);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const subplebbitAddressRef = useRef<HTMLInputElement>(null);

  const { subplebbitAddress, publishCommentOptions, setSubmitStore, resetSubmitStore } = useSubmitStore();
  const { index, publishComment } = usePublishComment(publishCommentOptions);
  const { subscriptions } = account || {};
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = t('submit_to_before') + (selectedSubplebbit ? subplebbit?.title || subplebbit?.shortAddress || 'seedit' : 'seedit') + t('submit_to_after');
  }, [selectedSubplebbit, subplebbit, t]);

  const onPublish = () => {
    if (!titleRef.current?.value) {
      alert(`Missing title`);
      return;
    }
    if (linkRef.current?.value && !isValidURL(linkRef.current?.value)) {
      alert(`Invalid URL`);
      return;
    }
    if (!subplebbitAddressRef.current?.value) {
      alert(`Missing community address`);
      return;
    }

    publishComment();
  };

  // redirect to pending page when pending comment is created
  useEffect(() => {
    if (typeof index === 'number') {
      resetSubmitStore();
      navigate(`/profile/${index}`);
    }
  }, [index, resetSubmitStore, navigate]);

  const subsDescription = <div className={styles.subsDescription}>{subscriptions?.length > 5 ? t('submit_subscriptions') : t('submit_subscriptions_notice')}</div>;

  const [randomSubplebbits, setRandomSubplebbits] = useState<string[]>([]);
  useEffect(() => {
    // Generate random subplebbits only once when the component mounts
    const generatedSubplebbits = getRandomSubplebbits(defaultSubplebbitAddresses, 10);
    setRandomSubplebbits(generatedSubplebbits);
  }, [defaultSubplebbitAddresses]);
  const listSource = subscriptions?.length > 5 ? subscriptions : randomSubplebbits;
  const subscriptionsList = (
    <div className={styles.subs}>
      {listSource.map((sub: string) => (
        <span
          key={sub}
          className={styles.sub}
          onClick={() => {
            if (subplebbitAddressRef.current) {
              subplebbitAddressRef.current.value = sub;
              setSelectedSubplebbit(sub);
            }
          }}
        >
          {getShortAddress(sub)}
        </span>
      ))}
    </div>
  );

  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);
  const [isInputAddressFocused, setIsInputAddressFocused] = useState(false);

  const filteredSubplebbitAddresses = defaultSubplebbitAddresses.filter((address) => address.toLowerCase().includes(inputAddress.toLowerCase())).slice(0, 10);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveDropdownIndex((prevIndex) => (prevIndex < filteredSubplebbitAddresses.length - 1 ? prevIndex + 1 : prevIndex));
      } else if (e.key === 'ArrowUp') {
        setActiveDropdownIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      } else if (e.key === 'Enter' && activeDropdownIndex !== -1) {
        const selectedAddress = filteredSubplebbitAddresses[activeDropdownIndex];
        if (subplebbitAddressRef.current) {
          subplebbitAddressRef.current.value = selectedAddress;
          setSelectedSubplebbit(selectedAddress);
        }
        setSubmitStore({ subplebbitAddress: selectedAddress });
        setInputAddress('');
        setActiveDropdownIndex(-1);
      }
    },
    [filteredSubplebbitAddresses, activeDropdownIndex, subplebbitAddressRef, setSelectedSubplebbit, setSubmitStore],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const defaultSubplebbitsDropdown = inputAddress && (
    <ul className={styles.dropdown}>
      {filteredSubplebbitAddresses.map((subplebbitAddress, index) => (
        <li
          key={subplebbitAddress}
          className={`${styles.dropdownItem} ${index === activeDropdownIndex ? styles.activeDropdownItem : ''}`}
          onClick={() => setSelectedSubplebbit(subplebbitAddress)}
          onMouseEnter={() => setActiveDropdownIndex(index)}
        >
          {subplebbitAddress}
        </li>
      ))}
    </ul>
  );

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
    setSelectedSubplebbit(e.target.value);
  };

  useEffect(() => {
    if (inputAddress) {
      setSelectedSubplebbit(inputAddress);
    }
  }, [inputAddress]);

  useEffect(() => {
    if (selectedSubplebbit) {
      setSubmitStore({ subplebbitAddress: selectedSubplebbit });
    }
  }, [selectedSubplebbit, setSubmitStore]);

  useEffect(() => {
    if (paramsSubplebbitAddress) {
      setSubmitStore({ subplebbitAddress: paramsSubplebbitAddress });
    }
  }, [paramsSubplebbitAddress, setSubmitStore]);

  return (
    <div className={styles.content}>
      <h1>
        <Trans
          i18nKey='submit_to'
          shouldUnescape={true}
          values={{ link: subplebbit?.title || subplebbit?.shortAddress || 'seedit' }}
          components={{ 1: isInSubmitView ? <></> : <Link to={`/p/${subplebbitAddress}`} className={styles.location} /> }}
        />
      </h1>
      <div className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.box}>
            <UrlField ref={linkRef} />
          </div>
          <div className={styles.box}>
            <span className={styles.boxTitleRequired}>{t('title')}</span>
            <div className={styles.boxContent}>
              <textarea
                className={`${styles.input} ${styles.inputTitle}`}
                ref={titleRef}
                onChange={(e) => {
                  setSubmitStore({ title: e.target.value });
                }}
              />
            </div>
          </div>
          <div className={styles.box}>
            <span className={styles.boxTitleOptional}>{t('text')}</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.boxContent}>
              <textarea
                className={`${styles.input} ${styles.inputText}`}
                ref={contentRef}
                onChange={(e) => {
                  setSubmitStore({ content: e.target.value });
                }}
              />
            </div>
          </div>
          <div className={styles.box}>
            <span className={styles.boxTitleRequired}>{t('submit_choose')}</span>
            <div className={styles.boxContent}>
              <span className={styles.boxSubtitle}>{t('community_address')}:</span>
              <input
                className={`${styles.input} ${styles.inputCommunity}`}
                type='text'
                placeholder={`"community.eth" ${t('or')} "12D3KooW..."`}
                onFocus={() => setIsInputAddressFocused(true)}
                onBlur={() => setTimeout(() => setIsInputAddressFocused(false), 100)}
                autoCorrect='off'
                autoComplete='off'
                spellCheck='false'
                value={selectedSubplebbit}
                defaultValue={selectedSubplebbit ? paramsSubplebbitAddress : undefined}
                ref={subplebbitAddressRef}
                onChange={(e) => {
                  handleAddressChange(e);
                  setSubmitStore({ subplebbitAddress: e.target.value });
                }}
              />
              {inputAddress && isInputAddressFocused && defaultSubplebbitsDropdown}
              {subsDescription}
              {subscriptionsList}
            </div>
          </div>
          {subplebbit?.rules && (
            <div className={styles.box}>
              <span className={`${styles.boxTitle} ${styles.rulesTitle}`}>
                {t('rules_for')} p/{subplebbit?.shortAddress}
              </span>
              <div className={styles.boxContent}>
                <div className={styles.description}>
                  <ol className={styles.rules}>{subplebbit?.rules.map((rule: string, index: number) => <li key={index}>{rule}</li>)}</ol>
                </div>
              </div>
            </div>
          )}
          <div className={`${styles.box} ${styles.notice}`}>{t('submit_notice')}</div>
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
