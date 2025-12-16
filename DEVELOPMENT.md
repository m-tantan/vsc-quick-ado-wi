# Azure DevOps Work Item Creator - Development Notes

## Project Structure

```
code-to-workitem-extension/
├── src/
│   ├── auth/
│   │   └── authProvider.ts          # Azure DevOps authentication
│   ├── commands/
│   │   └── createWorkItem.ts        # Main command handler
│   ├── config/
│   │   └── settings.ts              # Configuration management
│   ├── services/
│   │   ├── adoClient.ts             # Azure DevOps API client
│   │   ├── codeCapture.ts           # Code selection capture
│   │   └── gitContext.ts            # Git branch integration
│   ├── ui/
│   │   ├── notifications.ts         # Success/error notifications
│   │   ├── prompts.ts               # User input prompts
│   │   └── setupWizard.ts           # First-time setup
│   ├── utils/
│   │   └── languageMap.ts           # File extension mapping
│   └── extension.ts                 # Extension entry point
├── dist/                             # Compiled JavaScript
├── .vscode/
│   └── launch.json                  # Debug configuration
├── package.json                     # Extension manifest
├── tsconfig.json                    # TypeScript config
├── jest.config.js                   # Test configuration
└── README.md                        # Documentation
```

## Building and Testing

### Compile
```bash
npm run compile
```

### Watch Mode (for development)
```bash
npm run watch
```

### Run Tests
```bash
npm test
```

### Debug
Press F5 in VS Code to launch the Extension Development Host

### Package
```bash
npm install -g vsce
npm run package
```

## Development Workflow

1. Make code changes in `src/`
2. Compile with `npm run compile`
3. Press F5 to test in Extension Development Host
4. Test the extension functionality
5. Run unit tests with `npm test`

## Architecture Notes

### Authentication Flow
- Uses VS Code's `vscode.authentication.getSession('microsoft')` API
- Scope: `499b84ac-1321-427f-aa17-267ca6975798/.default` (Azure DevOps)
- Session is cached to avoid repeated prompts
- Automatic re-authentication on 401/403 errors

### Work Item Creation Flow
1. Check if setup is needed → Run wizard if needed
2. Capture code selections from active editor
3. Prompt user for title (required) and description (optional)
4. Get git branch name (if available)
5. Format code snippets as markdown
6. Get authentication token
7. Call Azure DevOps API with retry logic
8. Show success notification and copy URL to clipboard

### Error Handling
- **No selection**: Show error immediately
- **Authentication errors (401/403)**: Trigger re-authentication automatically
- **Network errors**: Retry with exponential backoff (1s, 2s, 4s)
- **Server errors (5xx)**: Retry with exponential backoff
- **Client errors (400, 404)**: Don't retry, show error
- **Configuration missing**: Prompt to run setup wizard

### API Integration
- Endpoint: `https://dev.azure.com/{org}/{project}/_apis/wit/workitems/$Task?api-version=7.0`
- Method: PATCH
- Content-Type: `application/json-patch+json`
- Body: JSON Patch operations for Title and Description fields

## Future Enhancements

### Short-term (v1.1)
- Unit test coverage for all modules
- Integration tests
- Extension icon
- Marketplace listing with screenshots

### Medium-term (v2.0)
- Support for Bug, User Story, Epic work item types
- Custom field support (Area Path, Iteration, Tags)
- Work item templates

### Long-term (v3.0)
- AI-powered title generation using VSCode LLM API
- Link to existing work items
- Multi-organization support
- Offline queue for work items

## Testing Checklist

- [ ] Single selection from one file
- [ ] Multiple selections from same file
- [ ] Multiple selections across different files
- [ ] First-time setup wizard
- [ ] Re-authentication flow
- [ ] Configuration via settings
- [ ] Git branch capture
- [ ] No git repository scenario
- [ ] Network error handling
- [ ] Authentication error handling
- [ ] Context menu functionality
- [ ] Command palette functionality
- [ ] Success notification and clipboard
- [ ] Open in browser button
