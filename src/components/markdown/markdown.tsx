import { useMemo } from 'react';
import styles from './markdown.module.css';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

const Markdown = ({ content }: { content: string }) => {
  // replace \n with \n\n when it follows a sentence starting with '>'
  let preserveNewlineAfterQuote = content?.replace(/(^|\n)(>[^>].*?)(\n)/gm, '$1\n$2\n\n');

  // replace \n\n with \n for list items separated by two newlines
  let adjustListNewlines = preserveNewlineAfterQuote.replace(/(\n\n)([*-]|[0-9]+\.) (.+?)(?=\n\n([*-]|[0-9]+\.) )/gms, '\n$2 $3');

  const customSchema = useMemo(
    () => ({
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), 'div'],
      attributes: {
        ...defaultSchema.attributes,
        div: ['className'],
      },
    }),
    [],
  );

  const excludeBlockquote = () => (tree: any) => {
    tree.children.forEach((node: any) => {
      if (node.type === 'blockquote') {
        node.type = 'div';
        node.data = {
          hName: 'div',
          hProperties: {
            className: styles.quote,
          },
        };
      }
    });
  };

  return (
    <span className={styles.markdown}>
      <ReactMarkdown
        children={adjustListNewlines}
        remarkPlugins={[excludeBlockquote, [remarkGfm, { singleTilde: false }], breaks]}
        rehypePlugins={[[rehypeSanitize, customSchema]]}
        components={{
          br: () => <span>{''}</span>,
          img: ({ src }) => <span>{src}</span>,
          video: ({ src }) => <span>{src}</span>,
          iframe: ({ src }) => <span>{src}</span>,
        }}
      />
    </span>
  );
};

export default Markdown;
