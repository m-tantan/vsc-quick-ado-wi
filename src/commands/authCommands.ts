import * as vscode from 'vscode';
import { signIn, signOut } from '../auth/authProvider';
import { getOrganization, getProject } from '../config/settings';
import { runSetupWizard } from '../ui/setupWizard';

/**
 * Command handler for signing in to Azure DevOps
 */
export async function signInCommand(): Promise<void> {
    try {
        // Trigger the sign-in flow
        const session = await signIn();
        
        // Get current configuration
        const organization = getOrganization();
        const project = getProject();
        
        // Show success message with account info
        if (organization && project) {
            vscode.window.showInformationMessage(
                `Signed in to Azure DevOps as ${session.account.label}. Organization: ${organization}, Project: ${project}`
            );
        } else {
            // If not configured, prompt to run setup
            const result = await vscode.window.showInformationMessage(
                `Signed in to Azure DevOps as ${session.account.label}. Would you like to configure your organization and project?`,
                'Configure Now',
                'Later'
            );
            
            if (result === 'Configure Now') {
                await runSetupWizard();
            }
        }
    } catch (error) {
        // Log the full error for debugging
        console.error('Sign-in error:', error);
        
        // Show user-friendly message
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during sign-in';
        vscode.window.showErrorMessage(`Sign-in failed: ${message}`);
    }
}

/**
 * Command handler for signing out from Azure DevOps
 */
export async function signOutCommand(): Promise<void> {
    try {
        // Get current session info for display
        const organization = getOrganization();
        const project = getProject();
        
        // Confirm sign-out
        const result = await vscode.window.showWarningMessage(
            'Are you sure you want to sign out from Azure DevOps?',
            'Sign Out',
            'Cancel'
        );
        
        if (result !== 'Sign Out') {
            return; // User cancelled
        }
        
        // Sign out
        await signOut();
        
        // Show success message
        if (organization && project) {
            vscode.window.showInformationMessage(
                `Signed out from Azure DevOps (${organization}/${project}). You will need to sign in again to create work items.`
            );
        } else {
            vscode.window.showInformationMessage(
                'Signed out from Azure DevOps. You will need to sign in again to create work items.'
            );
        }
    } catch (error) {
        // Log the full error for debugging
        console.error('Sign-out error:', error);
        
        // Show user-friendly message
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during sign-out';
        vscode.window.showErrorMessage(`Sign-out failed: ${message}`);
    }
}
