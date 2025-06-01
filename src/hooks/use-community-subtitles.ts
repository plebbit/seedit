import { useTranslation } from 'react-i18next';

const communitySubtitles = [
  'unstoppable_by_design',
  'servers_are_overrated',
  'cryptographic_playground',
  'where_you_own_the_keys',
  'no_middleman_here',
  'join_the_decentralution',
  'because_privacy_matters',
  'freedom_served_fresh_daily',
  'your_community_your_rules',
  'no_gods_no_global_admins',
  'centralization_is_boring',
  'like_torrents_for_thoughts',
  'cant_stop_the_signal',
  'fully_yours_forever',
  'powered_by_caffeine',
  'speech_wants_to_be_free',
  'crypto_certified_community',
  'take_ownership_literally',
  'your_ideas_decentralized',
  'for_digital_sovereignty',
  'for_your_movement',
  'because_you_love_freedom',
  'decentralized_but_for_real',
  'for_your_peace_of_mind',
  'no_corporation_to_answer_to',
  'your_tokenized_sovereignty',
  'for_text_only_wonders',
  'because_open_source_rulez',
  'truly_peer_to_peer',
  'no_hidden_fees',
  'no_global_rules',
  'for_reddits_downfall',
  'evil_corp_cant_stop_us',
];

const useCommunitySubtitles = () => {
  const { t } = useTranslation();

  return communitySubtitles.map((subtitle) => t(subtitle));
};

export default useCommunitySubtitles;
