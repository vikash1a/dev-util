import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MarkdownPreview.css';

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Preview

## Features
- **Bold text** and *italic text*
- \`Inline code\`
- Lists:
  - Item 1
  - Item 2
  - Item 3

## Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Links
[GitHub](https://github.com)

## Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

> This is a blockquote

---

*Start typing in the editor above to see your markdown rendered in real-time!*`);

  return (
    <div className="markdown-preview-container">
      <div className="markdown-header">
        <h1>Markdown Preview</h1>
        <p>Edit markdown on the left, see the preview on the right</p>
      </div>
      
      <div className="markdown-content">
        <div className="editor-section">
          <h3>Editor</h3>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter your markdown here..."
            className="markdown-editor"
          />
        </div>
        
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="markdown-preview">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview; 