import * as vscode from "vscode";
import { getOrganization, getProject, getAreaPath } from "../config/settings";
import { getAccessToken, isSignedOut } from "../auth/authProvider";
import {
  captureSelections,
  formatMultipleSnippets,
} from "../services/codeCapture";
import { getCurrentBranch } from "../services/gitContext";
import {
  createWorkItemWithRetry,
  createParentDeliverable,
  workItemExists,
} from "../services/adoClient";
import { promptForTitle, promptForDescription } from "../ui/prompts";
import { showSuccess, showError } from "../ui/notifications";
import { needsSetup, runSetupWizard } from "../ui/setupWizard";

const PARENT_DELIVERABLE_KEY = "quickAdoWi.parentDeliverableId";

/**
 * Get or create the parent deliverable for the current organization/project
 */
async function getOrCreateParentDeliverable(
  context: vscode.ExtensionContext,
  org: string,
  project: string,
  accessToken: string,
  areaPath?: string
): Promise<number | undefined> {
  // Check if we already have a parent deliverable ID for this org/project
  const stateKey = `${PARENT_DELIVERABLE_KEY}.${org}.${project}`;
  const existingId = context.workspaceState.get<number>(stateKey);

  if (existingId) {
    console.log(
      `----- Found existing parent deliverable ID in state: ${existingId}`
    );

    // Verify the work item still exists
    console.log(`----- Verifying parent deliverable still exists...`);
    const exists = await workItemExists(org, project, existingId, accessToken);

    if (exists) {
      console.log(`----- Parent deliverable ${existingId} verified, using it`);
      return existingId;
    } else {
      console.log(
        `----- Parent deliverable ${existingId} no longer exists, will create new one`
      );
      // Clear the old ID from state
      await context.workspaceState.update(stateKey, undefined);
    }
  }

  console.log(`----- Creating new parent deliverable for ${org}/${project}`);
  try {
    // Create the parent deliverable
    const parent = await createParentDeliverable(
      org,
      project,
      accessToken,
      areaPath
    );
    console.log(`----- Created parent deliverable: ${parent.id}`);

    // Store it in workspace state
    await context.workspaceState.update(stateKey, parent.id);
    console.log(`----- Stored parent deliverable ID in workspace state`);

    return parent.id;
  } catch (error) {
    console.error("----- Failed to create parent deliverable:", error);
    // Don't fail the entire operation if parent creation fails
    return undefined;
  }
}

let extensionContext: vscode.ExtensionContext | undefined;

/**
 * Set the extension context (called from extension.ts)
 */
export function setExtensionContext(context: vscode.ExtensionContext): void {
  extensionContext = context;
}

/**
 * Main command handler for creating Azure DevOps work items from code selection
 */
export async function createWorkItemCommand(): Promise<void> {
  try {
    // Check if user is signed out
    if (isSignedOut()) {
      const result = await vscode.window.showWarningMessage(
        "You are not signed in to Azure DevOps. Please sign in first.",
        "Sign In",
        "Cancel"
      );

      if (result === "Sign In") {
        await vscode.commands.executeCommand("quickAdoWi.signIn");
        // After sign-in, let the user manually trigger create work item again
        return;
      } else {
        return; // User cancelled
      }
    }

    // Check if setup is needed
    if (needsSetup()) {
      const setupComplete = await runSetupWizard();
      if (!setupComplete) {
        return; // User cancelled setup
      }
    }

    // Get the active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      showError("No active editor found");
      return;
    }

    // Capture code selections
    let snippets;
    try {
      snippets = captureSelections(editor);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to capture code selection";
      showError(message);
      return;
    }

    // Prompt for title
    const title = await promptForTitle();
    if (!title) {
      return; // User cancelled
    }

    // Prompt for optional description
    const userContext = await promptForDescription();

    // Format code snippets
    const formattedSnippets = formatMultipleSnippets(snippets);

    // Get git branch (optional)
    const branchName = getCurrentBranch();
    console.log(`----- Git branch name: ${branchName || "not found"}`);

    // Build complete description in HTML format
    let description = "";

    if (userContext) {
      description += `<h3>Context</h3><p>${userContext}</p>`;
    }

    if (branchName) {
      description += `<h3>Branch</h3><p><code>${branchName}</code></p>`;
      console.log(`----- Added branch section to description`);
    }

    description += `<h3>Code Snippets</h3>${formattedSnippets}`;

    // Use the HTML description directly
    const htmlDescription = description;
    console.log(
      `----- Description length: ${htmlDescription.length} characters`
    );

    // Get configuration
    const organization = getOrganization();
    const project = getProject();
    const areaPath = getAreaPath();

    if (!organization || !project) {
      showError(
        'Azure DevOps configuration missing. Please run "Configure Azure DevOps Settings"'
      );
      return;
    }

    // Log configuration for debugging
    console.log(`Creating work item in: ${organization}/${project}`);

    // Get access token (with retry on auth failure)
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      showError(`Authentication error: ${message}`);

      // Attempt re-authentication
      try {
        accessToken = await getAccessToken(true);
      } catch (retryError) {
        const retryMessage =
          retryError instanceof Error
            ? retryError.message
            : "Re-authentication failed";
        showError(`Re-authentication failed: ${retryMessage}`);
        return;
      }
    }

    // Get or create parent deliverable
    let parentId: number | undefined;
    let parentUrl: string | undefined;
    if (extensionContext) {
      console.log(`----- Getting or creating parent deliverable`);
      parentId = await getOrCreateParentDeliverable(
        extensionContext,
        organization,
        project,
        accessToken,
        areaPath
      );
      console.log(`----- Parent deliverable ID: ${parentId}`);
      if (parentId) {
        // Build parent URL
        const baseUrl = organization.includes(".")
          ? `https://${organization}`
          : `https://dev.azure.com/${organization}`;
        parentUrl = `${baseUrl}/${project}/_workitems/edit/${parentId}`;
        console.log(`----- Parent URL: ${parentUrl}`);
      } else {
        console.log("----- No parent deliverable created");
      }
    } else {
      console.log(
        "----- Extension context not available, skipping parent deliverable"
      );
    }

    // Create work item with retry logic
    try {
      const result = await createWorkItemWithRetry(
        organization,
        project,
        title,
        htmlDescription,
        accessToken,
        areaPath,
        parentId
      );

      // Show success notification
      await showSuccess(result.url, parentUrl);
    } catch (error: any) {
      // Handle specific error types
      if (error.statusCode === 401 || error.statusCode === 403) {
        // Authentication error - try to re-authenticate and retry once
        try {
          const newToken = await getAccessToken(true);
          const result = await createWorkItemWithRetry(
            organization,
            project,
            title,
            htmlDescription,
            newToken,
            areaPath,
            parentId
          );
          await showSuccess(result.url, parentUrl);
        } catch (retryError: any) {
          const message =
            retryError instanceof Error ? retryError.message : "Unknown error";
          showError(`Failed to create work item: ${message}`);
        }
      } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        showError("Network error: Unable to reach Azure DevOps");
      } else {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        // Check for permissions error
        if (message.includes("TF237111") || message.includes("permissions")) {
          showError(
            `Permissions error: ${message}
            
            Tip: Set an Area Path in settings (azureDevOps.areaPath) that you have access to, or contact your Azure DevOps admin.`
          );
        } else {
          showError(`Failed to create work item: ${message}`);
        }
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    showError(message);
  }
}
