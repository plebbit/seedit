import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  deleteSubplebbit,
  PublishSubplebbitEditOptions,
  Role,
  useAccount,
  useCreateSubplebbit,
  useSubplebbit,
  usePublishSubplebbitEdit,
} from '@plebbit/plebbit-react-hooks';
import { Roles } from '../../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import styles from './subplebbit-settings.module.css';
import { isValidURL } from '../../../lib/utils/url-utils';
import { OptionInput, Exclude, getDefaultChallengeDescription, getDefaultChallengeOptions, getDefaultChallengeSettings } from '../../../lib/utils/challenge-utils';
import LoadingEllipsis from '../../../components/loading-ellipsis';
import Sidebar from '../../../components/sidebar';
import { isCreateSubplebbitView, isSubplebbitSettingsView } from '../../../lib/utils/view-utils';

type SubplebbitSettingsState = {
  challenges: any[] | undefined;
  title: string | undefined;
  description: string | undefined;
  address: string | undefined;
  suggested: any | undefined;
  rules: string[] | undefined;
  roles: Roles | undefined;
  settings: any | undefined;
  subplebbitAddress: string | undefined;
  publishSubplebbitEditOptions: PublishSubplebbitEditOptions;
  setSubplebbitSettingsStore: (data: Partial<SubplebbitSettingsState>) => void;
  resetSubplebbitSettingsStore: () => void;
};

const useSubplebbitSettingsStore = create<SubplebbitSettingsState>((set) => ({
  challenges: undefined,
  title: undefined,
  description: undefined,
  address: undefined,
  suggested: undefined,
  rules: undefined,
  roles: undefined,
  settings: undefined,
  subplebbitAddress: undefined,
  publishSubplebbitEditOptions: {},
  setSubplebbitSettingsStore: ({ challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress }) =>
    set((state) => {
      const nextState = { ...state };
      if (challenges !== undefined) nextState.challenges = challenges;
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
    set(() => {
      return {
        challenges: undefined,
        title: undefined,
        description: undefined,
        address: undefined,
        suggested: undefined,
        rules: undefined,
        roles: undefined,
        settings: undefined,
        subplebbitAddress: undefined,
        publishSubplebbitEditOptions: {},
      };
    }),
}));

const Title = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { title, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  return (
    <div className={`${styles.box} ${isReadOnly && !title ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('title')}</div>
      <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
      <div className={styles.boxInput}>
        {isReadOnly ? <span>{title}</span> : <input type='text' value={title ?? ''} onChange={(e) => setSubplebbitSettingsStore({ title: e.target.value })} />}
      </div>
    </div>
  );
};

const Description = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { description, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  return (
    <div className={`${styles.box} ${isReadOnly && !description ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('description')}</div>
      <div className={styles.boxSubtitle}>{t('shown_in_sidebar')}</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <pre className={styles.readOnlyDescription}>{description}</pre>
        ) : (
          <textarea value={description ?? ''} onChange={(e) => setSubplebbitSettingsStore({ description: e.target.value })} />
        )}
      </div>
    </div>
  );
};

const Address = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { address, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('address')}</div>
      <div className={styles.boxSubtitle}>{t('address_setting_info')}</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <span className={styles.readOnlyAddress}>{address}</span>
        ) : (
          <input type='text' value={address ?? ''} onChange={(e) => setSubplebbitSettingsStore({ address: e.target.value })} />
        )}
      </div>
    </div>
  );
};

const Logo = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { suggested, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();

  const [logoUrl, setLogoUrl] = useState(suggested?.avatarUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLogoUrl(suggested?.avatarUrl);
    setImageError(false);
  }, [suggested?.avatarUrl]);

  return (
    <div className={`${styles.box} ${isReadOnly && !logoUrl ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('logo')}</div>
      <div className={styles.boxSubtitle}>{t('community_logo_info')}</div>
      <div className={styles.boxInput}>
        {isReadOnly ? (
          <span>{logoUrl}</span>
        ) : (
          <input
            type='text'
            value={logoUrl ?? ''}
            onChange={(e) => {
              setLogoUrl(e.target.value);
              setImageError(false);
              setSubplebbitSettingsStore({ suggested: { ...suggested, avatarUrl: e.target.value } });
            }}
          />
        )}
        {logoUrl && isValidURL(logoUrl) && (
          <div className={styles.logoPreview}>
            {t('preview')}:
            {imageError ? <span className={styles.logoError}>{t('no_image_found')}</span> : <img src={logoUrl} alt='logo preview' onError={() => setImageError(true)} />}
          </div>
        )}
      </div>
    </div>
  );
};

const Rules = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { rules, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const lastRuleRef = useRef(null);

  const handleRuleChange = (index: number, newRule: string) => {
    const updatedRules = [...(rules ?? [])];
    updatedRules[index] = newRule;
    setSubplebbitSettingsStore({ rules: updatedRules });
  };

  const addedRuleRef = useRef(false);
  const addRule = () => {
    const newRules = rules ? [...rules, ''] : [''];
    setSubplebbitSettingsStore({ rules: newRules });
    addedRuleRef.current = true;
  };

  useEffect(() => {
    if (!isReadOnly && rules && rules.length > 0 && addedRuleRef.current) {
      (lastRuleRef.current as any).focus({ preventScroll: true });
      addedRuleRef.current = false;
    }
  }, [rules?.length, isReadOnly, rules]);

  const deleteRule = (index: number) => {
    if (rules) {
      const filteredRules = rules.filter((_, i) => i !== index);
      setSubplebbitSettingsStore({ rules: filteredRules });
    }
  };

  return (
    <div className={`${styles.box} ${isReadOnly && (!rules || rules.length < 1) ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('rules')}</div>
      <div className={styles.boxSubtitle}>{t('shown_in_sidebar')}</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={addRule} disabled={isReadOnly}>
            {t('add_rule')}
          </button>
        )}
        {rules?.map((rule, index) => (
          <div className={`${styles.rule} ${index === 0 && styles.firstRule}`} key={index}>
            Rule #{index + 1}
            {!isReadOnly && <span className={styles.deleteButton} title='Delete Rule' onClick={() => (isReadOnly ? {} : deleteRule(index))} />}
            <br />
            {isReadOnly ? (
              <span className={styles.readOnlyRule}>{rule}</span>
            ) : (
              <input ref={index === rules?.length - 1 ? lastRuleRef : null} value={rule} onChange={(e) => handleRuleChange(index, e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Moderators = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { roles, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const lastModeratorRef = useRef(null);

  const addedModeratorRef = useRef(false);
  const handleAddModerator = () => {
    if (roles) {
      const newRoles: Roles = { ...roles, '': { role: 'moderator' } };
      setSubplebbitSettingsStore({ roles: newRoles });
      addedModeratorRef.current = true;
    } else {
      setSubplebbitSettingsStore({ roles: { '': { role: 'moderator' } } });
      addedModeratorRef.current = true;
    }
  };

  useEffect(() => {
    if (!isReadOnly && roles && Object.keys(roles).length > 0 && addedModeratorRef.current) {
      (lastModeratorRef.current as any).focus({ preventScroll: true });
      addedModeratorRef.current = false;
    }
  }, [roles, isReadOnly]);

  const handleRoleChange = (address: string, newRole: 'owner' | 'admin' | 'moderator') => {
    if (roles) {
      const updatedRole: Role = { role: newRole };
      const updatedRoles: Roles = { ...roles, [address]: updatedRole };
      setSubplebbitSettingsStore({ roles: updatedRoles });
    }
  };

  const handleDeleteModerator = (address: string) => {
    if (roles) {
      const { [address]: _, ...remainingRoles } = roles;
      setSubplebbitSettingsStore({ roles: remainingRoles });
    }
  };

  const handleAddressChange = (index: number, newAddress: string) => {
    const rolesArray = Object.entries(roles || {});
    rolesArray[index] = [newAddress, rolesArray[index][1]];
    const updatedRoles = Object.fromEntries(rolesArray);
    setSubplebbitSettingsStore({ roles: updatedRoles });
  };

  return (
    <div className={`${styles.box} ${isReadOnly && !roles ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('moderators')}</div>
      <div className={styles.boxSubtitle}>{t('moderators_setting_info')}</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={handleAddModerator} disabled={isReadOnly}>
            {t('add_moderator')}
          </button>
        )}
        {roles &&
          Object.entries(roles).map(([address, role], index) => (
            <div className={`${styles.moderator} ${index === 0 && styles.firstModerator}`} key={index}>
              {t('moderator')} #{index + 1}
              {!isReadOnly && <span className={styles.deleteButton} title='delete moderator' onClick={() => (isReadOnly ? {} : handleDeleteModerator(address))} />}
              <br />
              <span className={styles.moderatorAddress}>
                User address:
                <br />
                {isReadOnly ? (
                  <span>{address}</span>
                ) : (
                  <input
                    ref={index === Object.keys(roles).length - 1 ? lastModeratorRef : null}
                    type='text'
                    value={address}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                  />
                )}
                <br />
              </span>
              <span className={styles.moderatorRole}>
                Moderator role:
                <br />
                {isReadOnly ? (
                  <span>{role.role}</span>
                ) : (
                  <select value={role.role} onChange={(e) => handleRoleChange(address, e.target.value as any)}>
                    <option value='moderator'>moderator</option>
                    <option value='admin'>admin</option>
                    <option value='owner'>owner</option>
                  </select>
                )}
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
  isReadOnly: boolean;
  setSubplebbitSettingsStore: (data: Partial<SubplebbitSettingsState>) => void;
  settings: any;
  showSettings: boolean;
}

const rolesToExclude = ['moderator', 'admin', 'owner'];
const actionsToExclude: Array<'post' | 'reply' | 'vote'> = ['post', 'reply', 'vote'];
const nonActionsToExclude: Array<'not post' | 'not reply' | 'not vote'> = ['not post', 'not reply', 'not vote'];

const ChallengeSettings = ({ challenge, index, isReadOnly, setSubplebbitSettingsStore, settings, showSettings }: ChallengeSettingsProps) => {
  const { name, options } = challenge || {};
  const challengeSettings: OptionInput[] = getDefaultChallengeSettings(name);

  const handleOptionChange = (optionName: string, newValue: string) => {
    const updatedOptions = { ...options, [optionName]: newValue };
    const updatedChallenges = settings.challenges.map((ch: any, idx: number) => (idx === index ? { ...ch, options: updatedOptions } : ch));
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const addExcludeGroup = () => {
    const newExclude = { role: [], post: false, reply: false, vote: false };
    const updatedChallenges = settings?.challenges?.map((ch: any, idx: number) => (idx === index ? { ...ch, exclude: [...(ch.exclude || []), newExclude] } : ch));
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowExcludeSettings((prev) => [...prev, false]);
  };

  useEffect(() => {
    setShowExcludeSettings(challenge.exclude?.map(() => false) || []);
  }, [challenge.exclude]);

  const deleteExcludeGroup = (excludeIndex: number) => {
    const updatedChallenges = [...settings.challenges];
    const currentChallenge = updatedChallenges[index];
    currentChallenge.exclude.splice(excludeIndex, 1);
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const [showExcludeSettings, setShowExcludeSettings] = useState<boolean[]>(challenge?.exclude?.map(() => (isReadOnly ? true : false)));
  const toggleExcludeSettings = (excludeIndex: number) => {
    const newShowExcludeSettings = [...showExcludeSettings];
    newShowExcludeSettings[excludeIndex] = !newShowExcludeSettings[excludeIndex];
    setShowExcludeSettings(newShowExcludeSettings);
  };

  const handleExcludeChange = (excludeIndex: number, type: keyof Exclude | 'not post' | 'not reply' | 'not vote', value: any) => {
    const updatedChallenges = settings.challenges.map((ch: any, idx: number) => {
      if (idx === index) {
        const updatedExclude = ch.exclude.map((ex: any, exIdx: number) => {
          if (exIdx === excludeIndex) {
            let newEx = { ...ex };

            // Convert empty string to undefined
            const processedValue = value === '' ? undefined : value;

            switch (type) {
              case 'not post':
                newEx.post = value ? undefined : false;
                break;
              case 'not reply':
                newEx.reply = value ? undefined : false;
                break;
              case 'not vote':
                newEx.vote = value ? undefined : false;
                break;
              case 'role':
                if (typeof value === 'string') {
                  const roleIndex = newEx.role.indexOf(value);
                  if (roleIndex > -1) {
                    newEx.role.splice(roleIndex, 1);
                  } else {
                    newEx.role.push(value);
                  }
                }
                break;
              default:
                newEx[type] = processedValue;
            }
            return newEx;
          }
          return ex;
        });
        return { ...ch, exclude: updatedExclude };
      }
      return ch;
    });

    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  const handleExcludeAddress = (excludeIndex: number, value: string) => {
    const addresses = value
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => addr !== '');
    handleExcludeChange(excludeIndex, 'address', addresses);
  };

  return (
    <div className={showSettings || isReadOnly ? styles.visible : styles.hidden}>
      {isReadOnly ? (
        <>
          <div className={styles.readOnlyChallengeType}>type: {challenge?.type}</div>
          <div className={styles.readOnlyChallengeDescription}>{challenge?.description}</div>
        </>
      ) : (
        <div className={styles.challengeDescription}>{getDefaultChallengeDescription(name)}</div>
      )}
      {challengeSettings.map((setting) => (
        <div key={setting?.option} className={styles.challengeOption}>
          <div className={styles.challengeOptionLabel}>{setting?.label}</div>
          <div className={styles.challengeOptionDescription}>
            {setting?.description} {setting?.default && `(default: "${setting?.default}")`}
          </div>
          {isReadOnly ? (
            <span>{options && (options[setting?.option] || '')}</span>
          ) : (
            <input
              type='text'
              value={options && (options[setting?.option] || '')}
              placeholder={setting?.placeholder || ''}
              onChange={(e) => handleOptionChange(setting?.option, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className={styles.challengeDescription}>Exclude groups for challenge #{index + 1}</div>
      <div className={styles.excludeGroupSection}>
        {!isReadOnly && (
          <button className={`${styles.addButton} ${styles.addExclude}`} onClick={addExcludeGroup} disabled={isReadOnly}>
            Add Group
          </button>
        )}
        {challenge?.exclude?.map((exclude: any, excludeIndex: number) => (
          <div key={excludeIndex} className={styles.excludeGroup}>
            Exclude group #{excludeIndex + 1}
            {!isReadOnly && <span className={styles.deleteButton} onClick={() => deleteExcludeGroup(excludeIndex)} title='delete group' />}
            {!isReadOnly && (
              <button className={styles.hideCombo} onClick={() => toggleExcludeSettings(excludeIndex)} disabled={isReadOnly}>
                {showExcludeSettings[excludeIndex] ? 'Hide' : 'Show'} Group Settings
              </button>
            )}
            {showExcludeSettings[excludeIndex] && (
              <>
                {isReadOnly && !exclude?.address ? null : (
                  <div className={styles.challengeOption}>
                    User's address
                    <div className={styles.challengeOptionDescription}>Is one of the following:</div>
                    {isReadOnly ? (
                      <span>{exclude?.address?.join(', ')}</span>
                    ) : (
                      <input
                        type='text'
                        placeholder='address1.eth, address2.eth, address3.eth'
                        value={exclude?.address?.join(', ')}
                        onChange={(e) => handleExcludeAddress(excludeIndex, e.target.value)}
                      />
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.postScore && !exclude?.postReply ? null : (
                  <div className={styles.challengeOption}>
                    User's karma
                    {isReadOnly && !exclude?.postScore ? null : (
                      <>
                        <div className={styles.challengeOptionDescription}>Post karma is at least:</div>
                        {isReadOnly ? (
                          <span>{exclude?.postScore}</span>
                        ) : (
                          <input type='number' value={exclude?.postScore || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'postScore', e.target.value)} />
                        )}
                      </>
                    )}
                    {isReadOnly && !exclude?.postReply ? null : (
                      <>
                        <div className={styles.challengeOptionDescription}>Comment karma is at least:</div>
                        {isReadOnly ? (
                          <span>{exclude?.postReply}</span>
                        ) : (
                          <input type='number' value={exclude?.postReply || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'postReply', e.target.value)} />
                        )}
                      </>
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.firstCommentTimestamp ? null : (
                  <div className={styles.challengeOption}>
                    User's account age
                    <div className={styles.challengeOptionDescription}>In seconds (eg. 86400 = 24h) is at least:</div>
                    {isReadOnly ? (
                      <span>{exclude?.firstCommentTimestamp}</span>
                    ) : (
                      <input
                        type='number'
                        value={exclude?.firstCommentTimestamp || undefined}
                        onChange={(e) => handleExcludeChange(excludeIndex, 'firstCommentTimestamp', e.target.value)}
                      />
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.role ? null : (
                  <div className={styles.challengeOption}>
                    User's role
                    <div className={styles.challengeOptionDescription}>Is any of the following:</div>
                    {rolesToExclude.map((role) =>
                      isReadOnly && !exclude?.role?.includes(role) ? null : (
                        <div key={role}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyRoleExclude}>{role} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.role?.includes(role)}
                                onChange={() => handleExcludeChange(excludeIndex, 'role', role)}
                                disabled={isReadOnly}
                              />
                              is {role}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {isReadOnly && actionsToExclude.some((action) => exclude.hasOwnProperty(action)) ? null : (
                  <div className={styles.challengeOption}>
                    User's action
                    <div className={styles.challengeOptionDescription}>Is all of the following:</div>
                    {actionsToExclude.map((action) =>
                      isReadOnly && !exclude?.[action] ? null : (
                        <div key={action}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyActionExclude}>{action} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.[action]}
                                onChange={(e) => handleExcludeChange(excludeIndex, action, e.target.checked)}
                                disabled={isReadOnly}
                              />
                              is {action}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                    {nonActionsToExclude.map((nonAction) =>
                      isReadOnly && exclude?.[nonAction.replace('not ', '')] ? null : (
                        <div key={nonAction}>
                          {isReadOnly ? (
                            <span className={styles.readOnlyActionExclude}>{nonAction} excluded</span>
                          ) : (
                            <label>
                              <input
                                type='checkbox'
                                checked={exclude?.[nonAction.replace('not ', '')] === undefined}
                                onChange={(e) => handleExcludeChange(excludeIndex, nonAction, e.target.checked)}
                                disabled={isReadOnly}
                              />
                              is {nonAction}
                            </label>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {isReadOnly && !exclude?.rateLimit ? null : (
                  <div className={styles.challengeOption}>
                    Rate limit
                    <div className={styles.challengeOptionDescription}>Number of free user actions per hour:</div>
                    {isReadOnly ? (
                      <div>{exclude?.rateLimit}</div>
                    ) : (
                      <input type='number' value={exclude?.rateLimit || undefined} onChange={(e) => handleExcludeChange(excludeIndex, 'rateLimit', e.target.value)} />
                    )}
                    {isReadOnly && !exclude?.rateLimitChallengeSuccess ? null : (
                      <div>
                        <label>
                          <input
                            type='checkbox'
                            checked={exclude?.rateLimitChallengeSuccess === true}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', e.target.checked);
                              } else {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', undefined);
                              }
                            }}
                            disabled={isReadOnly}
                          />
                          apply rate limit only on challenge success
                        </label>
                        <label className={styles.rateLimitChallengeFail}>
                          <input
                            type='checkbox'
                            checked={exclude?.rateLimitChallengeSuccess === false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', false);
                              } else {
                                handleExcludeChange(excludeIndex, 'rateLimitChallengeSuccess', undefined);
                              }
                            }}
                            disabled={isReadOnly}
                          />
                          apply rate limit only on challenge fail
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Challenges = ({ isReadOnly, readOnlyChallenges }: { isReadOnly: boolean; readOnlyChallenges: any }) => {
  const { t } = useTranslation();
  const { settings, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const challenges = settings?.challenges || readOnlyChallenges || [];
  const [showSettings, setShowSettings] = useState<boolean[]>(challenges.map(() => false));

  const location = useLocation();
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);

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
    };
    const updatedChallenges = [...(settings?.challenges || []), newChallenge];
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => [...oldShowSettings, true]);
  };

  const handleDeleteChallenge = (index: number) => {
    const updatedChallenges = settings?.challenges.filter((_: any, idx: number) => idx !== index);
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
    setShowSettings((oldShowSettings) => oldShowSettings.filter((_, idx) => idx !== index));
  };

  const handleChallengeTypeChange = (index: number, newType: string) => {
    const updatedChallenges = [...challenges];
    updatedChallenges[index] = { ...updatedChallenges[index], name: newType, options: getDefaultChallengeOptions(newType) };
    setSubplebbitSettingsStore({ settings: { ...settings, challenges: updatedChallenges } });
  };

  return (
    <div className={`${styles.box} ${isReadOnly && !challenges ? styles.hidden : styles.visible}`}>
      <div className={styles.boxTitle}>{t('challenges')}</div>
      <div className={styles.boxSubtitle}>choose one or more challenges to prevent spam</div>
      <div className={styles.boxInput}>
        {!isReadOnly && (
          <button className={styles.addButton} onClick={handleAddChallenge} disabled={isReadOnly}>
            add a challenge
          </button>
        )}
        {challenges.length === 0 && !isInCreateSubplebbitView && <span className={styles.noChallengeWarning}>{t('warning_spam')}</span>}
        {challenges.map((challenge: any, index: number) => (
          <div key={index} className={styles.challenge}>
            Challenge #{index + 1}
            {!isReadOnly && <span className={styles.deleteButton} title='delete challenge' onClick={() => (isReadOnly ? {} : handleDeleteChallenge(index))} />}
            <br />
            {isReadOnly ? (
              <span className={styles.readOnlyChallenge}>{challenge?.name}</span>
            ) : (
              <select value={challenge?.name} onChange={(e) => handleChallengeTypeChange(index, e.target.value)} disabled={isReadOnly}>
                {challengesNames.map((challenge) => (
                  <option key={challenge} value={challenge}>
                    {challenge}
                  </option>
                ))}
              </select>
            )}
            {!isReadOnly && (
              <button className={styles.challengeEditButton} onClick={() => toggleSettings(index)} disabled={isReadOnly}>
                {showSettings[index] ? 'hide settings' : 'show settings'}
              </button>
            )}
            <ChallengeSettings
              challenge={challenge}
              index={index}
              isReadOnly={isReadOnly}
              setSubplebbitSettingsStore={setSubplebbitSettingsStore}
              settings={settings}
              showSettings={showSettings[index]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const JSONSettings = ({ isReadOnly = false }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const JSONSettings = JSON.stringify({ title, description, address, suggested, rules, roles, settings, challenges, subplebbitAddress }, null, 2);
    setText(JSONSettings);
  }, [challenges, title, description, address, suggested, rules, roles, settings, subplebbitAddress]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const newSettings = JSON.parse(newText);
      setSubplebbitSettingsStore(newSettings);
    } catch (e) {
      console.error('Invalid JSON format');
    }
  };

  return (
    <div className={`${styles.box}`}>
      <div className={`${styles.boxTitle} ${styles.JSONSettingsTitle}`}>{t('json_settings')}</div>
      <div className={styles.boxSubtitle}>{t('json_settings_info')}</div>
      <div className={`${styles.boxInput} ${styles.JSONSettings}`}>
        <textarea onChange={(e) => handleChange(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' value={text} disabled={isReadOnly} />
      </div>
    </div>
  );
};

const isElectron = window.isElectron === true;

const SubplebbitSettings = () => {
  const { t } = useTranslation();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { address, challenges, createdAt, description, rules, shortAddress, settings, suggested, roles, title, updatedAt } = subplebbit || {};

  const account = useAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isConnectedToRpc = !!account?.plebbitOptions.plebbitRpcClientsOptions;
  const isOnFullNode = isElectron || isConnectedToRpc;

  const isReadOnly = (!settings && isInSubplebbitSettingsView) || (!isOnFullNode && isInCreateSubplebbitView);

  const { publishSubplebbitEditOptions, resetSubplebbitSettingsStore, setSubplebbitSettingsStore } = useSubplebbitSettingsStore();
  const { publishSubplebbitEdit } = usePublishSubplebbitEdit(publishSubplebbitEditOptions);
  const { createdSubplebbit, createSubplebbit } = useCreateSubplebbit(publishSubplebbitEditOptions);

  const [showSaving, setShowSaving] = useState(false);
  const saveSubplebbit = async () => {
    try {
      setShowSaving(true);
      await publishSubplebbitEdit();
      setShowSaving(false);
      alert(`saved`);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        alert(`failed editing subplebbit: ${e.message}`);
      } else {
        console.error('An unknown error occurred:', e);
      }
    }
  };

  const _createSubplebbit = () => {
    createSubplebbit();
    resetSubplebbitSettingsStore();
  };

  const [showDeleting, setShowDeleting] = useState(false);
  const _deleteSubplebbit = async () => {
    if (subplebbitAddress && window.confirm(`Are you sure you want to delete p/${shortAddress}? This action is irreversible.`)) {
      try {
        setShowDeleting(true);
        await deleteSubplebbit(subplebbitAddress);
        setShowDeleting(false);
        alert(`Deleted p/${shortAddress}`);
        navigate('/communities', { replace: true });
      } catch (e) {
        if (e instanceof Error) {
          console.warn(e);
          alert(`failed deleting subplebbit: ${e.message}`);
        } else {
          console.error('An unknown error occurred:', e);
        }
      }
    }
  };

  useEffect(() => {
    if (createdSubplebbit) {
      console.log('createdSubplebbit', createdSubplebbit);
      alert(`community created, address: ${createdSubplebbit?.address}`);
      navigate(`/p/${createdSubplebbit?.address}/`);
    }
  }, [createdSubplebbit, navigate]);

  // set the store with the initial data
  useEffect(() => {
    if (subplebbitAddress) {
      setSubplebbitSettingsStore({
        title: title ?? '',
        description: description ?? '',
        address,
        suggested: suggested ?? {},
        rules: rules ?? [],
        roles: roles ?? {},
        settings: settings ?? {},
        challenges: challenges ?? [],
        subplebbitAddress,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subplebbitAddress]);

  useEffect(() => {
    if (isInCreateSubplebbitView) {
      resetSubplebbitSettingsStore();
    }
  }, [isInCreateSubplebbitView, resetSubplebbitSettingsStore]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar address={subplebbitAddress} createdAt={createdAt} description={description} roles={roles} rules={rules} title={title} updatedAt={updatedAt} />
      </div>
      {/* subplebbit.settings is private, only shows to the sub owner */}
      {isReadOnly && <div className={styles.infobar}>{t('owner_settings_notice')}</div>}
      <Title isReadOnly={isReadOnly} />
      <Description isReadOnly={isReadOnly} />
      {!isInCreateSubplebbitView && <Address isReadOnly={isReadOnly} />}
      <Logo isReadOnly={isReadOnly} />
      <Rules isReadOnly={isReadOnly} />
      <Moderators isReadOnly={isReadOnly} />
      <Challenges isReadOnly={isReadOnly} readOnlyChallenges={subplebbit?.challenges} />
      {!isInCreateSubplebbitView && <JSONSettings isReadOnly={isReadOnly} />}
      <div className={styles.saveOptions}>
        {!isInCreateSubplebbitView && !isReadOnly && (
          <div className={`${styles.box} ${styles.deleteCommunity}`}>
            <div className={styles.boxTitle}>{t('delete_community')}</div>
            <div className={styles.boxSubtitle}>{t('delete_community_description')}</div>
            <div className={styles.boxInput}>
              <div className={styles.deleteSubplebbit}>
                <button onClick={_deleteSubplebbit} disabled={showDeleting || showSaving}>
                  {t('delete')}
                </button>
                <span className={styles.deletingString}>{showDeleting && <LoadingEllipsis string={t('deleting')} />}</span>
              </div>
            </div>
          </div>
        )}
        {!isReadOnly && (
          <button onClick={isInCreateSubplebbitView ? _createSubplebbit : saveSubplebbit} disabled={showSaving || showDeleting}>
            {isInCreateSubplebbitView ? t('create_community') : t('save_options')}
          </button>
        )}
        {showSaving && <LoadingEllipsis string={t('saving')} />}
      </div>
    </div>
  );
};

export default SubplebbitSettings;
