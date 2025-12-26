import * as vscode from 'vscode';

const AZURE_DEVOPS_SCOPE = '499b84ac-1321-427f-aa17-267ca6975798/.default';
const AUTH_PROVIDER = 'microsoft';

let cachedSession: vscode.AuthenticationSession | null = null;

/**
 * Get an authentication session for Azure DevOps
 * @param forceNewSession If true, forces a new authentication session
 * @returns Authentication session
 */
export async function getAuthSession(forceNewSession: boolean = false): Promise<vscode.AuthenticationSession> {
    try {
        // Clear cache if forcing new session
        if (forceNewSession) {
            cachedSession = null;
        }

        // Return cached session if available
        if (cachedSession) {
            return cachedSession;
        }

        const session = await vscode.authentication.getSession(
            AUTH_PROVIDER,
            [AZURE_DEVOPS_SCOPE],
            {
                createIfNone: true
            }
        );

        if (!session) {
            throw new Error('Failed to authenticate with Azure DevOps');
        }

        // Cache the session
        cachedSession = session;
        return session;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown authentication error';
        throw new Error(`Azure DevOps authentication failed: ${message}`);
    }
}

/**
 * Get the access token for Azure DevOps API calls
 * @param forceNewSession If true, forces a new authentication session
 * @returns Access token string
 */
export async function getAccessToken(forceNewSession: boolean = false): Promise<string> {
    const session = await getAuthSession(forceNewSession);
    return session.accessToken;
}

/**
 * Clear the cached authentication session
 */
export function clearAuthCache(): void {
    cachedSession = null;
}

/**
 * Sign in to Azure DevOps - prompts the user to authenticate
 * @returns The authenticated session
 */
export async function signIn(): Promise<vscode.AuthenticationSession> {
    try {
        // Clear any cached session to force fresh sign-in
        cachedSession = null;
        
        const session = await vscode.authentication.getSession(
            AUTH_PROVIDER,
            [AZURE_DEVOPS_SCOPE],
            {
                createIfNone: true
            }
        );

        if (!session) {
            throw new Error('Failed to authenticate with Azure DevOps');
        }

        // Cache the new session
        cachedSession = session;
        
        return session;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown authentication error';
        throw new Error(`Azure DevOps sign-in failed: ${message}`);
    }
}

/**
 * Sign out from Azure DevOps - clears the cached authentication session
 * Note: This only clears the cached session in the extension. 
 * VS Code's authentication API doesn't provide a way to programmatically sign out.
 * Users can fully remove their account through VS Code's Accounts menu.
 */
export async function signOut(): Promise<void> {
    try {
        // Clear the cached session
        cachedSession = null;
        
        // Note: VS Code's authentication API doesn't provide a direct way to programmatically 
        // sign out. The user can manage their accounts through VS Code's Accounts menu.
        // Clearing the cache ensures the next operation will prompt for authentication.
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Azure DevOps sign-out failed: ${message}`);
    }
}
