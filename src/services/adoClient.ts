import * as https from 'https';

export interface WorkItemResponse {
    id: number;
    url: string;
}

export interface UserProfile {
    emailAddress: string;
    displayName: string;
    id: string;
}


/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable (transient)
 */
function isRetryableError(statusCode?: number, error?: any): boolean {
    // Retry on network errors (no status code)
    if (!statusCode) {
        return true;
    }
    
    // Retry on 5xx server errors
    if (statusCode >= 500 && statusCode < 600) {
        return true;
    }
    
    // Don't retry on client errors (400, 404) or auth errors (401, 403)
    return false;
}

/**
 * Make an HTTPS request and return the response
 */
function makeHttpsRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: string
): Promise<{ statusCode: number; data: string }> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options: https.RequestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method,
            headers: {
                ...headers,
                'Content-Length': Buffer.byteLength(body)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(body);
        req.end();
    });
}

/**
 * Build the Azure DevOps API URL, supporting both dev.azure.com and visualstudio.com formats
 */
function buildWorkItemApiUrl(org: string, project: string): string {
    // Check if using legacy visualstudio.com format
    if (org.includes('.visualstudio.com') || org.includes('visualstudio.com')) {
        // Extract just the org name if full domain was provided
        const orgName = org.replace(/https?:\/\//, '').replace('.visualstudio.com', '').replace('visualstudio.com', '');
        return `https://${orgName}.visualstudio.com/${project}/_apis/wit/workitems/$Task?api-version=7.0`;
    }
    
    // Use modern dev.azure.com format
    return `https://dev.azure.com/${org}/${project}/_apis/wit/workitems/$Task?api-version=7.0`;
}

/**
 * Build the work item URL for viewing in browser
 */
function buildWorkItemUrl(org: string, project: string, id: number): string {
    // Check if using legacy visualstudio.com format
    if (org.includes('.visualstudio.com') || org.includes('visualstudio.com')) {
        const orgName = org.replace(/https?:\/\//, '').replace('.visualstudio.com', '').replace('visualstudio.com', '');
        return `https://${orgName}.visualstudio.com/${project}/_workitems/edit/${id}`;
    }
    
    // Use modern dev.azure.com format
    return `https://dev.azure.com/${org}/${project}/_workitems/edit/${id}`;
}

/**
 * Get the authenticated user's profile information
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
    const url = 'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.0';
    
    const response = await makeHttpsRequest(
        url,
        'GET',
        {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        },
        ''
    );
    
    if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`Failed to get user profile: HTTP ${response.statusCode}`);
    }
    
    const profile = JSON.parse(response.data);
    return {
        emailAddress: profile.emailAddress || '',
        displayName: profile.displayName || '',
        id: profile.id || '',
    };
}

/**
 * Check if a work item exists
 * @param org Azure DevOps organization name
 * @param project Azure DevOps project name
 * @param workItemId Work item ID to check
 * @param accessToken Azure DevOps access token
 * @returns true if work item exists, false otherwise
 */
export async function workItemExists(
    org: string,
    project: string,
    workItemId: number,
    accessToken: string
): Promise<boolean> {
    // Build URL to fetch work item
    let url: string;
    if (org.includes('.visualstudio.com') || org.includes('visualstudio.com')) {
        const orgName = org.replace(/https?:\/\//, '').replace('.visualstudio.com', '').replace('visualstudio.com', '');
        url = `https://${orgName}.visualstudio.com/${project}/_apis/wit/workitems/${workItemId}?api-version=7.0`;
    } else {
        url = `https://dev.azure.com/${org}/${project}/_apis/wit/workitems/${workItemId}?api-version=7.0`;
    }
    
    try {
        const response = await makeHttpsRequest(
            url,
            'GET',
            {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
            ''
        );
        
        return response.statusCode >= 200 && response.statusCode < 300;
    } catch (error) {
        return false;
    }
}

/**
 * Create a parent deliverable work item
 */
export async function createParentDeliverable(
    org: string,
    project: string,
    accessToken: string,
    areaPath?: string
): Promise<WorkItemResponse> {
    console.log(`----- Creating parent deliverable for ${org}/${project}`);
    // Use "Deliverable" type, fall back to "Epic" if not available
    const url = buildWorkItemApiUrl(org, project).replace('$Task', '$Deliverable');
    console.log(`----- Parent deliverable API URL: ${url}`);
    
    const operations: any[] = [
        {
            op: 'add',
            path: '/fields/System.Title',
            value: 'Quick WIs'
        },
        {
            op: 'add',
            path: '/fields/System.Description',
            value: 'Parent deliverable for all work items created via the Quick WI extension'
        }
    ];
    
    // Add Area Path if provided
    if (areaPath) {
        console.log(`----- Adding area path to parent: ${areaPath}`);
        operations.push({
            op: 'add',
            path: '/fields/System.AreaPath',
            value: areaPath
        });
    }
    
    const body = JSON.stringify(operations);
    
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json-patch+json',
        'Accept': 'application/json'
    };
    
    try {
        const response = await makeHttpsRequest(url, 'PATCH', headers, body);
        
        if (response.statusCode < 200 || response.statusCode >= 300) {
            console.error(`----- Parent deliverable creation failed with HTTP ${response.statusCode}`);
            console.error(`----- Response body: ${response.data}`);
            throw new Error(`HTTP ${response.statusCode}`);
        }
        
        const workItem = JSON.parse(response.data);
        const workItemId = workItem.id;
        const workItemUrl = buildWorkItemUrl(org, project, workItemId);
        
        console.log(`----- Parent deliverable created successfully with ID: ${workItemId}`);
        
        return {
            id: workItemId,
            url: workItemUrl
        };
    } catch (error: any) {
        // If Deliverable type doesn't exist, try Epic
        if (error.message.includes('404')) {
            console.log(`----- Deliverable type not found, trying Epic type`);
            const epicUrl = buildWorkItemApiUrl(org, project).replace('$Task', '$Epic');
            const response = await makeHttpsRequest(epicUrl, 'PATCH', headers, body);
            
            if (response.statusCode < 200 || response.statusCode >= 300) {
                console.error(`----- Epic creation failed with HTTP ${response.statusCode}`);
                console.error(`----- Response body: ${response.data}`);
                throw new Error(`Failed to create parent: HTTP ${response.statusCode}`);
            }
            
            const workItem = JSON.parse(response.data);
            const workItemId = workItem.id;
            const workItemUrl = buildWorkItemUrl(org, project, workItemId);
            
            console.log(`----- Parent Epic created successfully with ID: ${workItemId}`);
            
            return {
                id: workItemId,
                url: workItemUrl
            };
        }
        console.error(`----- Error creating parent deliverable:`, error);
        throw error;
    }
}

/**
 * Create a work item in Azure DevOps
 * @param org Azure DevOps organization name
 * @param project Azure DevOps project name
 * @param title Work item title
 * @param description Work item description (formatted as markdown)
 * @param accessToken Azure DevOps access token
 * @param areaPath Optional area path for the work item
 * @returns Work item ID and URL
 */
export async function createWorkItem(
    org: string,
    project: string,
    title: string,
    description: string,
    accessToken: string,
    areaPath?: string,
    parentId?: number
): Promise<WorkItemResponse> {
    const url = buildWorkItemApiUrl(org, project);
    
    // Create JSON Patch document
    const operations: any[] = [
        {
            op: 'add',
            path: '/fields/System.Title',
            value: title
        },
        {
            op: 'add',
            path: '/fields/System.Description',
            value: description
        }
    ];
    
    // Add Area Path if provided
    if (areaPath) {
        operations.push({
            op: 'add',
            path: '/fields/System.AreaPath',
            value: areaPath
        });
    }
    // Add parent link if provided
    if (parentId) {
        // Build the proper work item URL for the relation
        let parentWorkItemUrl: string;
        if (org.includes('.visualstudio.com') || org.includes('visualstudio.com')) {
            const orgName = org.replace(/https?:\/\//, '').replace('.visualstudio.com', '').replace('visualstudio.com', '');
            parentWorkItemUrl = `https://${orgName}.visualstudio.com/_apis/wit/workItems/${parentId}`;
        } else {
            parentWorkItemUrl = `https://dev.azure.com/${org}/_apis/wit/workItems/${parentId}`;
        }
        
        operations.push({
            op: 'add',
            path: '/relations/-',
            value: {
                rel: 'System.LinkTypes.Hierarchy-Reverse',
                url: parentWorkItemUrl,
                attributes: {
                    comment: 'Linked to Quick WIs parent'
                }
            }
        });
    }
    
    
    const body = JSON.stringify(operations);
    
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json-patch+json',
        'Accept': 'application/json'
    };
    
    try {
        const response = await makeHttpsRequest(url, 'PATCH', headers, body);
        
        if (response.statusCode < 200 || response.statusCode >= 300) {
            // Parse error message from Azure DevOps
            let errorMessage = `HTTP ${response.statusCode}`;
            try {
                const errorData = JSON.parse(response.data);
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                // Use default error message
            }
            
            // Add more context for 404 errors
            if (response.statusCode === 404) {
                errorMessage = `HTTP 404 - Not Found. URL: ${url}\n\nPossible causes:\n- Organization name is incorrect: "${org}"\n- Project name is incorrect: "${project}"\n- You don't have access to this project\n- Work item type "Task" doesn't exist in this project`;
            }
            
            const error: any = new Error(errorMessage);
            error.statusCode = response.statusCode;
            throw error;
        }
        
        const workItem = JSON.parse(response.data);
        const workItemId = workItem.id;
        const workItemUrl = buildWorkItemUrl(org, project, workItemId);
        
        console.log(`----- Work item created successfully with ID: ${workItemId}`);
        
        return {
            id: workItemId,
            url: workItemUrl
        };
    } catch (error: any) {
        // Attach status code if available
        if (!error.statusCode && error.response) {
            error.statusCode = error.response.statusCode;
        }
        throw error;
    }
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries (default: 3)
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            // Check if we should retry
            const shouldRetry = isRetryableError(error.statusCode, error);
            
            // Don't retry if it's not a retryable error or we're on the last attempt
            if (!shouldRetry || attempt === maxRetries) {
                throw error;
            }
            
            // Calculate backoff delay: 1s, 2s, 4s
            const delayMs = Math.pow(2, attempt) * 1000;
            await sleep(delayMs);
        }
    }
    
    throw lastError;
}

/**
 * Create a work item with automatic retry logic
 * @param org Azure DevOps organization name
 * @param project Azure DevOps project name
 * @param title Work item title
 * @param description Work item description
 * @param accessToken Azure DevOps access token
 * @param areaPath Optional area path for the work item
 * @param parentId Optional parent work item ID to link to
 * @returns Work item ID and URL
 */
export async function createWorkItemWithRetry(
    org: string,
    project: string,
    title: string,
    description: string,
    accessToken: string,
    areaPath?: string,
    parentId?: number
): Promise<WorkItemResponse> {
    return retryWithBackoff(() => 
        createWorkItem(org, project, title, description, accessToken, areaPath, parentId)
    );
}
