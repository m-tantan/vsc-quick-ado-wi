# Azure DevOps Work Item Creator

Create Azure DevOps work items directly from code selections in Visual Studio Code. Capture technical debt, bugs, and tasks as you encounter them in your codebase without leaving your editor.

## Features

- **Quick Work Item Creation**: Select code and create Azure DevOps tasks in seconds
- **Automatic Context Capture**: File paths, line numbers, and code snippets are automatically included
- **Git Integration**: Current branch name is added to work items automatically
- **Multi-Selection Support**: Create a single work item from multiple code selections across different files
- **Seamless Authentication**: Uses VS Code's built-in Azure DevOps authentication (no PATs required)
- **Reliable**: Automatic retry logic with exponential backoff for network resilience

## Installation

1. Install the extension from the VS Code Marketplace
2. Open VS Code and run the command "Configure Azure DevOps Settings" (or create your first work item to trigger setup)
3. Authenticate with Azure DevOps
4. Select your organization and project
5. You're ready to go!

## Usage

### Creating a Work Item

1. Select code in your editor (single or multiple selections)
2. Right-click and choose **"Create Azure DevOps Work Item"** (or use Command Palette: `Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Enter a title for the work item
4. (Optional) Add additional context/description
5. The work item is created and the URL is copied to your clipboard
6. Click "Open in browser" to view it in Azure DevOps

### Example

Selecting this code:

```typescript
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}
```

Creates a work item with description:

````
File: src/utils/helper.ts (Lines 45-52)
```typescript
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}
````

Branch: feature/refactor-calculations

```

### Commands

- **Create Azure DevOps Work Item** - Create a work item from selected code
- **Configure Azure DevOps Settings** - Change organization/project or re-authenticate

## Configuration

Settings are stored globally (across all workspaces). You can manually edit them in VS Code settings:

- `azureDevOps.organization` - Your Azure DevOps organization name
- `azureDevOps.project` - Your Azure DevOps project name
- `azureDevOps.defaultWorkItemType` - Default work item type (currently "Task")

## Requirements

- VS Code 1.75.0 or higher
- Azure DevOps account with access to at least one project

## Known Limitations (v1.0)

- Only creates Task work items (Bugs, User Stories, etc. not supported yet)
- Only sets Title and Description fields (no Area Path, Iteration, Tags, etc.)
- Single organization/project at a time
- No offline support

## Troubleshooting

### Authentication Issues

If you see authentication errors:
1. Run "Configure Azure DevOps Settings" command
2. This will trigger re-authentication
3. Make sure you have access to the selected organization/project

### Network Errors

The extension automatically retries failed requests up to 3 times. If you still see network errors:
- Check your internet connection
- Verify Azure DevOps is accessible from your network
- Check if your organization name is correct

### No Work Items Created

If work items aren't being created:
- Ensure you have "Create work items" permission in Azure DevOps
- Verify your organization and project names are correct in settings
- Check the VS Code Developer Tools (Help > Toggle Developer Tools) for error messages

## Privacy

This extension:
- Does NOT store your authentication tokens (uses VS Code's secure authentication)
- Does NOT collect telemetry or usage data
- Only communicates with Azure DevOps APIs

## Support

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/yomanor/azure-devops-workitem-creator).

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

## License

MIT License - see LICENSE file for details
```
