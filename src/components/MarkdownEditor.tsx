"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onstart: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  required?: boolean;
  label?: string;
  helperText?: string;
  showLabel?: boolean;
  enableVoiceDictation?: boolean;
}

/**
 * Reusable Markdown Editor Component with GitHub-style live preview
 *
 * Features:
 * - Split-pane editor with live markdown preview
 * - GitHub Flavored Markdown support (tables, task lists, strikethrough, etc.)
 * - Draggable divider to adjust editor/preview panes
 * - Automatic dark mode switching
 * - Toolbar with formatting buttons
 * - Syntax highlighting for code blocks
 * - Optional voice dictation support
 *
 * @param value - Current markdown content
 * @param onChange - Callback when content changes
 * @param placeholder - Placeholder text for empty editor
 * @param height - Editor height in pixels (default: 500)
 * @param required - Whether the field is required
 * @param label - Label text to display above editor
 * @param helperText - Helper text to display below editor
 * @param showLabel - Whether to show the label (default: true)
 * @param enableVoiceDictation - Enable voice dictation button (default: false)
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content here using Markdown...',
  height = 500,
  required = false,
  label = 'Content (Markdown)',
  helperText = 'Write using Markdown syntax. The preview shows how your content will look.',
  showLabel = true,
  enableVoiceDictation = false,
}: MarkdownEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingSupported, setIsRecordingSupported] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!enableVoiceDictation) return;

    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          setRecordingError('Microphone permission denied. Please allow microphone access to use voice dictation.');
        } else {
          setRecordingError(`Error during voice dictation: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        onChange(value + (value ? '\n' : '') + transcript);
      };

      recognitionRef.current = recognition;
      setIsRecordingSupported(true);
    } else {
      setIsRecordingSupported(false);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enableVoiceDictation, value, onChange]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setRecordingError(null);
      recognitionRef.current?.start();
    }
  };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && '*'}
          </label>
          {enableVoiceDictation && isRecordingSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-200'
              }`}
              disabled={!isRecordingSupported}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-1 ${isRecording ? 'animate-pulse' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              {isRecording ? 'Stop Recording' : 'Start Dictation'}
            </button>
          )}
        </div>
      )}

      {recordingError && (
        <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
          {recordingError}
        </div>
      )}

      <div data-color-mode="auto">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={height}
          preview="live"
          hideToolbar={false}
          enableScroll={true}
          visibleDragbar={true}
          textareaProps={{
            placeholder,
            required,
          }}
        />
      </div>

      {helperText && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
