# Change Log

All notable changes to the "Azure DevOps Work Item Creator" extension will be documented in this file.

## [1.0.0] - 2025-12-15

### Initial Release

#### Features
- Create Azure DevOps Task work items from code selections
- Automatic code snippet capture with syntax highlighting
- Support for multiple code selections (even across different files)
- Automatic file path and line number capture
- Git branch name integration
- VS Code built-in authentication (no PAT required)
- First-time setup wizard
- Exponential backoff retry logic (up to 3 attempts)
- Automatic clipboard copy of work item URL
- "Open in browser" quick action
- Context menu integration
- Command palette support

#### Supported Work Item Types
- Task (hardcoded for v1)

#### Supported Fields
- System.Title
- System.Description

#### Commands
- `azuredevops.createWorkItem` - Create work item from selection
- `azuredevops.configure` - Configure organization and project

#### Configuration
- `azureDevOps.organization` - Organization name
- `azureDevOps.project` - Project name
- `azureDevOps.defaultWorkItemType` - Default type (Task)

### Known Issues
- None currently tracked

### Future Enhancements
- Support for Bug, User Story, and Epic work item types
- AI-powered title generation using VS Code LLM API
- Custom field support (Area Path, Iteration, Assigned To, etc.)
- Multi-organization support
- Work item templates
- Linking to existing work items
