import { useMemo } from 'react';
import { usePublishComment } from '@plebbit/plebbit-react-hooks';
import useReplyStore from '../stores/use-reply-store';

const useReply = ({ cid, subplebbitAddress }: { cid: string; subplebbitAddress: string }) => {
  const parentCid = cid;
  const { content, link, spoiler, publishCommentOptions } = useReplyStore((state) => ({
    content: state.content[parentCid],
    link: state.link[parentCid],
    spoiler: state.spoiler[parentCid],
    publishCommentOptions: state.publishCommentOptions[parentCid],
  }));

  const setReplyStore = useReplyStore((state) => state.setReplyStore);
  const resetReplyStore = useReplyStore((state) => state.resetReplyStore);

  const setContent = useMemo(
    () => ({
      content: (newContent: string) =>
        setReplyStore({
          subplebbitAddress,
          parentCid,
          content: newContent === '' ? undefined : newContent,
          link: link || undefined,
          spoiler: spoiler || false,
        }),
      link: (newLink: string) =>
        setReplyStore({
          subplebbitAddress,
          parentCid,
          content: content,
          link: newLink || undefined,
          spoiler: spoiler || false,
        }),
      spoiler: (newSpoiler: boolean) =>
        setReplyStore({
          subplebbitAddress,
          parentCid,
          content: content,
          link: link || undefined,
          spoiler: newSpoiler,
        }),
    }),
    [subplebbitAddress, parentCid, setReplyStore, content, link, spoiler],
  );

  const resetContent = useMemo(() => () => resetReplyStore(parentCid), [parentCid, resetReplyStore]);

  const { index, publishComment } = usePublishComment(publishCommentOptions);

  return { setContent, resetContent, replyIndex: index, publishReply: publishComment };
};

export default useReply;
