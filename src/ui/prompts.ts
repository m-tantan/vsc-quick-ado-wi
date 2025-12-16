import * as vscode from 'vscode';

/**
 * Prompt the user for a work item title
 * @returns The title entered by the user, or undefined if cancelled
 */
export async function promptForTitle(): Promise<string | undefined> {
    const title = await vscode.window.showInputBox({
        prompt: 'Enter work item title',
        placeHolder: 'e.g., Refactor authentication logic',
        validateInput: (value: string) => {
            if (!value || value.trim() === '') {
                return 'Title is required';
            }
            return null;
        }
    });
    
    return title?.trim();
}

/**
 * Prompt the user for optional additional context
 * @returns The description entered by the user, or undefined if skipped/cancelled
 */
export async function promptForDescription(): Promise<string | undefined> {
    const description = await vscode.window.showInputBox({
        prompt: 'Add additional context (optional, press Enter to skip)',
        placeHolder: 'e.g., This code needs to handle edge cases better'
    });
    
    return description?.trim();
}
