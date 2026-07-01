import React, { useState, useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { MantineProvider } from '@mantine/core';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import '@mantine/core/styles.css';
import './MarkdownEditor.css';

// IndexedDB Helper Functions to persist FileSystemFileHandle across page reloads
const DB_NAME = 'DevUtilsDB';
const STORE_NAME = 'FileHandles';

const saveHandleToIndexedDB = async (handle) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(handle, 'activeFileHandle');
      tx.oncomplete = () => resolve();
      tx.onerror = (err) => reject(err);
    };
    request.onerror = (e) => reject(e);
  });
};

const getHandleFromIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get('activeFileHandle');
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = (err) => reject(err);
    };
    request.onerror = (e) => reject(e);
  });
};

const clearHandleFromIndexedDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete('activeFileHandle');
      tx.oncomplete = () => resolve();
    };
    request.onerror = (e) => reject(e);
  });
};

const MarkdownEditor = () => {
  const [fileHandle, setFileHandle] = useState(null);
  const [fileName, setFileName] = useState('Untitled.md');
  const [saveStatus, setSaveStatus] = useState('no-file'); // 'no-file' | 'saved' | 'saving' | 'unsaved' | 'error' | 'needs-authorization'
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

  // On page load, restore previous file handle from IndexedDB if available
  useEffect(() => {
    const restoreFile = async () => {
      try {
        const restoredHandle = await getHandleFromIndexedDB();
        if (restoredHandle) {
          setFileName(restoredHandle.name);
          const permission = await restoredHandle.queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            setFileHandle(restoredHandle);
            
            const file = await restoredHandle.getFile();
            const text = await file.text();
            
            isLoadingFileRef.current = true;
            const blocks = editor.tryParseMarkdownToBlocks(text);
            editor.replaceBlocks(editor.document, blocks.length > 0 ? blocks : [{ type: 'paragraph' }]);
            
            setTimeout(() => {
              isLoadingFileRef.current = false;
              setSaveStatus('saved');
            }, 100);
          } else {
            setSaveStatus('needs-authorization');
          }
        }
      } catch (err) {
        console.error('Failed to restore file handle from DB:', err);
      }
    };

    if (apiSupported) {
      restoreFile();
    }
  }, [apiSupported, editor]);

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
      await saveHandleToIndexedDB(handle);
      
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
      }, 100);

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error opening file:', err);
        alert('Failed to open file: ' + err.message);
      }
    }
  };

  // Request permission for previously loaded file
  const handleRequestPermission = async () => {
    const handle = await getHandleFromIndexedDB();
    if (!handle) return;

    try {
      const hasPermission = await verifyPermission(handle, true);
      if (hasPermission) {
        setFileHandle(handle);
        setFileName(handle.name);

        const file = await handle.getFile();
        const text = await file.text();

        isLoadingFileRef.current = true;
        const blocks = editor.tryParseMarkdownToBlocks(text);
        editor.replaceBlocks(editor.document, blocks.length > 0 ? blocks : [{ type: 'paragraph' }]);

        setTimeout(() => {
          isLoadingFileRef.current = false;
          setSaveStatus('saved');
        }, 100);
      }
    } catch (err) {
      console.error('Error requesting file permission:', err);
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
      await saveHandleToIndexedDB(handle);
      
      // Write content immediately
      setSaveStatus('saving');
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      const writable = await handle.createWritable();
      await writable.write(markdown);
      await writable.close();
      
      setSaveStatus('saved');
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
    } catch (err) {
      console.error('Download fallback failed:', err);
      alert('Failed to export markdown.');
    }
  };

  // Reset editor / Create New File
  const handleNewFile = async () => {
    if (window.confirm('Are you sure you want to clear the editor? Any unsaved changes will be lost.')) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setFileHandle(null);
      setFileName('Untitled.md');
      await clearHandleFromIndexedDB();
      
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
            Saved
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
      case 'needs-authorization':
        return (
          <span className="file-status-pill status-unsaved" style={{ cursor: 'pointer' }} onClick={handleRequestPermission}>
            <span className="status-dot"></span>
            Authorize Access
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
        </div>

        <div className="editor-actions">
          {saveStatus === 'needs-authorization' && (
            <button onClick={handleRequestPermission} className="editor-btn btn-open" title="Authorize File Access">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          )}

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
