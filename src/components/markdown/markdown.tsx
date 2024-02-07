import styles from './markdown.module.css';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import supersub from 'remark-supersub';

const Markdown = ({ content }: { content: string }) => {
  return (
    <span className={styles.markdown}>
      <ReactMarkdown
        children={content}
        remarkPlugins={[[remarkGfm, { singleTilde: false }], supersub]}
        rehypePlugins={[[rehypeSanitize]]}
        components={{
          img: ({ src }) => <span>{src}</span>,
          video: ({ src }) => <span>{src}</span>,
          iframe: ({ src }) => <span>{src}</span>,
        }}
      />
    </span>
  );
};

export default Markdown;
