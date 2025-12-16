import * as vscode from 'vscode';

interface GitExtension {
    getAPI(version: number): GitAPI;
}

interface GitAPI {
    repositories: Repository[];
}

interface Repository {
    state: RepositoryState;
}

interface RepositoryState {
    HEAD?: {
        name?: string;
    };
}

/**
 * Get the current git branch name for the active workspace
 * @returns Branch name or null if not available
 */
export function getCurrentBranch(): string | null {
    try {
        // Get the git extension
        const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
        
        if (!gitExtension) {
            return null; // Git extension not available
        }
        
        // Ensure extension is activated
        if (!gitExtension.isActive) {
            return null;
        }
        
        const git = gitExtension.exports.getAPI(1);
        
        // Get the first repository (most common case)
        if (git.repositories.length === 0) {
            return null; // No git repositories
        }
        
        const repository = git.repositories[0];
        const branchName = repository.state.HEAD?.name;
        
        return branchName || null;
    } catch (error) {
        // Silently fail - git context is optional
        return null;
    }
}
