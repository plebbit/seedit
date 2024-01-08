import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { RolesCollection } from '../../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import stringify from 'json-stringify-pretty-compact';
import styles from './subplebbit-settings.module.css';

const isElectron = window.electron && window.electron.isElectron;

const Title = ({ title }: { title: string }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('title')}</div>
      <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
      <div className={styles.boxInput}>
        <input type='text' defaultValue={title} />
      </div>
    </div>
  );
};

const Description = ({ description }: { description: string }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('description')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        <textarea defaultValue={description} />
      </div>
    </div>
  );
};

const Address = ({ address }: { address: string }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('address')}</div>
      <div className={styles.boxSubtitle}>set a readable community address using ens.domains</div>
      <div className={styles.boxInput}>
        <input type='text' defaultValue={address} />
      </div>
    </div>
  );
};

const Logo = ({ logo, avatarUrl }: { logo: string; avatarUrl: string | undefined }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('logo')}</div>
      <div className={styles.boxSubtitle}>set a community logo using its direct image link (ending in .jpg, .png)</div>
      <div className={styles.boxInput}>
        <input type='text' defaultValue={avatarUrl} />
      </div>
    </div>
  );
};

const Rules = ({ rules }: { rules: string[] }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('rules')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        <button className={styles.addRule}>add a rule</button>
        {rules?.map((rule, index) => (
          <div className={styles.rule} key={index}>
            {index + 1}. <input type='text' defaultValue={rule} />
            <span className={styles.deleteRule} title='delete rule' />
          </div>
        ))}
      </div>
    </div>
  );
};

const Moderators = ({ roles }: { roles: RolesCollection | undefined }) => {
  const { t } = useTranslation();
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('moderators')}</div>
      <div className={styles.boxSubtitle}>let other users moderate and post without challenges</div>
      <div className={styles.boxInput}>
        <button className={styles.addModerator}>add a user</button>
        {rolesList?.map(({ address, role }, index) => (
          <div className={styles.moderator} key={index}>
            {index + 1}.{' '}
            <span className={styles.moderatorAddress}>
              user address: <input type='text' value={address} />
            </span>
            <span className={styles.moderatorRole}>
              role:{' '}
              <select value={role}>
                <option value='moderator'>moderator</option>
                <option value='admin'>admin</option>
                <option value='owner'>owner</option>
              </select>
            </span>
            <span className={styles.deleteModerator} title='delete moderator' />
          </div>
        ))}
      </div>
    </div>
  );
};

const Challenge = ({ challenge, selected, setSelected }: { challenge: string; selected: string; setSelected: (challenge: string) => void }) => {
  const { t } = useTranslation();
  const [selectedChallenge, setSelectedChallenge] = useState('captcha');

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('challenge')}</div>
      <div className={styles.boxSubtitle}>choose a challenge to prevent spam</div>
      <div className={`${styles.boxInput} ${styles.captchaSelect}`}>
        <select defaultValue='captcha' onChange={(e) => setSelectedChallenge(e.target.value)}>
          <option value='captcha'>captcha</option>
          <option value='karma'>karma</option>
          <option value='password'>password</option>
          <option value='custom'>custom</option>
          <option value='none'>none</option>
        </select>
        {selectedChallenge === 'none' && (
          <span className={styles.noChallengeWarning}>
            warning: only set to 'none' for private testing - without a challenge, your community is vulnerable to spam attacks.
          </span>
        )}
      </div>
    </div>
  );
};

const FullSettings = ({ subplebbitAddress }: { subplebbitAddress: string }) => {
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const [text, setText] = useState('');
  const subplebbitJson = useMemo(
    () =>
      stringify({
        ...subplebbit,
        // remove fields that cant be edited
        posts: undefined,
        clients: undefined,
        state: undefined,
        startedState: undefined,
        updatingState: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        fetchedAt: undefined,
        signature: undefined,
        errors: undefined,
        error: undefined,
        encryption: undefined,
        statsCid: undefined,
        pubsubTopic: undefined,
        lastPostCid: undefined,
        shortAddress: undefined,
        challenges: undefined,
      }),
    [subplebbit],
  );

  // set the initial subplebbit json
  useEffect(() => {
    setText(subplebbitJson);
  }, [subplebbitJson]);

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>full settings data</div>
      <div className={styles.boxSubtitle}>quickly copy or paste the community settings</div>
      <div className={`${styles.boxInput} ${styles.fullSettings}`}>
        <textarea onChange={(e) => setText(e.target.value)} autoCorrect='off' autoComplete='off' value={text} />
      </div>
    </div>
  );
};

const SubplebbitSettings = () => {
  const { t } = useTranslation();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { address, description, rules, suggested, roles, title } = subplebbit || {};

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      {!isElectron && <div className={styles.infobar}>only the admins and owner of a community can edit its settings</div>}
      <Title title={title} />
      <Description description={description} />
      <Address address={address} />
      <Logo logo={''} avatarUrl={suggested?.avatarUrl} />
      <Rules rules={rules} />
      <Moderators roles={roles} />
      <Challenge challenge={''} selected={''} setSelected={() => {}} />
      <FullSettings subplebbitAddress={address} />
      <div className={styles.saveOptions}>
        <button>{t('save_options')}</button>
      </div>
    </div>
  );
};

export default SubplebbitSettings;
