import * as vscode from 'vscode';
import * as https from 'https';
import { getAuthSession } from '../auth/authProvider';
import { setOrganization, setProject, isConfigured } from '../config/settings';

interface Organization {
    accountId: string;
    accountName: string;
}

interface Project {
    id: string;
    name: string;
}

/**
 * Make an HTTPS GET request
 */
function makeHttpsGet(url: string, accessToken: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options: https.RequestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
}

/**
 * Check if setup is needed
 */
export function needsSetup(): boolean {
    return !isConfigured();
}

/**
 * Fetch the authenticated user's profile to get their member ID
 */
async function fetchUserProfile(accessToken: string): Promise<string> {
    const url = 'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.0';
    const data = await makeHttpsGet(url, accessToken);
    const response = JSON.parse(data);
    return response.id;
}

/**
 * Fetch available Azure DevOps organizations for the authenticated user
 */
async function fetchOrganizations(accessToken: string): Promise<Organization[]> {
    // First get the user's member ID
    const memberId = await fetchUserProfile(accessToken);
    
    const url = `https://app.vssps.visualstudio.com/_apis/accounts?memberId=${memberId}&api-version=7.0`;
    const data = await makeHttpsGet(url, accessToken);
    const response = JSON.parse(data);
    return response.value || [];
}

/**
 * Fetch projects for a specific organization
 */
async function fetchProjects(organization: string, accessToken: string): Promise<Project[]> {
    // Support both dev.azure.com and visualstudio.com formats
    let url: string;
    if (organization.includes('.visualstudio.com') || organization.includes('visualstudio.com')) {
        const orgName = organization.replace(/https?:\/\//, '').replace('.visualstudio.com', '').replace('visualstudio.com', '');
        url = `https://${orgName}.visualstudio.com/_apis/projects?api-version=7.0`;
    } else {
        url = `https://dev.azure.com/${organization}/_apis/projects?api-version=7.0`;
    }
    
    const data = await makeHttpsGet(url, accessToken);
    const response = JSON.parse(data);
    return response.value || [];
}

/**
 * Run the setup wizard to configure Azure DevOps organization and project
 */
export async function runSetupWizard(): Promise<boolean> {
    try {
        // Step 1: Authenticate
        vscode.window.showInformationMessage('Setting up Azure DevOps connection...');
        const session = await getAuthSession();
        const accessToken = session.accessToken;
        
        // Step 2: Fetch and select organization
        vscode.window.showInformationMessage('Fetching your organizations...');
        const organizations = await fetchOrganizations(accessToken);
        
        if (organizations.length === 0) {
            vscode.window.showErrorMessage('No Azure DevOps organizations found for your account');
            return false;
        }
        
        const orgItems = organizations.map(org => ({
            label: org.accountName,
            description: org.accountId
        }));
        
        const selectedOrg = await vscode.window.showQuickPick(orgItems, {
            placeHolder: 'Select your Azure DevOps organization',
            ignoreFocusOut: true
        });
        
        if (!selectedOrg) {
            return false; // User cancelled
        }
        
        // Step 3: Fetch and select project
        vscode.window.showInformationMessage(`Fetching projects from ${selectedOrg.label}...`);
        const projects = await fetchProjects(selectedOrg.label, accessToken);
        
        if (projects.length === 0) {
            vscode.window.showErrorMessage(`No projects found in organization ${selectedOrg.label}`);
            return false;
        }
        
        const projectItems = projects.map(proj => ({
            label: proj.name,
            description: proj.id
        }));
        
        const selectedProject = await vscode.window.showQuickPick(projectItems, {
            placeHolder: 'Select your Azure DevOps project',
            ignoreFocusOut: true
        });
        
        if (!selectedProject) {
            return false; // User cancelled
        }
        
        // Step 4: Save configuration
        await setOrganization(selectedOrg.label);
        await setProject(selectedProject.label);
        
        vscode.window.showInformationMessage(
            `Azure DevOps configured: ${selectedOrg.label}/${selectedProject.label}`
        );
        
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Setup failed: ${message}`);
        return false;
    }
}
