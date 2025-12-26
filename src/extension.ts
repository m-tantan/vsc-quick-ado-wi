import * as vscode from 'vscode';
import { createWorkItemCommand, setExtensionContext } from './commands/createWorkItem';
import { runSetupWizard } from './ui/setupWizard';
import { clearAuthCache } from './auth/authProvider';
import { signInCommand, signOutCommand } from './commands/authCommands';

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

    // Register the sign-in command
    const signInDisposable = vscode.commands.registerCommand(
        'azuredevops.signIn',
        signInCommand
    );

    // Register the sign-out command
    const signOutDisposable = vscode.commands.registerCommand(
        'azuredevops.signOut',
        signOutCommand
    );

    // Add commands to subscriptions
    context.subscriptions.push(createWorkItemDisposable);
    context.subscriptions.push(configureDisposable);
    context.subscriptions.push(signInDisposable);
    context.subscriptions.push(signOutDisposable);
}

/**
 * Extension deactivation
 */
export function deactivate() {
    // Clear authentication cache
    clearAuthCache();
    console.log('Azure DevOps Work Item Creator extension is now deactivated');
}
