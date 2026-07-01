import React from 'react';
import MarkdownEditor from './MarkdownEditor';
import JsonVisualizer from './JsonVisualizer';
import JwtDecoder from './JwtDecoder';

const MainContent = ({ currentTool }) => {
  const renderContent = () => {
    switch (currentTool) {
      case 'markdown':
        return <MarkdownEditor />;
      case 'json':
        return <JsonVisualizer />;
      case 'jwt':
        return <JwtDecoder />;
      default:
        return <MarkdownEditor />;
    }
  };

  return (
    <main className="main-content">
      {renderContent()}
    </main>
  );
};

export default MainContent; 