import { FC } from 'react';
import videoStyles from './video-embed.module.css'
import audioStyles from './audio-embed.module.css'
import instagramStyles from './instagram-embed.module.css'
import tiktokStyles from './tiktok-embed.module.css'
import redditStyles from './reddit-embed.module.css'
import xStyles from './x-embed.module.css'

interface EmbedProps {
  url: string;
}

const Embed: FC<EmbedProps> = ({ url }) => {
  const parsedUrl = new URL(url);

  if (youtubeHosts.has(parsedUrl.host)) {
    return <YoutubeEmbed parsedUrl={parsedUrl} />;
  }
  if (xHosts.has(parsedUrl.host)) {
    return <XEmbed parsedUrl={parsedUrl} />;
  }
  if (redditHosts.has(parsedUrl.host)) {
    return <RedditEmbed parsedUrl={parsedUrl} />;
  }
  if (twitchHosts.has(parsedUrl.host)) {
    return <TwitchEmbed parsedUrl={parsedUrl} />;
  }
  if (tiktokHosts.has(parsedUrl.host)) {
    return <TiktokEmbed parsedUrl={parsedUrl} />;
  }
  if (instagramHosts.has(parsedUrl.host)) {
    return <InstagramEmbed parsedUrl={parsedUrl} />;
  }
  if (odyseeHosts.has(parsedUrl.host)) {
    return <OdyseeEmbed parsedUrl={parsedUrl} />;
  }
  if (bitchuteHosts.has(parsedUrl.host)) {
    return <BitchuteEmbed parsedUrl={parsedUrl} />;
  }
  if (streamableHosts.has(parsedUrl.host)) {
    return <StreamableEmbed parsedUrl={parsedUrl} />;
  }
  if (spotifyHosts.has(parsedUrl.host)) {
    return <SpotifyEmbed parsedUrl={parsedUrl} />;
  }
};

interface EmbedComponentProps {
  parsedUrl: URL;
}

const youtubeHosts = new Set<string>(['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be']);

const YoutubeEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  let youtubeId;
  if (parsedUrl.host.endsWith('youtu.be')) {
    youtubeId = parsedUrl.pathname.replaceAll('/', '');
  } else {
    youtubeId = parsedUrl.searchParams.get('v');
  }
  return (
    <iframe
      className={videoStyles.videoEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
      title={parsedUrl.href}
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
    />
  );
};

const xHosts = new Set<string>(['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com']);

const XEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  return (
    <iframe
      className={xStyles.xEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      title={parsedUrl.href}
      srcDoc={`
      <blockquote class="twitter-tweet" data-theme="dark">
        <a href="${parsedUrl.href.replace('x.com', 'twitter.com')}"></a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    `}
    />
  );
};

const redditHosts = new Set<string>(['reddit.com', 'www.reddit.com', 'old.reddit.com']);

const RedditEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  return (
    <iframe
      className={redditStyles.redditEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      title={parsedUrl.href}
      srcDoc={`
      <style>
        /* fix reddit iframe being centered */
        iframe {
          margin: 0!important;
        }
      </style>
      <blockquote class="reddit-embed-bq" style="height:240px" data-embed-theme="dark">
        <a href="${parsedUrl.href}"></a>    
      </blockquote>
      <script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>
    `}
    />
  );
};

const twitchHosts = new Set<string>(['twitch.tv', 'www.twitch.tv']);

const TwitchEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  let iframeUrl;
  if (parsedUrl.pathname.startsWith('/videos/')) {
    const videoId = parsedUrl.pathname.replace('/videos/', '');
    iframeUrl = `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
  } else {
    const channel = parsedUrl.pathname.replaceAll('/', '');
    iframeUrl = `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
  }
  return (
    <iframe
      className={videoStyles.videoEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
      title={parsedUrl.href}
      src={iframeUrl}
    />
  );
};

const tiktokHosts = new Set<string>(['tiktok.com', 'www.tiktok.com']);

const TiktokEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  const videoId = parsedUrl.pathname.replace(/.+\/video\//, '').replaceAll('/', '');
  return (
    <iframe
      className={tiktokStyles.tiktokEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      title={parsedUrl.href}
      srcDoc={`
      <blockquote class="tiktok-embed" data-video-id="${videoId}">
        <a></a>
      </blockquote> 
      <script async src="https://www.tiktok.com/embed.js"></script>
    `}
    />
  );
};

const instagramHosts = new Set<string>(['instagram.com', 'www.instagram.com']);

const InstagramEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  const pathNames = parsedUrl.pathname.replace(/\/+$/, '').split('/');
  const id = pathNames[pathNames.length - 1];
  return (
    <iframe
      className={instagramStyles.instagramEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      title={parsedUrl.href}
      srcDoc={`
      <blockquote class="instagram-media">
        <a href="https://www.instagram.com/p/${id}/"></a>
      </blockquote>
      <script async src="//www.instagram.com/embed.js"></script>
    `}
    />
  );
};

const odyseeHosts = new Set<string>(['odysee.com', 'www.odysee.com']);

const OdyseeEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  const iframeUrl = `https://odysee.com/$/embed${parsedUrl.pathname}`;
  return (
    <iframe
      className={videoStyles.videoEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
      title={parsedUrl.href}
      src={iframeUrl}
    />
  );
};

const bitchuteHosts = new Set<string>(['bitchute.com', 'www.bitchute.com']);

const BitchuteEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  const videoId = parsedUrl.pathname.replace(/\/video\//, '').replaceAll('/', '');
  return (
    <iframe
      className={videoStyles.videoEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
      title={parsedUrl.href}
      src={`https://www.bitchute.com/embed/${videoId}/`}
    />
  );
};

const streamableHosts = new Set<string>(['streamable.com', 'www.streamable.com']);

const StreamableEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  const videoId = parsedUrl.pathname.replaceAll('/', '');
  return (
    <iframe
      className={videoStyles.videoEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
      title={parsedUrl.href}
      src={`https://streamable.com/e/${videoId}`}
    />
  );
};

const spotifyHosts = new Set<string>(['spotify.com', 'www.spotify.com', 'open.spotify.com']);

const SpotifyEmbed: FC<EmbedComponentProps> = ({ parsedUrl }) => {
  const iframeUrl = `https://open.spotify.com/embed${parsedUrl.pathname}?theme=0`;
  return (
    <iframe
      className={audioStyles.audioEmbed}
      height='100%'
      width='100%'
      referrerPolicy='no-referrer'
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
      title={parsedUrl.href}
      src={iframeUrl}
    />
  );
};

const canEmbedHosts = new Set<string>([
  ...youtubeHosts,
  ...xHosts,
  ...redditHosts,
  ...twitchHosts,
  ...tiktokHosts,
  ...instagramHosts,
  ...odyseeHosts,
  ...bitchuteHosts,
  ...streamableHosts,
  ...spotifyHosts,
]);

export const canEmbed = (parsedUrl: URL): boolean => canEmbedHosts.has(parsedUrl.host);

export default Embed;
