import React from 'react';
import MarkdownPreview from './MarkdownPreview';
import JsonVisualizer from './JsonVisualizer';

const MainContent = ({ currentTool }) => {
  const renderContent = () => {
    switch (currentTool) {
      case 'markdown':
        return <MarkdownPreview />;
      case 'json':
        return <JsonVisualizer />;
      default:
        return <MarkdownPreview />;
    }
  };

  return (
    <main className="main-content">
      {renderContent()}
    </main>
  );
};

export default MainContent; 