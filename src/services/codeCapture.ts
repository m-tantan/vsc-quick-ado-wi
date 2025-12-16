import * as vscode from 'vscode';
import * as path from 'path';
import { getLanguageFromFileName } from '../utils/languageMap';

export interface SnippetData {
    filePath: string;
    startLine: number;
    endLine: number;
    code: string;
    language: string;
}

/**
 * Capture all code selections from the active editor
 * @param editor The active text editor
 * @returns Array of snippet data
 * @throws Error if no selections or all selections are empty
 */
export function captureSelections(editor: vscode.TextEditor): SnippetData[] {
    const selections = editor.selections;
    
    if (!selections || selections.length === 0) {
        throw new Error('Please select code before creating a work item');
    }
    
    const snippets: SnippetData[] = [];
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    const workspaceRoot = workspaceFolder?.uri.fsPath || '';
    
    for (const selection of selections) {
        const selectedText = editor.document.getText(selection);
        
        // Skip empty selections
        if (!selectedText || selectedText.trim() === '') {
            continue;
        }
        
        // Calculate relative path
        let filePath = editor.document.uri.fsPath;
        if (workspaceRoot && filePath.startsWith(workspaceRoot)) {
            filePath = path.relative(workspaceRoot, filePath);
            // Convert Windows path separators to forward slashes
            filePath = filePath.replace(/\\/g, '/');
        }
        
        // Get line numbers (1-based)
        const startLine = selection.start.line + 1;
        const endLine = selection.end.line + 1;
        
        // Get language for syntax highlighting
        const fileName = path.basename(editor.document.fileName);
        const language = getLanguageFromFileName(fileName);
        
        snippets.push({
            filePath,
            startLine,
            endLine,
            code: selectedText,
            language
        });
    }
    
    if (snippets.length === 0) {
        throw new Error('Please select code before creating a work item');
    }
    
    return snippets;
}

/**
 * Format a single code snippet as HTML
 * @param snippet The snippet data
 * @returns Formatted HTML string
 */
export function formatCodeSnippet(snippet: SnippetData): string {
    const { filePath, startLine, endLine, code, language } = snippet;
    
    // Create the header line
    const lineRange = startLine === endLine ? `Line ${startLine}` : `Lines ${startLine}-${endLine}`;
    const header = `<strong>File:</strong> ${filePath} (${lineRange})`;
    
    // Escape HTML entities in code
    const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Create HTML code block with language class for potential syntax highlighting
    const codeBlock = language 
        ? `<pre><code class="language-${language}">${escapedCode}</code></pre>`
        : `<pre><code>${escapedCode}</code></pre>`;
    
    return `${header}<br>${codeBlock}`;
}

/**
 * Format multiple code snippets as HTML with separators
 * @param snippets Array of snippet data
 * @returns Formatted HTML string with all snippets
 */
export function formatMultipleSnippets(snippets: SnippetData[]): string {
    return snippets.map(snippet => formatCodeSnippet(snippet)).join('<br/><br/>');
}
