# Product Requirements Document: Azure DevOps Work Item Creator Extension

## Introduction/Overview

The Azure DevOps Work Item Creator is a VSCode extension that streamlines the workflow of creating Azure DevOps work items directly from code. Developers can select code snippets within their editor and instantly create tracked work items without leaving their development environment. This eliminates context switching between VSCode and the Azure DevOps web interface, allowing developers to capture technical debt, bugs, and tasks as they encounter them in the codebase.

**Problem Statement:** Developers frequently identify issues, technical debt, or required tasks while reviewing code, but the friction of switching to a browser, navigating to Azure DevOps, and manually creating work items often leads to these items being forgotten or delayed.

**Solution:** A lightweight VSCode extension that creates Azure DevOps work items from selected code with minimal clicks, preserving context through automatic code snippet capture and file location tracking.

## Goals

1. Enable developers to create Azure DevOps work items directly from VSCode in under 10 seconds
2. Automatically capture relevant code context (snippets, file paths, line numbers, git branch) to reduce manual data entry
3. Provide a frictionless authentication experience using VSCode's built-in Azure DevOps authentication
4. Support both individual developers and team-based workflows with a single organization/project configuration
5. Deliver a minimal, opinionated v1 that focuses on the core workflow without feature bloat
6. Ensure reliable work item creation with automatic retry logic and clear error handling

## User Stories

### Story 1: Quick Task Creation from Code Review

**As a** developer reviewing a pull request  
**I want to** select a problematic code section and create a task work item with one command  
**So that** I can track the issue without leaving VSCode or losing my review context

**Acceptance Criteria:**

- Can select code and create work item via right-click menu or command palette
- Work item is created in under 10 seconds with minimal input (title only)
- Code snippet with file path and line numbers is automatically included in description

### Story 2: Capturing Multiple Code Locations

**As a** developer identifying a cross-cutting concern  
**I want to** select multiple code snippets from different files and create a single work item  
**So that** I can document all related locations in one tracked item

**Acceptance Criteria:**

- Can make multiple selections across different files
- Each snippet includes a header showing file path and line range
- Snippets are concatenated in the work item description with clear separation

### Story 3: First-Time Setup

**As a** developer installing the extension for the first time  
**I want to** be guided through authentication and configuration setup  
**So that** I can start creating work items without reading documentation

**Acceptance Criteria:**

- Welcome walkthrough appears on first activation
- Walkthrough guides through: Azure DevOps authentication, organization selection, project selection
- Settings are saved globally for all workspaces

### Story 4: Quick Access to Created Item

**As a** developer who just created a work item  
**I want to** immediately open the item in my browser to add more details  
**So that** I can quickly enhance the item with additional information if needed

**Acceptance Criteria:**

- Success notification displays "Copied to clipboard" message
- Notification includes "Open in browser" button
- Work item URL is automatically copied to clipboard

### Story 5: Seamless Re-authentication

**As a** developer whose Azure DevOps session has expired  
**I want to** be automatically prompted to re-authenticate when I try to create a work item  
**So that** I don't encounter cryptic errors and know exactly what action to take

**Acceptance Criteria:**

- Authentication errors are detected automatically
- Re-authentication prompt displays with clear message: "Azure DevOps authentication expired - [Extension Name]"
- After successful re-auth, the work item creation continues automatically

## Functional Requirements

### FR-1: Extension Activation & Commands

1.1. The extension MUST register a command "Create Work Item from Selection" accessible via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)  
1.2. The extension MUST add a context menu item "Create Azure DevOps Work Item" when text is selected in the editor  
1.3. Both activation methods MUST trigger the same work item creation workflow

### FR-2: First-Time Setup Wizard

2.1. The extension MUST display a welcome walkthrough on first activation (when no configuration exists)  
2.2. The walkthrough MUST include three steps:

- Step 1: Azure DevOps authentication using VSCode's built-in auth provider
- Step 2: Organization selection (dropdown populated from user's available organizations)
- Step 3: Project selection (dropdown populated from selected organization's projects)  
  2.3. The wizard MUST save the selected organization and project to user settings (global)  
  2.4. The wizard MUST be accessible later via a command "Configure Azure DevOps Settings"

### FR-3: Configuration Management

3.1. The extension MUST store configuration in user settings (not workspace settings)  
3.2. The extension MUST store the following settings:

- `azureDevOps.organization`: The ADO organization name
- `azureDevOps.project`: The ADO project name
- `azureDevOps.defaultWorkItemType`: Default is "Task"  
  3.3. Settings MUST be editable manually via VSCode settings UI or settings.json

### FR-4: Code Selection Capture

4.1. The extension MUST capture the exact text of the selected code when the command is invoked  
4.2. For single selections, the extension MUST capture:

- File path (relative to workspace root)
- Start and end line numbers
- Full selected text  
  4.3. For multiple selections (non-contiguous), the extension MUST capture each selection separately with its own file path and line range  
  4.4. If no text is selected when command is invoked, the extension MUST show an error: "Please select code before creating a work item"

### FR-5: Code Snippet Formatting

5.1. The extension MUST format code snippets in the work item description using Markdown code fences  
5.2. The extension MUST infer the language identifier from the file extension:

- `.ts` → `typescript`
- `.js` → `javascript`
- `.py` → `python`
- `.cs` → `csharp`
- `.java` → `java`
- `.cpp`, `.cc`, `.cxx` → `cpp`
- `.c`, `.h` → `c`
- (etc., comprehensive list)  
  5.3. For unknown file types, the extension MUST use generic code fence without language: ` ``` `  
  5.4. Each code snippet MUST include a header line in the format:  
   `File: path/to/file.ext (Lines X-Y)`  
  5.5. The complete format MUST be:

````
File: src/utils/helper.ts (Lines 45-52)
```typescript
[selected code here]
````

```

### FR-6: Git Context Integration
6.1. The extension MUST attempt to retrieve the current git branch name using VSCode's git API
6.2. If a git branch is available, the extension MUST append it to the work item description in the format:
`Branch: feature/branch-name`
6.3. If no git repository is detected or branch retrieval fails, the extension MUST silently skip this section (no error shown)

### FR-7: Multiple Selection Handling
7.1. The extension MUST support unlimited multiple selections (no maximum limit)
7.2. When multiple selections exist, the extension MUST concatenate them in the work item description
7.3. Each selection MUST be separated by a blank line
7.4. Each selection MUST include its own header with file path and line range
7.5. Example format for multiple selections:
```

File: src/components/Header.tsx (Lines 12-18)

```tsx
[code snippet 1]
```

File: src/utils/validation.ts (Lines 89-95)

```typescript
[code snippet 2]
```

```

### FR-8: Work Item Title Input
8.1. The extension MUST prompt the user for a work item title using a VSCode input box
8.2. The input box prompt MUST say: "Enter work item title"
8.3. The title field MUST be required (cannot be empty)
8.4. If the user cancels the input dialog, the work item creation MUST be cancelled (no error message needed)

### FR-9: Work Item Description (Optional Context)
9.1. The extension MUST prompt the user for an optional description using a VSCode input box
9.2. The input box prompt MUST say: "Add additional context (optional, press Enter to skip)"
9.3. The description field MUST be optional (can be empty)
9.4. If provided, the user's description MUST be placed at the top of the work item description, followed by the code snippets

### FR-10: Azure DevOps Authentication
10.1. The extension MUST use VSCode's built-in authentication provider (`vscode.authentication.getSession`)
10.2. The authentication MUST use the provider ID: `microsoft` with scopes: `499b84ac-1321-427f-aa17-267ca6975798/.default` (Azure DevOps)
10.3. The extension MUST NOT require or store Personal Access Tokens (PATs)
10.4. If authentication fails or the session is invalid, the extension MUST automatically trigger re-authentication
10.5. Re-authentication prompts MUST include a clear title: "Azure DevOps Work Item Creator - Authentication Required"

### FR-11: Work Item Creation API Call
11.1. The extension MUST create work items using the Azure DevOps REST API v7.0 or higher
11.2. The API endpoint MUST be: `https://dev.azure.com/{organization}/{project}/_apis/wit/workitems/$Task?api-version=7.0`
11.3. The extension MUST use HTTP PATCH method with `Content-Type: application/json-patch+json`
11.4. The extension MUST set only the following fields:
- `/fields/System.Title`: The user-provided title
- `/fields/System.Description`: The formatted description (user context + code snippets + git branch)
11.5. The work item type MUST be "Task" (hardcoded for v1)

### FR-12: Retry Logic with Exponential Backoff
12.1. The extension MUST retry failed work item creation up to 3 times
12.2. The extension MUST use exponential backoff with the following delays:
- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay
12.3. Retries MUST be silent (no progress notification shown to user)
12.4. Retries MUST only occur for transient errors (network issues, 5xx server errors)
12.5. Retries MUST NOT occur for authentication errors (401, 403) or client errors (400, 404)
12.6. If all retries fail, the extension MUST show an error notification with the failure reason

### FR-13: Success Notification and Clipboard
13.1. On successful work item creation, the extension MUST show a VSCode information notification
13.2. The notification message MUST be: "Copied to clipboard"
13.3. The notification MUST include a button labeled "Open in browser"
13.4. The extension MUST automatically copy the work item URL to the system clipboard
13.5. The work item URL format MUST be: `https://dev.azure.com/{organization}/{project}/_workitems/edit/{id}`
13.6. Clicking "Open in browser" MUST open the URL in the user's default browser

### FR-14: Error Handling
14.1. For authentication errors, the extension MUST trigger re-authentication (see FR-10.4)
14.2. For API errors after all retries fail, the extension MUST show an error notification: "Failed to create work item: {error message}"
14.3. For configuration errors (missing org/project), the extension MUST show an error and prompt to run the setup wizard
14.4. For network errors, the extension MUST show: "Network error: Unable to reach Azure DevOps"
14.5. All error notifications MUST be dismissible and non-blocking

## Non-Goals (Out of Scope for v1)

1. **AI-Generated Titles:** No LLM integration for auto-generating work item titles (deferred to future version)
2. **Multiple Work Item Types:** No support for creating Bugs, User Stories, or Epics (Task only in v1)
3. **Custom Field Support:** No support for setting Area Path, Iteration, Assigned To, Tags, or custom fields
4. **Linking to Existing Items:** No support for parent/child links or related work item links
5. **Multi-Organization Support:** No support for switching between multiple organizations without reconfiguration
6. **Workspace-Specific Settings:** No support for per-workspace or multi-root workspace configurations
7. **Offline Mode:** No support for queuing work items when offline
8. **Edit Existing Work Items:** No support for updating work items after creation
9. **Batch Creation:** No support for creating multiple work items from a single action
10. **Work Item Templates:** No predefined templates for common scenarios
11. **Telemetry/Analytics:** No built-in usage tracking or success metrics (collecting personal feedback only)
12. **Configuration Migration:** No migration path from workspace settings to user settings

## Design Considerations

### User Interface
- **Minimal UI:** The extension will use native VSCode UI components only (input boxes, notifications, quick picks)
- **No Custom Webviews:** Avoid complexity of custom webview panels for v1
- **Context Menu Placement:** The "Create Azure DevOps Work Item" menu item should appear in the editor context menu under a logical section (ideally near "Copy" or other text operations)

### User Experience Flow
1. User selects code in editor
2. User right-clicks and selects "Create Azure DevOps Work Item" OR opens Command Palette and runs command
3. (If first time) Welcome wizard appears → Authenticate → Select Org → Select Project
4. Input box prompts for title (required)
5. Input box prompts for additional context (optional)
6. Extension creates work item (with silent retries if needed)
7. Success notification appears with "Open in browser" button
8. URL is copied to clipboard automatically

### Code Snippet Example in ADO
For a user who selects lines 45-52 in `src/utils/helper.ts` and lines 10-15 in `src/components/Button.tsx` with optional context "Need to refactor this logic":

**Work Item Description:**
```

Need to refactor this logic

File: src/utils/helper.ts (Lines 45-52)

```typescript
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}
```

File: src/components/Button.tsx (Lines 10-15)

```tsx
const handleClick = () => {
  const total = calculateTotal(cartItems);
  console.log("Total:", total);
};
```

Branch: feature/refactor-calculations

````

## Technical Considerations

### Dependencies
- **VSCode Extension API:** Minimum version 1.75.0 (for authentication API stability)
- **Azure DevOps REST API:** v7.0 or higher
- **Authentication:** VSCode's built-in `microsoft` authentication provider with Azure DevOps scope

### Extension Architecture Suggestions
- Use VSCode's `ExtensionContext` to store and retrieve global state for first-time setup detection
- Leverage VSCode's `git` extension API (`vscode.extensions.getExtension('vscode.git')`) for branch name retrieval
- Use `vscode.env.clipboard.writeText()` for clipboard operations
- Use `vscode.env.openExternal()` for opening URLs in browser

### API Integration
- **Authentication Token:** Obtained via `vscode.authentication.getSession('microsoft', scopes, { createIfNone: true })`
- **HTTP Client:** Use Node.js `https` module or `node-fetch` for API calls
- **Error Handling:** Parse Azure DevOps API error responses which follow the format:
  ```json
  {
    "errorCode": "...",
    "message": "..."
  }
````

### Language Mapping (File Extension → Markdown Language)

The extension should maintain a comprehensive map:

```typescript
const languageMap = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  py: "python",
  java: "java",
  cs: "csharp",
  cpp: "cpp",
  c: "c",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  scala: "scala",
  sh: "bash",
  ps1: "powershell",
  sql: "sql",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  // Add more as needed
};
```

### Security Considerations

- Never log or store authentication tokens in plain text
- Use VSCode's secure credential storage APIs
- Validate all user input before sending to Azure DevOps API
- Sanitize file paths to prevent potential path traversal issues

## Success Metrics

Per user feedback, success will be measured through **personal feedback collection** rather than automated metrics. The developer will gather qualitative feedback on:

- Ease of use and setup experience
- Time savings compared to manual ADO web workflow
- Usefulness of automatic code context capture
- Areas for improvement in future versions

## Open Questions

1. **Extension Name:** What should the extension be named in the VSCode marketplace? Suggestions:

   - "Azure DevOps Work Item Creator"
   - "Code to ADO"
   - "ADO Quick Capture"

2. **Extension Icon:** What icon/branding should be used? Should it incorporate Azure DevOps blue color scheme?

3. **Publishing:** Should this be published under a personal publisher or organizational publisher on the VSCode marketplace?

4. **Minimum VSCode Version:** Is targeting VSCode 1.75.0 (February 2023) acceptable, or should we target a more recent version for better API support?

5. **Error Message Verbosity:** Should technical error details from Azure DevOps API be shown to users, or simplified into user-friendly messages?

6. **Extension Category:** Should this be categorized as "Azure" or "Other" in the VSCode marketplace?

7. **License:** What license should be used if open-sourcing? (MIT, Apache 2.0, etc.)

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation  
**Target Audience:** Junior to Mid-level Developers
