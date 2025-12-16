import * as vscode from 'vscode';

/**
 * Show success notification with clipboard copy and browser open option
 * @param workItemUrl The URL of the created work item
 * @param parentUrl Optional URL of the parent deliverable
 */
export async function showSuccess(workItemUrl: string, parentUrl?: string): Promise<void> {
    // Copy URL to clipboard
    await vscode.env.clipboard.writeText(workItemUrl);
    
    // Show notification with buttons
    const buttons = parentUrl 
        ? ['Open Work Item', 'Open Parent']
        : ['Open in browser'];
    
    const action = await vscode.window.showInformationMessage(
        'Copied to clipboard',
        ...buttons
    );
    
    // Handle button click
    if (action === 'Open Work Item' || action === 'Open in browser') {
        await vscode.env.openExternal(vscode.Uri.parse(workItemUrl));
    } else if (action === 'Open Parent' && parentUrl) {
        await vscode.env.openExternal(vscode.Uri.parse(parentUrl));
    }
}

/**
 * Show error notification
 * @param message The error message to display
 */
export function showError(message: string): void {
    vscode.window.showErrorMessage(message);
}

/**
 * Show information notification
 * @param message The message to display
 */
export function showInfo(message: string): void {
    vscode.window.showInformationMessage(message);
}
