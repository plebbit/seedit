import { useMemo } from 'react';
import { usePublishComment } from '@plebbit/plebbit-react-hooks';
import usePublishReplyStore from '../stores/use-publish-reply-store';

const usePublishReply = ({ cid, subplebbitAddress, postCid }: { cid: string; subplebbitAddress: string; postCid: string | undefined }) => {
  const parentCid = cid;
  const { content, link, spoiler, publishCommentOptions } = usePublishReplyStore((state) => ({
    content: state.content[parentCid],
    link: state.link[parentCid],
    spoiler: state.spoiler[parentCid],
    publishCommentOptions: state.publishCommentOptions[parentCid],
  }));

  const setReplyStore = usePublishReplyStore((state) => state.setReplyStore);
  const resetReplyStore = usePublishReplyStore((state) => state.resetReplyStore);

  const setPublishReplyOptions = useMemo(
    () => ({
      content: (newContent: string) =>
        setReplyStore({
          subplebbitAddress,
          parentCid,
          postCid: postCid ?? parentCid,
          content: newContent === '' ? undefined : newContent,
          link: link || undefined,
          spoiler: spoiler || false,
        }),
      link: (newLink: string) =>
        setReplyStore({
          subplebbitAddress,
          parentCid,
          postCid: postCid ?? parentCid,
          content: content,
          link: newLink || undefined,
          spoiler: spoiler || false,
        }),
      spoiler: (newSpoiler: boolean) =>
        setReplyStore({
          subplebbitAddress,
          parentCid,
          postCid: postCid ?? parentCid,
          content: content,
          link: link || undefined,
          spoiler: newSpoiler,
        }),
    }),
    [subplebbitAddress, parentCid, setReplyStore, content, link, spoiler, postCid],
  );

  const resetPublishReplyOptions = useMemo(() => () => resetReplyStore(parentCid), [parentCid, resetReplyStore]);

  const { index, publishComment } = usePublishComment(publishCommentOptions);

  return { setPublishReplyOptions, resetPublishReplyOptions, replyIndex: index, publishReply: publishComment };
};

export default usePublishReply;
