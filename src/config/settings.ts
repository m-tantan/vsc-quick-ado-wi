import * as vscode from 'vscode';

const EXTENSION_NAME = "quickAdoWi";

/**
 * Get the Azure DevOps organization from user settings
 */
export function getOrganization(): string | undefined {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  return config.get<string>("organization");
}

/**
 * Get the Azure DevOps project from user settings
 */
export function getProject(): string | undefined {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  return config.get<string>("project");
}

/**
 * Get the default work item type from user settings
 */
export function getDefaultWorkItemType(): string {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  return config.get<string>("defaultWorkItemType", "Task");
}

/**
 * Set the Azure DevOps organization in global user settings
 */
export async function setOrganization(organization: string): Promise<void> {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  await config.update(
    "organization",
    organization,
    vscode.ConfigurationTarget.Global
  );
}

/**
 * Set the Azure DevOps project in global user settings
 */
export async function setProject(project: string): Promise<void> {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  await config.update("project", project, vscode.ConfigurationTarget.Global);
}

/**
 * Get the Area Path from user settings
 */
export function getAreaPath(): string | undefined {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  const areaPath = config.get<string>("areaPath");
  return areaPath && areaPath.trim() !== "" ? areaPath : undefined;
}

/**
 * Set the Area Path in global user settings
 */
export async function setAreaPath(areaPath: string): Promise<void> {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  await config.update("areaPath", areaPath, vscode.ConfigurationTarget.Global);
}

/**
 * Check if both organization and project are configured
 */
export function isConfigured(): boolean {
    const org = getOrganization();
    const project = getProject();
    return !!(org && project && org.trim() !== '' && project.trim() !== '');
}
