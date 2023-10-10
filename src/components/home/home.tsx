import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import useDefaultSubplebbits from '../../hooks/use-default-subplebbits';
import useTheme from '../../hooks/use-theme';
import Header from '../header';
import TopBar from '../topbar';
import { useTranslation } from 'react-i18next';

type SnapshotType = StateSnapshot;

const lastVirtuosoStates: { [key: string]: SnapshotType } = {};

const NoPosts = () => 'no posts';

const Language: FC = () => {
  const { i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const availableLanguages = ['en', 'it'];

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <div style={{ padding: '5px' }}>
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

const Theme: FC = () => {
  const [theme, setTheme] = useTheme();
  return (
    <div style={{ padding: '5px' }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value='light'>light</option>
        <option value='dark'>dark</option>
      </select>
    </div>
  );
};

const Home: FC = () => {
  const subplebbitAddresses = useDefaultSubplebbits();
  const sortType = useParams<{ sortType: string }>().sortType || 'hot';
  const { feed, hasMore, loadMore } = useFeed({ subplebbitAddresses, sortType, postsPerPage: 10 });
  const loadingStateString = 'loading...';

  let Footer;
  if (feed?.length === 0) {
    Footer = NoPosts;
  }
  if (hasMore || subplebbitAddresses.length === 0) {
    Footer = () => loadingStateString;
  }

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: SnapshotType) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType]);

  const lastVirtuosoState = lastVirtuosoStates[sortType];

  return (
    <div>
      <TopBar />
      <Header />
      <Theme />
      <Language />
      <Virtuoso
        increaseViewportBy={{ bottom: 600, top: 600 }}
        totalCount={feed?.length || 0}
        data={feed}
        itemContent={(index, post) => <div key={`${post.cid}-${index}`}>{post.content}</div>}
        useWindowScroll={true}
        components={{ Footer }}
        endReached={loadMore}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />
    </div>
  );
};

export default Home;
