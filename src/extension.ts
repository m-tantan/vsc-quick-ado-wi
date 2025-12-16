import * as vscode from 'vscode';
import { createWorkItemCommand, setExtensionContext } from './commands/createWorkItem';
import { runSetupWizard } from './ui/setupWizard';
import { clearAuthCache } from './auth/authProvider';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Azure DevOps Work Item Creator extension is now active');

    // Set the extension context for the command handler
    setExtensionContext(context);

    // Register the create work item command
    const createWorkItemDisposable = vscode.commands.registerCommand(
        'azuredevops.createWorkItem',
        createWorkItemCommand
    );

    // Register the configure command
    const configureDisposable = vscode.commands.registerCommand(
        'azuredevops.configure',
        runSetupWizard
    );

    // Add commands to subscriptions
    context.subscriptions.push(createWorkItemDisposable);
    context.subscriptions.push(configureDisposable);
}

/**
 * Extension deactivation
 */
export function deactivate() {
    // Clear authentication cache
    clearAuthCache();
    console.log('Azure DevOps Work Item Creator extension is now deactivated');
}
