"use client";

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  required?: boolean;
  label?: string;
  helperText?: string;
  showLabel?: boolean;
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
 *
 * @param value - Current markdown content
 * @param onChange - Callback when content changes
 * @param placeholder - Placeholder text for empty editor
 * @param height - Editor height in pixels (default: 500)
 * @param required - Whether the field is required
 * @param label - Label text to display above editor
 * @param helperText - Helper text to display below editor
 * @param showLabel - Whether to show the label (default: true)
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
}: MarkdownEditorProps) {
  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && '*'}
        </label>
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
