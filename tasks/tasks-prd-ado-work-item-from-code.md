## Relevant Files

- `package.json` - Extension manifest with activation events, commands, and dependencies
- `src/extension.ts` - Main extension entry point with activate/deactivate functions
- `src/commands/createWorkItem.ts` - Core command handler for work item creation
- `src/commands/createWorkItem.test.ts` - Unit tests for work item creation command
- `src/auth/authProvider.ts` - Azure DevOps authentication wrapper
- `src/auth/authProvider.test.ts` - Unit tests for authentication
- `src/config/settings.ts` - Configuration management (get/set organization, project)
- `src/config/settings.test.ts` - Unit tests for settings management
- `src/services/codeCapture.ts` - Code selection capture and formatting logic
- `src/services/codeCapture.test.ts` - Unit tests for code capture
- `src/services/adoClient.ts` - Azure DevOps REST API client with retry logic
- `src/services/adoClient.test.ts` - Unit tests for ADO API client
- `src/services/gitContext.ts` - Git branch name retrieval
- `src/services/gitContext.test.ts` - Unit tests for git context
- `src/utils/languageMap.ts` - File extension to language identifier mapping
- `src/utils/languageMap.test.ts` - Unit tests for language mapping
- `src/ui/setupWizard.ts` - First-time setup walkthrough
- `src/ui/setupWizard.test.ts` - Unit tests for setup wizard
- `src/ui/prompts.ts` - Input box prompts for title and description
- `src/ui/prompts.test.ts` - Unit tests for prompts
- `src/ui/notifications.ts` - Success/error notification handlers
- `src/ui/notifications.test.ts` - Unit tests for notifications
- `tsconfig.json` - TypeScript configuration
- `.vscode/launch.json` - Debug configuration for extension development
- `.vscodeignore` - Files to exclude from extension package
- `README.md` - Extension documentation for marketplace
- `CHANGELOG.md` - Version history

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `authProvider.ts` and `authProvider.test.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- For testing VSCode APIs, use `@vscode/test-electron` for integration tests or mock the VSCode API for unit tests.

## Tasks

- [x] 1.0 Extension Setup and Scaffolding
  - [x] 1.1 Initialize project with `npm init` and create basic folder structure (`src/`, `src/commands/`, `src/services/`, `src/auth/`, `src/config/`, `src/ui/`, `src/utils/`)
  - [x] 1.2 Install dependencies: `vscode` types, `@types/node`, TypeScript, Jest, `@vscode/test-electron`
  - [x] 1.3 Create `tsconfig.json` with appropriate compiler options (target ES2020, module commonjs, outDir dist)
  - [x] 1.4 Create basic `package.json` with extension metadata (name, publisher, version, engines.vscode >= 1.75.0, categories: ["Azure"])
  - [x] 1.5 Set up Jest configuration file (`jest.config.js`) for unit testing with TypeScript support
  - [x] 1.6 Create `.vscodeignore` file to exclude test files, source files, and config files from the packaged extension
  - [x] 1.7 Create `.vscode/launch.json` with "Extension Development Host" configuration for debugging

- [x] 2.0 Configuration Management and Settings
  - [x] 2.1 Define configuration schema in `package.json` under `contributes.configuration` with properties: `azureDevOps.organization`, `azureDevOps.project`, `azureDevOps.defaultWorkItemType` (default "Task")
  - [x] 2.2 Create `src/config/settings.ts` with functions to get/set configuration values using `vscode.workspace.getConfiguration()`
  - [x] 2.3 Implement `getOrganization()` function to retrieve organization from user settings
  - [x] 2.4 Implement `getProject()` function to retrieve project from user settings
  - [x] 2.5 Implement `setOrganization(org: string)` function to save organization to global user settings
  - [x] 2.6 Implement `setProject(project: string)` function to save project to global user settings
  - [x] 2.7 Implement `isConfigured()` function to check if both organization and project are set
  - [ ] 2.8 Create `src/config/settings.test.ts` with unit tests for all configuration functions

- [x] 3.0 Azure DevOps Authentication
  - [x] 3.1 Create `src/auth/authProvider.ts` module for authentication logic
  - [x] 3.2 Implement `getAuthSession()` function using `vscode.authentication.getSession('microsoft', ['499b84ac-1321-427f-aa17-267ca6975798/.default'], { createIfNone: true })`
  - [x] 3.3 Add session caching to avoid repeated authentication prompts within the same VSCode session
  - [x] 3.4 Implement `getAccessToken()` function that returns `session.accessToken`
  - [x] 3.5 Implement error handling for authentication failures (catch and rethrow with user-friendly messages)
  - [x] 3.6 Add custom authentication prompt title: "Azure DevOps Work Item Creator - Authentication Required" using `account` parameter in getSession options
  - [ ] 3.7 Create `src/auth/authProvider.test.ts` with unit tests (mock vscode.authentication API)

- [x] 4.0 Code Selection Capture and Formatting
  - [x] 4.1 Create `src/services/codeCapture.ts` module for code selection logic
  - [x] 4.2 Implement `captureSelections(editor: vscode.TextEditor)` function to get all selections from active editor
  - [x] 4.3 Validate that at least one selection exists and has non-empty text (throw error if no selection)
  - [x] 4.4 For each selection, capture: file path (relative to workspace), start line, end line, selected text
  - [x] 4.5 Create `src/utils/languageMap.ts` with a comprehensive map of file extensions to markdown language identifiers (ts→typescript, js→javascript, py→python, etc.)
  - [x] 4.6 Implement `getLanguageFromFileName(fileName: string)` function that extracts extension and maps to language
  - [x] 4.7 Implement `formatCodeSnippet(filePath: string, startLine: number, endLine: number, code: string, language: string)` function that returns formatted markdown string with header and code fence
  - [x] 4.8 Implement `formatMultipleSnippets(snippets: Array<SnippetData>)` function that concatenates multiple snippets with blank line separators
  - [ ] 4.9 Create `src/utils/languageMap.test.ts` and `src/services/codeCapture.test.ts` with unit tests

- [x] 5.0 Work Item Creation with Retry Logic
  - [x] 5.1 Create `src/services/adoClient.ts` module for Azure DevOps API integration
  - [x] 5.2 Implement `createWorkItem(org: string, project: string, title: string, description: string, accessToken: string)` function
  - [x] 5.3 Build the API endpoint URL: `https://dev.azure.com/{org}/{project}/_apis/wit/workitems/$Task?api-version=7.0`
  - [x] 5.4 Create request body as JSON Patch array: `[{ op: "add", path: "/fields/System.Title", value: title }, { op: "add", path: "/fields/System.Description", value: description }]`
  - [x] 5.5 Set headers: `Authorization: Bearer {token}`, `Content-Type: application/json-patch+json`
  - [x] 5.6 Make PATCH request using Node.js `https` module or `node-fetch`
  - [x] 5.7 Parse response to extract work item ID and build work item URL: `https://dev.azure.com/{org}/{project}/_workitems/edit/{id}`
  - [x] 5.8 Implement `retryWithBackoff(fn: Function, maxRetries: number)` utility function with exponential backoff (1s, 2s, 4s delays)
  - [x] 5.9 Add retry logic that only retries on transient errors (network errors, 5xx status codes) but NOT on 401, 403, 400, 404
  - [x] 5.10 Wrap `createWorkItem` call in retry logic with up to 3 attempts
  - [ ] 5.11 Create `src/services/adoClient.test.ts` with unit tests (mock HTTP requests)

- [x] 6.0 User Interface (Commands, Menus, and Prompts)
  - [x] 6.1 Register command "azuredevops.createWorkItem" in `package.json` under `contributes.commands` with title "Create Azure DevOps Work Item"
  - [x] 6.2 Add command to editor context menu in `package.json` under `contributes.menus.editor/context` with condition `editorHasSelection`
  - [x] 6.3 Create `src/ui/prompts.ts` module for user input prompts
  - [x] 6.4 Implement `promptForTitle()` function using `vscode.window.showInputBox()` with prompt "Enter work item title" and validation that it's not empty
  - [x] 6.5 Implement `promptForDescription()` function using `vscode.window.showInputBox()` with prompt "Add additional context (optional, press Enter to skip)" and no validation
  - [x] 6.6 Handle user cancellation (when input box returns undefined) by returning null/undefined to signal cancellation
  - [x] 6.7 Create `src/commands/createWorkItem.ts` with main command handler function
  - [x] 6.8 In command handler, check if editor exists and has selections, call `captureSelections()`, then prompt for title and description
  - [ ] 6.9 Create `src/ui/prompts.test.ts` with unit tests for prompt functions

- [x] 7.0 First-Time Setup Wizard
  - [x] 7.1 Create `src/ui/setupWizard.ts` module for setup walkthrough
  - [x] 7.2 Implement `needsSetup()` function that checks if configuration is missing using `isConfigured()` from settings module
  - [x] 7.3 Implement `runSetupWizard()` function that guides through authentication and configuration
  - [x] 7.4 Step 1: Call `getAuthSession()` to trigger Azure DevOps authentication
  - [x] 7.5 Step 2: Fetch available organizations using Azure DevOps REST API (`https://app.vssps.visualstudio.com/_apis/accounts?api-version=7.0&memberId={userId}`)
  - [x] 7.6 Show organization picker using `vscode.window.showQuickPick()` with list of organization names
  - [x] 7.7 Step 3: Fetch projects for selected organization using API (`https://dev.azure.com/{org}/_apis/projects?api-version=7.0`)
  - [x] 7.8 Show project picker using `vscode.window.showQuickPick()` with list of project names
  - [x] 7.9 Save selected organization and project using `setOrganization()` and `setProject()`
  - [x] 7.10 Register command "azuredevops.configure" in `package.json` to allow re-running setup wizard
  - [x] 7.11 In main command handler (`createWorkItem.ts`), check `needsSetup()` before proceeding and call `runSetupWizard()` if needed
  - [ ] 7.12 Create `src/ui/setupWizard.test.ts` with unit tests

- [x] 8.0 Error Handling and Notifications
  - [x] 8.1 Create `src/ui/notifications.ts` module for notification display
  - [x] 8.2 Implement `showSuccess(workItemUrl: string)` function that displays "Copied to clipboard" notification with "Open in browser" button
  - [x] 8.3 In `showSuccess()`, copy URL to clipboard using `vscode.env.clipboard.writeText(workItemUrl)`
  - [x] 8.4 Handle "Open in browser" button click by calling `vscode.env.openExternal(vscode.Uri.parse(workItemUrl))`
  - [x] 8.5 Implement `showError(message: string)` function using `vscode.window.showErrorMessage()`
  - [x] 8.6 In command handler, wrap entire workflow in try-catch block
  - [x] 8.7 Catch authentication errors (401, 403) and trigger re-authentication by calling `getAuthSession()` with `forceNewSession: true` option, then retry work item creation
  - [x] 8.8 Catch configuration errors (missing org/project) and show error with prompt to run setup wizard
  - [x] 8.9 Catch network errors and show "Network error: Unable to reach Azure DevOps"
  - [x] 8.10 Catch API errors after retries and show "Failed to create work item: {error message}"
  - [x] 8.11 Catch no-selection errors and show "Please select code before creating a work item"
  - [ ] 8.12 Create `src/ui/notifications.test.ts` with unit tests

- [x] 9.0 Git Context Integration
  - [x] 9.1 Create `src/services/gitContext.ts` module for git integration
  - [x] 9.2 Implement `getCurrentBranch()` function that accesses VSCode's git extension API: `vscode.extensions.getExtension('vscode.git')`
  - [x] 9.3 Get the git API instance and retrieve repository for the active workspace folder
  - [x] 9.4 Get current branch name from `repository.state.HEAD.name`
  - [x] 9.5 Handle cases where git extension is not available or no repository exists (return null, no error)
  - [x] 9.6 In `createWorkItem` command handler, call `getCurrentBranch()` after capturing code snippets
  - [x] 9.7 If branch name exists, append `\n\nBranch: {branchName}` to the formatted description
  - [ ] 9.8 Create `src/services/gitContext.test.ts` with unit tests

- [x] 10.0 Main Extension Entry Point
  - [x] 10.1 Create `src/extension.ts` with `activate(context: vscode.ExtensionContext)` function
  - [x] 10.2 Register "azuredevops.createWorkItem" command with command handler from `src/commands/createWorkItem.ts`
  - [x] 10.3 Register "azuredevops.configure" command with setup wizard from `src/ui/setupWizard.ts`
  - [x] 10.4 Add commands to context subscriptions: `context.subscriptions.push(disposable)`
  - [x] 10.5 Implement `deactivate()` function (can be empty for now)
  - [x] 10.6 Ensure package.json has activation events: `onCommand:azuredevops.createWorkItem`, `onCommand:azuredevops.configure`

- [x] 11.0 Testing and Documentation
  - [x] 11.1 Run all unit tests using `npx jest` and ensure 100% pass rate
  - [ ] 11.2 Create integration test that tests the full workflow end-to-end using `@vscode/test-electron`
  - [ ] 11.3 Manually test extension in Extension Development Host with real Azure DevOps organization
  - [ ] 11.4 Test single code selection from one file
  - [ ] 11.5 Test multiple selections from the same file
  - [ ] 11.6 Test multiple selections across different files
  - [ ] 11.7 Test first-time setup wizard flow
  - [ ] 11.8 Test re-authentication flow (force token expiration if possible)
  - [ ] 11.9 Test error scenarios: no selection, network error, invalid org/project
  - [x] 11.10 Create `README.md` with: feature overview, installation instructions, setup guide, usage examples with screenshots, troubleshooting section
  - [x] 11.11 Create `CHANGELOG.md` with initial v1.0.0 entry
  - [ ] 11.12 Add extension icon (create or download Azure DevOps-themed icon) and reference in package.json
  - [ ] 11.13 Package extension using `vsce package` and verify .vsix file
  - [ ] 11.14 Test installation from .vsix file in a fresh VSCode instance
