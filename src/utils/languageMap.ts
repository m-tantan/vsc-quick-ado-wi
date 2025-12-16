/**
 * Comprehensive mapping of file extensions to markdown language identifiers
 */
export const languageMap: Record<string, string> = {
    // TypeScript/JavaScript
    'ts': 'typescript',
    'tsx': 'tsx',
    'js': 'javascript',
    'jsx': 'jsx',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Python
    'py': 'python',
    'pyw': 'python',
    
    // Java/JVM Languages
    'java': 'java',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'scala': 'scala',
    'groovy': 'groovy',
    
    // C/C++
    'c': 'c',
    'h': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'hpp': 'cpp',
    'hxx': 'cpp',
    'hh': 'cpp',
    
    // C#
    'cs': 'csharp',
    'csx': 'csharp',
    
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Other Languages
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'r': 'r',
    'lua': 'lua',
    'pl': 'perl',
    'pm': 'perl',
    
    // Shell/Scripts
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'zsh',
    'fish': 'fish',
    'ps1': 'powershell',
    'psm1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    
    // Data/Config
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'conf',
    
    // Database
    'sql': 'sql',
    'mysql': 'sql',
    'pgsql': 'sql',
    
    // Markup
    'md': 'markdown',
    'markdown': 'markdown',
    'rst': 'restructuredtext',
    'tex': 'latex',
    
    // Other
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'gradle': 'gradle',
    'vue': 'vue',
    'svelte': 'svelte',
};

/**
 * Get the markdown language identifier from a file name
 * @param fileName The name of the file (including extension)
 * @returns The language identifier for markdown code fences, or empty string for unknown types
 */
export function getLanguageFromFileName(fileName: string): string {
    // Extract extension (handle files like .bashrc, .gitignore)
    const parts = fileName.toLowerCase().split('.');
    
    // Check special cases without extension
    const baseName = parts[parts.length - 1];
    if (baseName === 'dockerfile' || baseName === 'makefile') {
        return languageMap[baseName] || '';
    }
    
    // Get extension
    if (parts.length > 1) {
        const extension = parts[parts.length - 1];
        return languageMap[extension] || '';
    }
    
    return '';
}
