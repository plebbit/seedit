import styles from './markdown.module.css';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import supersub from 'remark-supersub';

interface MarkdownProps {
  content: string;
}

const MAX_LENGTH_FOR_GFM = 10000; // remarkGfm lags with large content

const Markdown = ({ content }: MarkdownProps) => {
  const remarkPlugins: any[] = [[supersub]];

  if (content.length <= MAX_LENGTH_FOR_GFM) {
    remarkPlugins.push([remarkGfm, { singleTilde: false }]);
  }

  return (
    <span className={styles.markdown}>
      <ReactMarkdown
        children={content}
        remarkPlugins={remarkPlugins}
        rehypePlugins={[[rehypeSanitize]]}
        components={{
          img: ({ src }) => <span>{src}</span>,
          video: ({ src }) => <span>{src}</span>,
          iframe: ({ src }) => <span>{src}</span>,
          source: ({ src }) => <span>{src}</span>,
        }}
      />
    </span>
  );
};

export default Markdown;
