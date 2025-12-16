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
