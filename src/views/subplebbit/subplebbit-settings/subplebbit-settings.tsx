import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublishSubplebbitEditOptions, useAccount, useSubplebbit, usePublishSubplebbitEdit, Role } from '@plebbit/plebbit-react-hooks';
import { Roles } from '../../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import styles from './subplebbit-settings.module.css';
import { isValidURL } from '../../../lib/utils/url-utils';
import {
  ChallengeSetting,
  getDefaultChallengeDescription,
  getDefaultExclude,
  getDefaultChallengeOptions,
  getDefaultChallengeSettings,
} from '../../../lib/utils/challenge-utils';
import LoadingEllipsis from '../../../components/loading-ellipsis';
import Sidebar from '../../../components/sidebar';

const isElectron = window.electron && window.electron.isElectron;

type SubplebbitSettingsState = {
  title: string | undefined;
  description: string | undefined;
  address: string | undefined;
  suggested: any | undefined;
  rules: string[] | undefined;
  roles: Roles | undefined;
  settings: any | undefined;
  subplebbitAddress: string | undefined;
  publishSubplebbitEditOptions: PublishSubplebbitEditOptions;
  setSubmitStore: (data: Partial<SubplebbitSettingsState>) => void;
  resetSubplebbitSettingsStore: () => void;
};

const useSubplebbitSettingsStore = create<SubplebbitSettingsState>((set) => ({
  title: undefined,
  description: undefined,
  address: undefined,
  suggested: undefined,
  rules: undefined,
  roles: undefined,
  settings: undefined,
  subplebbitAddress: undefined,
  publishSubplebbitEditOptions: {},
  setSubmitStore: ({ title, description, address, suggested, rules, roles, settings, subplebbitAddress }) =>
    set((state) => {
      const nextState = { ...state };
      if (title !== undefined) nextState.title = title;
      if (description !== undefined) nextState.description = description;
      if (address !== undefined) nextState.address = address;
      if (suggested?.avatarUrl !== undefined) {
        nextState.suggested = { ...state.suggested, avatarUrl: suggested.avatarUrl };
      }
      if (rules !== undefined) nextState.rules = rules;
      if (roles !== undefined) nextState.roles = roles;
      if (settings?.challenges !== undefined) {
        nextState.settings = { ...state.settings, challenges: settings.challenges };
      }
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;

      nextState.publishSubplebbitEditOptions = {
        ...nextState,
      };

      return nextState;
    }),

  resetSubplebbitSettingsStore: () =>
    set({
      title: undefined,
      description: undefined,
      address: undefined,
      suggested: undefined,
      rules: undefined,
      roles: undefined,
      settings: undefined,
      subplebbitAddress: undefined,
      publishSubplebbitEditOptions: undefined,
    }),
}));

const Title = () => {
  const { t } = useTranslation();
  const { title, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('title')}</div>
      <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
      <div className={styles.boxInput}>
        <input type='text' value={title ?? ''} onChange={(e) => setSubmitStore({ title: e.target.value })} />
      </div>
    </div>
  );
};

const Description = () => {
  const { t } = useTranslation();
  const { description, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('description')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        <textarea value={description ?? ''} onChange={(e) => setSubmitStore({ description: e.target.value })} />
      </div>
    </div>
  );
};

const Address = () => {
  const { t } = useTranslation();
  const { address, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('address')}</div>
      <div className={styles.boxSubtitle}>set a readable community address using ens.domains</div>
      <div className={styles.boxInput}>
        <input type='text' value={address ?? ''} onChange={(e) => setSubmitStore({ title: e.target.value })} />
      </div>
    </div>
  );
};

const Logo = () => {
  const { t } = useTranslation();
  const { suggested, setSubmitStore } = useSubplebbitSettingsStore();

  const [logoUrl, setLogoUrl] = useState(suggested?.avatarUrl);
  const [imageError, setImageError] = useState(false);

  // Update logoUrl when avatarUrl changes
  useEffect(() => {
    setLogoUrl(suggested?.avatarUrl);
    setImageError(false); // Reset the error state as well
  }, [suggested?.avatarUrl]);

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('logo')}</div>
      <div className={styles.boxSubtitle}>set a community logo using its direct image link (ending in .jpg, .png)</div>
      <div className={styles.boxInput}>
        <input
          type='text'
          value={logoUrl ?? ''}
          onChange={(e) => {
            setLogoUrl(e.target.value);
            setImageError(false);
            setSubmitStore({ suggested: { ...suggested, avatarUrl: e.target.value } });
          }}
        />
        {logoUrl && isValidURL(logoUrl) && (
          <div className={styles.logoPreview}>
            preview:
            {imageError ? <span className={styles.logoError}>no image found</span> : <img src={logoUrl} alt='logo preview' onError={() => setImageError(true)} />}
          </div>
        )}
      </div>
    </div>
  );
};

const Rules = () => {
  const { t } = useTranslation();
  const { rules, setSubmitStore } = useSubplebbitSettingsStore();
  const lastRuleRef = useRef(null);

  const handleRuleChange = (index: number, newRule: string) => {
    const updatedRules = [...(rules ?? [])];
    updatedRules[index] = newRule;
    setSubmitStore({ rules: updatedRules });
  };

  const addRule = () => {
    const newRules = rules ? [...rules, ''] : [''];
    setSubmitStore({ rules: newRules });

    setTimeout(() => {
      (lastRuleRef.current as any).focus();
    }, 0);
  };

  const deleteRule = (index: number) => {
    if (rules) {
      const filteredRules = rules.filter((_, i) => i !== index);
      setSubmitStore({ rules: filteredRules });
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('rules')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        <button className={styles.addButton} onClick={addRule}>
          Add a Rule
        </button>
        {rules?.map((rule, index) => (
          <div className={styles.rule} key={index}>
            Rule #{index + 1}
            <span className={styles.deleteButton} title='Delete Rule' onClick={() => deleteRule(index)} />
            <br />
            <input ref={index === rules?.length - 1 ? lastRuleRef : null} type='text' value={rule} onChange={(e) => handleRuleChange(index, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Moderators = () => {
  const { t } = useTranslation();
  const { roles, setSubmitStore } = useSubplebbitSettingsStore();
  const lastModeratorRef = useRef(null);

  const handleAddModerator = () => {
    if (roles) {
      const newRoles: Roles = { ...roles, '': { role: 'moderator' } };
      setSubmitStore({ roles: newRoles });

      setTimeout(() => {
        if (lastModeratorRef.current) {
          (lastModeratorRef.current as any).focus();
        }
      }, 0);
    }
  };

  const handleRoleChange = (address: string, newRole: 'owner' | 'admin' | 'moderator') => {
    if (roles) {
      const updatedRole: Role = { role: newRole };
      const updatedRoles: Roles = { ...roles, [address]: updatedRole };
      setSubmitStore({ roles: updatedRoles });
    }
  };

  const handleDeleteModerator = (address: string) => {
    if (roles) {
      const { [address]: _, ...remainingRoles } = roles;
      setSubmitStore({ roles: remainingRoles });
    }
  };

  const handleAddressChange = (oldAddress: string, newAddress: string) => {
    if (roles) {
      const { [oldAddress]: roleData, ...remainingRoles } = roles;
      if (roleData) {
        const updatedRoles: Roles = { ...remainingRoles, [newAddress]: roleData };
        setSubmitStore({ roles: updatedRoles });
      }
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('moderators')}</div>
      <div className={styles.boxSubtitle}>let other users moderate and post without challenges</div>
      <div className={styles.boxInput}>
        <button className={styles.addButton} onClick={handleAddModerator}>
          add a moderator
        </button>
        {roles &&
          Object.entries(roles).map(([address, role], index) => (
            <div className={styles.moderator} key={index}>
              Moderator #{index + 1}
              <span className={styles.deleteButton} title='delete moderator' onClick={() => handleDeleteModerator(address)} />
              <br />
              <span className={styles.moderatorAddress}>
                User address:
                <br />
                <input
                  ref={index === Object.keys(roles).length - 1 ? lastModeratorRef : null}
                  type='text'
                  value={address}
                  onChange={(e) => handleAddressChange(address, e.target.value)}
                />
                <br />
              </span>
              <span className={styles.moderatorRole}>
                Moderator role:
                <br />
                <select value={role.role} onChange={(e) => handleRoleChange(address, e.target.value as any)}>
                  <option value='moderator'>moderator</option>
                  <option value='admin'>admin</option>
                  <option value='owner'>owner</option>
                </select>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

const challengesNames = ['text-math', 'captcha-canvas-v3', 'fail', 'blacklist', 'question', 'evm-contract-call'];

interface ChallengeSettingsProps {
  challenge: any;
  index: number;
  setSubmitStore: (data: Partial<SubplebbitSettingsState>) => void;
  settings: any;
  showSettings: boolean;
}

const rolesToExclude = ['moderator', 'admin', 'owner'];
const actionsToExclude: Array<'post' | 'reply' | 'vote'> = ['post', 'reply', 'vote'];

const ChallengeSettings = ({ challenge, index, setSubmitStore, settings, showSettings }: ChallengeSettingsProps) => {
  const { exclude, name, options } = challenge || {};
  const challengeSettings: ChallengeSetting[] = getDefaultChallengeSettings(name);

  const handleOptionChange = (optionName: string, newValue: string) => {
    const updatedOptions = { ...options, [optionName]: newValue };
    const updatedChallenges = settings.challenges.map((ch: any, idx: number) => (idx === index ? { ...ch, options: updatedOptions } : ch));
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const handleExcludeChange = (type: 'role' | 'post' | 'reply' | 'vote', value: string | boolean) => {
    const updatedExclude = { ...exclude[0] }; // Clone the first exclude object

    if (type === 'role') {
      if (typeof value === 'string') {
        const roleIndex = updatedExclude.role.indexOf(value);
        if (roleIndex > -1) {
          updatedExclude.role.splice(roleIndex, 1); // Remove role
        } else {
          updatedExclude.role.push(value); // Add role
        }
      }
    } else {
      // Handle post, reply, vote
      updatedExclude[type] = value;
    }

    const updatedChallenges = [...settings.challenges];
    updatedChallenges[index] = { ...updatedChallenges[index], exclude: [updatedExclude] };
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  return (
    <div className={showSettings ? styles.visible : styles.hidden}>
      <div className={styles.challengeDescription}>{getDefaultChallengeDescription(name)}</div>
      {challengeSettings.map((setting) => (
        <div key={setting.option} className={styles.challengeOption}>
          <div className={styles.challengeOptionLabel}>{setting.label}</div>
          <div className={styles.challengeOptionDescription}>{setting.description}</div>
          <input
            type='text'
            value={options[setting.option] || setting.default || ''}
            placeholder={setting.placeholder || ''}
            onChange={(e) => handleOptionChange(setting.option, e.target.value)}
            required={setting.required || false}
          />
        </div>
      ))}
      <div className={styles.challengeDescription}>Exclude from challenge</div>
      <div className={styles.challengeOption}>
        Moderators
        <div className={styles.challengeOptionDescription}>Exclude a specific moderator role</div>
        {rolesToExclude.map((role) => (
          <div key={role}>
            <label>
              <input type='checkbox' checked={exclude[0]?.role.includes(role)} onChange={() => handleExcludeChange('role', role)} />
              exclude {role}
            </label>
          </div>
        ))}
      </div>
      <div className={styles.challengeOption}>
        Actions
        <div className={styles.challengeOptionDescription}>Exclude a specific user action</div>
        {actionsToExclude.map((action) => (
          <div key={action}>
            <label>
              <input type='checkbox' checked={exclude[0]?.[action]} onChange={(e) => handleExcludeChange(action, e.target.checked)} />
              exclude {action}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const Challenges = () => {
  const { t } = useTranslation();
  const { settings, setSubmitStore } = useSubplebbitSettingsStore();
  const challenges = settings?.challenges || [];
  const [showSettings, setShowSettings] = useState<boolean[]>(challenges.map(() => true));

  const toggleSettings = (index: number) => {
    const newShowSettings = [...showSettings];
    newShowSettings[index] = !newShowSettings[index];
    setShowSettings(newShowSettings);
  };

  const handleAddChallenge = () => {
    const defaultChallenge = 'captcha-canvas-v3';
    const options = getDefaultChallengeOptions(defaultChallenge);
    const newChallenge = {
      name: defaultChallenge,
      options,
      exclude: getDefaultExclude(),
    };
    const updatedChallenges = [...(settings?.challenges || []), newChallenge];
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => [...oldShowSettings, true]);
  };

  const handleDeleteChallenge = (index: number) => {
    const updatedChallenges = settings?.challenges.filter((_: any, idx: number) => idx !== index);
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => oldShowSettings.filter((_, idx) => idx !== index));
  };

  const handleChallengeTypeChange = (index: number, newType: string) => {
    const updatedChallenges = [...challenges];
    updatedChallenges[index] = { ...updatedChallenges[index], name: newType, options: getDefaultChallengeOptions(newType) };
    setSubmitStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('challenges')}</div>
      <div className={styles.boxSubtitle}>choose one or more challenges to prevent spam</div>
      <div className={styles.boxInput}>
        <button className={styles.addButton} onClick={handleAddChallenge}>
          add a challenge
        </button>
        {challenges.length === 0 && <span className={styles.noChallengeWarning}>Warning: vulnerable to spam attacks.</span>}
        {challenges.map((challenge: any, index: number) => (
          <div key={index} className={styles.challenge}>
            Challenge #{index + 1}
            <span className={styles.deleteButton} title='delete challenge' onClick={() => handleDeleteChallenge(index)} />
            <br />
            <select value={challenge?.name} onChange={(e) => handleChallengeTypeChange(index, e.target.value)}>
              {challengesNames.map((challenge) => (
                <option key={challenge} value={challenge}>
                  {challenge}
                </option>
              ))}
            </select>
            <button className={styles.challengeEditButton} onClick={() => toggleSettings(index)}>
              {showSettings[index] ? 'hide settings' : 'show settings'}
            </button>
            <ChallengeSettings challenge={challenge} index={index} setSubmitStore={setSubmitStore} settings={settings} showSettings={showSettings[index]} />
          </div>
        ))}
      </div>
    </div>
  );
};

const FullSettings = () => {
  const { title, description, address, suggested, rules, roles, settings, subplebbitAddress, setSubmitStore } = useSubplebbitSettingsStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const fullSettings = JSON.stringify({ title, description, address, suggested, rules, roles, settings, subplebbitAddress }, null, 2);
    setText(fullSettings);
  }, [title, description, address, suggested, rules, roles, settings, subplebbitAddress]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const newSettings = JSON.parse(newText);
      setSubmitStore(newSettings);
    } catch (e) {
      console.error('Invalid JSON format');
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>full settings data</div>
      <div className={styles.boxSubtitle}>quickly copy or paste the community settings</div>
      <div className={`${styles.boxInput} ${styles.fullSettings}`}>
        <textarea onChange={(e) => handleChange(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' value={text} />
      </div>
    </div>
  );
};

const SubplebbitSettings = () => {
  const { t } = useTranslation();

  const account = useAccount();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const userRole = subplebbit?.roles?.[account.author?.address]?.role;
  const { address, createdAt, description, rules, settings, suggested, roles, title, updatedAt } = subplebbit || {};
  const isAdmin = userRole === 'admin' || userRole === 'owner' || settings;

  const { publishSubplebbitEditOptions, setSubmitStore } = useSubplebbitSettingsStore();
  const { publishSubplebbitEdit } = usePublishSubplebbitEdit(publishSubplebbitEditOptions);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // set the store with the initial data
  useEffect(() => {
    setSubmitStore({
      title: title ?? '',
      description: description ?? '',
      address,
      suggested: suggested ?? {},
      rules: rules ?? [],
      roles: roles ?? {},
      settings: settings ?? {},
      subplebbitAddress,
    });
  }, [subplebbitAddress, setSubmitStore, title, description, address, suggested, rules, roles, settings]);

  const [showLoading, setShowLoading] = useState(false);
  const saveSubplebbit = async () => {
    try {
      setShowLoading(true);
      await publishSubplebbitEdit();
      setShowLoading(false);
      alert(`saved`);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        alert(`failed editing subplebbit: ${e.message}`);
      } else {
        console.error('An unknown error occurred:', e);
      }
      setShowLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar address={subplebbitAddress} createdAt={createdAt} description={description} roles={roles} rules={rules} title={title} updatedAt={updatedAt} />
      </div>
      {!settings && <div className={styles.infobar}>can't connect to community p2p node - only the owner of a community can edit its settings.</div>}
      <Title />
      <Description />
      <Address />
      <Logo />
      <Rules />
      <Moderators />
      {/* subplebbit.settings is private, only shows to the sub owner */}
      {settings?.challenges && <Challenges />}
      <FullSettings />
      <div className={styles.saveOptions}>
        <button disabled={!isElectron || !isAdmin || showLoading} onClick={saveSubplebbit}>
          {t('save_options')}
        </button>
        {showLoading && <LoadingEllipsis string={t('saving')} />}
      </div>
    </div>
  );
};

export default SubplebbitSettings;
