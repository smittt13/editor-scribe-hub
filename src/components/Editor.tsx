
import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Image from '@editorjs/image';
import Quote from '@editorjs/quote';

interface EditorProps {
  data?: any;
  onChange?: (data: any) => void;
  editorId?: string;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, editorId = 'editorjs' }) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Mock image uploader for the demo
  const mockImageUploader = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          resolve({
            success: 1,
            file: {
              url: e.target.result,
            },
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (!editorRef.current && !isReady) {
      const editor = new EditorJS({
        holder: editorId,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true
          },
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: mockImageUploader,
              }
            }
          },
          quote: {
            class: Quote,
            inlineToolbar: true
          }
        },
        data: data || {},
        onChange: async () => {
          if (onChange) {
            const savedData = await editorRef.current?.save();
            onChange(savedData);
          }
        },
        autofocus: true,
      });

      editorRef.current = editor;

      editor.isReady
        .then(() => {
          setIsReady(true);
          console.log('Editor.js is ready to work!');
        })
        .catch((reason) => {
          console.log(`Editor.js initialization failed: ${reason}`);
        });
    }

    return () => {
      if (editorRef.current && isReady) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [editorId, data, onChange, isReady]);

  return <div id={editorId} className="prose max-w-none min-h-[300px] border border-gray-200 rounded-md p-5" />;
};

export default Editor;
