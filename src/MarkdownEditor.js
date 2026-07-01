import React, { useState, useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { MantineProvider } from '@mantine/core';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@mantine/core/styles.css';
import './MarkdownEditor.css';

const MarkdownEditor = () => {
  const [fileHandle, setFileHandle] = useState(null);
  const [fileName, setFileName] = useState('Untitled.md');
  const [saveStatus, setSaveStatus] = useState('no-file'); // 'no-file' | 'saved' | 'saving' | 'unsaved' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [apiSupported, setApiSupported] = useState(true);

  const fileInputRef = useRef(null);
  const isLoadingFileRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const currentFileHandleRef = useRef(null);

  // Keep ref in sync to avoid stale closures in setTimeout
  currentFileHandleRef.current = fileHandle;

  // Initialize BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: 'heading',
        props: { level: 1 },
        content: 'Welcome to the BlockNote Markdown Editor!',
      },
      {
        type: 'paragraph',
        content: 'This editor allows you to load local markdown files, edit them using a rich block-based editor, and automatically save changes directly back to your local file system.',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Quick Features:',
      },
      {
        type: 'bulletListItem',
        content: 'Open any Markdown (.md) file from your local machine.',
      },
      {
        type: 'bulletListItem',
        content: 'Direct local file auto-save (triggers 1 second after you stop typing).',
      },
      {
        type: 'bulletListItem',
        content: 'Export/Save As to new files at any time.',
      },
      {
        type: 'paragraph',
        content: 'Try opening a file now using the "Open File" button in the header!',
      },
    ],
  });

  // Check if File System Access API is supported
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'showOpenFilePicker' in window &&
      'showSaveFilePicker' in window;
    setApiSupported(supported);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Verify read/write permissions for File System Access API
  const verifyPermission = async (handle, readWrite) => {
    const options = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    try {
      if ((await handle.queryPermission(options)) === 'granted') {
        return true;
      }
      if ((await handle.requestPermission(options)) === 'granted') {
        return true;
      }
    } catch (e) {
      console.error('Permission verification failed:', e);
    }
    return false;
  };

  // Debounced auto-save function
  const queueSave = (editorInstance) => {
    const activeHandle = currentFileHandleRef.current;
    
    if (!activeHandle) {
      setSaveStatus('unsaved');
      return;
    }

    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const handleToSave = currentFileHandleRef.current;
      if (!handleToSave) return;

      try {
        setSaveStatus('saving');
        
        // Convert block content to Markdown
        const markdown = editorInstance.blocksToMarkdownLossy(editorInstance.document);
        
        // Write content to local file
        const writable = await handleToSave.createWritable();
        await writable.write(markdown);
        await writable.close();
        
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    }, 1000);
  };

  // Listen to blocknote change events
  const handleContentChange = () => {
    if (isLoadingFileRef.current) {
      return;
    }
    queueSave(editor);
  };

  // Open file using File System Access API
  const handleOpenFile = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Markdown Files (*.md)',
            accept: {
              'text/markdown': ['.md'],
              'text/plain': ['.md', '.txt'],
            },
          },
        ],
        excludeAcceptAllOption: false,
        multiple: false,
      });

      const hasPermission = await verifyPermission(handle, true);
      if (!hasPermission) {
        alert('Permission to write to file was denied. Auto-save will not function.');
        return;
      }

      setFileHandle(handle);
      setFileName(handle.name);
      
      const file = await handle.getFile();
      const text = await file.text();

      // Parse markdown to blocks and populate the editor
      isLoadingFileRef.current = true;
      const blocks = editor.tryParseMarkdownToBlocks(text);
      
      editor.replaceBlocks(
        editor.document,
        blocks.length > 0 ? blocks : [{ type: 'paragraph' }]
      );
      
      // Delay resetting the load flag slightly to clear any reactive events
      setTimeout(() => {
        isLoadingFileRef.current = false;
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString());
      }, 100);

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error opening file:', err);
        alert('Failed to open file: ' + err.message);
      }
    }
  };

  // Open file fallback for unsupported browsers
  const handleOpenFileFallback = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setFileHandle(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      
      isLoadingFileRef.current = true;
      const blocks = editor.tryParseMarkdownToBlocks(text);
      
      editor.replaceBlocks(
        editor.document,
        blocks.length > 0 ? blocks : [{ type: 'paragraph' }]
      );
      
      setTimeout(() => {
        isLoadingFileRef.current = false;
        setSaveStatus('unsaved'); // Fallback can't auto-save directly
        setLastSavedTime('');
      }, 100);
    };
    reader.readAsText(file);
  };

  // Trigger fallback file selection
  const triggerFallbackSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Save As operation (File System Access API)
  const handleSaveAs = async () => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName || 'Untitled.md',
        types: [
          {
            description: 'Markdown Files (*.md)',
            accept: {
              'text/markdown': ['.md'],
            },
          },
        ],
      });

      const hasPermission = await verifyPermission(handle, true);
      if (!hasPermission) {
        alert('Permission to write to file was denied.');
        return;
      }

      setFileHandle(handle);
      setFileName(handle.name);
      
      // Write content immediately
      setSaveStatus('saving');
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      const writable = await handle.createWritable();
      await writable.write(markdown);
      await writable.close();
      
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error saving file:', err);
        alert('Failed to save file: ' + err.message);
      }
    }
  };

  // Download fallback function (to save changes when API is not supported)
  const handleDownloadFallback = () => {
    try {
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Download fallback failed:', err);
      alert('Failed to export markdown.');
    }
  };

  // Reset editor / Create New File
  const handleNewFile = () => {
    if (window.confirm('Are you sure you want to clear the editor? Any unsaved changes will be lost.')) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setFileHandle(null);
      setFileName('Untitled.md');
      
      isLoadingFileRef.current = true;
      editor.replaceBlocks(editor.document, [
        {
          type: 'paragraph',
          content: '',
        },
      ]);
      
      setTimeout(() => {
        isLoadingFileRef.current = false;
        setSaveStatus(apiSupported ? 'no-file' : 'unsaved');
        setLastSavedTime('');
      }, 100);
    }
  };

  // Helper render method for status pill
  const renderStatusPill = () => {
    switch (saveStatus) {
      case 'no-file':
        return (
          <span className="file-status-pill status-no-file">
            <span className="status-dot"></span>
            No Local File Opened
          </span>
        );
      case 'saved':
        return (
          <span className="file-status-pill status-saved">
            <span className="status-dot"></span>
            Saved to Local Disk
          </span>
        );
      case 'saving':
        return (
          <span className="file-status-pill status-saving">
            <span className="saving-spinner"></span>
            Saving...
          </span>
        );
      case 'unsaved':
        return (
          <span className="file-status-pill status-unsaved">
            <span className="status-dot"></span>
            Unsaved Changes
          </span>
        );
      case 'error':
        return (
          <span className="file-status-pill status-error">
            <span className="status-dot"></span>
            Save Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="markdown-editor-container">
      {/* Hidden file input for browsers that do not support File System Access API */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleOpenFileFallback}
        style={{ display: 'none' }}
        accept=".md,.txt"
      />

      <header className="editor-header">
        <div className="file-info-section">
          <span className="file-icon">📄</span>
          <span className="file-name-text">{fileName}</span>
          {renderStatusPill()}
          {lastSavedTime && (
            <span className="last-saved-time">
              (Saved {lastSavedTime})
            </span>
          )}
        </div>

        <div className="editor-actions">
          {apiSupported ? (
            <>
              <button onClick={handleOpenFile} className="editor-btn btn-open" title="Open File">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19V9a2 2 0 012-2h4M3 10h18" />
                </svg>
              </button>
              <button onClick={handleSaveAs} className="editor-btn btn-save-as" title="Save As...">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button onClick={triggerFallbackSelect} className="editor-btn btn-open" title="Import File">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19V9a2 2 0 012-2h4M3 10h18" />
                </svg>
              </button>
              <button onClick={handleDownloadFallback} className="editor-btn btn-save-as" title="Export MD">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </>
          )}

          <button onClick={handleNewFile} className="editor-btn btn-clear" title="New / Clear">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </header>

      {!apiSupported && (
        <div className="fallback-warning" style={{ padding: '6px 12px', marginBottom: '8px', fontSize: '0.8rem' }}>
          <strong>Notice:</strong> Local file auto-save is not supported. Use the <strong>Export MD</strong> button to download.
        </div>
      )}

      <div className="editor-workspace">
        <MantineProvider>
          <BlockNoteView editor={editor} onChange={handleContentChange} />
        </MantineProvider>
      </div>
    </div>
  );
};

export default MarkdownEditor;
