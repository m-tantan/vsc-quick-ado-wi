# Change Log

All notable changes to the "Azure DevOps Work Item Creator" extension will be documented in this file.

## [1.1.0] - 2025-12-28

### Added

- **Sign-In/Sign-Out Commands**: Explicit commands for authenticating with Azure DevOps
  - `Quick ADO WI: Sign In` - Manually sign in to Azure DevOps with your Microsoft account
  - `Quick ADO WI: Sign Out` - Clear cached authentication session
  - Displays account name and configuration after successful sign-in
  - Prompts for configuration setup if not already configured
  - Sign-out includes confirmation dialog to prevent accidental sign-outs

- **Interactive VS Code Walkthrough**: Complete 5-step onboarding experience
  - Welcome and feature introduction
  - Guided sign-in authentication process
  - Organization and project configuration
  - First work item creation tutorial
  - Next steps and resources
  - Accessible via **Help → Get Started → Walkthroughs** or first-time extension activation

- **Area Path Configuration in Setup Wizard**
  - Optionally configure Area Path during initial setup
  - Input validation (requires backslash separator, not forward slash)
  - Helpful placeholder text with example format
  - Displayed in setup success message confirmation
  - New `setAreaPath()` function in settings module

- **Sign-Out State Management**
  - Added `signedOut` flag to prevent auto re-authentication after explicit sign-out
  - `getAuthSession()` checks sign-out status before attempting authentication
  - Clear error messages when attempting actions while signed out
  - Offers direct "Sign In" button from error dialogs
  - New `isSignedOut()` function to check authentication state

### Fixed

- **Critical Sign-Out Bug**: Extension now properly prevents work item creation after sign-out
  - Previously, signing out would only clear the cache but immediately re-authenticate on next action
  - Now maintains signed-out state until explicit sign-in
  - Removed problematic error handling that prevented proper sign-out
  
- **Authentication State Bug**: Fixed auto-authentication occurring after explicit sign-out
  - `getAuthSession()` now throws clear error: "Not signed in. Please sign in to Azure DevOps first."
  - Prevents confusing silent re-authentication behavior
  
- **Create Work Item State Check**: Added sign-in status verification before creating work items
  - Shows user-friendly warning dialog when not signed in
  - Provides "Sign In" or "Cancel" options in the dialog
  - Prevents cryptic authentication errors during work item creation

### Changed

- **BREAKING**: Command namespace changed from `azuredevops.*` to `quickAdoWi.*`
  - `azuredevops.createWorkItem` → `quickAdoWi.createWorkItem`
  - `azuredevops.configure` → `quickAdoWi.configure`
  - `azuredevops.signIn` → `quickAdoWi.signIn` (new)
  - `azuredevops.signOut` → `quickAdoWi.signOut` (new)
  
- **BREAKING**: Configuration namespace changed from `azureDevOps.*` to `quickAdoWi.*`
  - `azureDevOps.organization` → `quickAdoWi.organization`
  - `azureDevOps.project` → `quickAdoWi.project`
  - `azureDevOps.defaultWorkItemType` → `quickAdoWi.defaultWorkItemType`
  - `azureDevOps.areaPath` → `quickAdoWi.areaPath`
  - **Migration Note**: Users upgrading from v1.0.x will need to reconfigure their settings
  
- **VS Code Engine**: Minimum version bumped from 1.75.0 to 1.107.0 (required for walkthrough API support)

- **Configuration Title**: Changed from "Azure DevOps WIC" to "Quick ADO Work Items"

### Security

- **Sanitized Error Logging**: Prevents exposure of sensitive authentication details in console logs
  - Auth commands now check `error instanceof Error` before logging
  - Generic messages shown for non-Error exceptions
  - Applied to both `signInCommand()` and `signOutCommand()`
  - User-friendly error messages avoid leaking auth tokens or session information

### Documentation

- Added comprehensive "Sign In / Sign Out" section to README
  - Detailed sign-in instructions and what happens during authentication
  - Sign-out procedure and implications
  - How to check sign-in status
  - How to fully remove access via VS Code Accounts menu
  
- Added 5 new screenshots for visual documentation:
  - Context menu work item creation
  - Command palette usage
  - Setup wizard interface
  - Setup wizard with filled inputs
  - Success notification with action buttons
  
- Created 5 walkthrough markdown files:
  - `walkthroughs/welcome.md`
  - `walkthroughs/sign-in.md`
  - `walkthroughs/configure.md`
  - `walkthroughs/create-work-item.md`
  - `walkthroughs/next-steps.md`
  
- Updated all command and configuration references to new `quickAdoWi` namespace
- Added walkthrough recommendation in Installation section
- Reorganized images into `images/` directory with descriptive names

### Metadata

- Added `repository` field to package.json with GitHub URL
- Added keywords: `snippet`, `quote` for improved marketplace discoverability
- Updated `.vscodeignore` to properly include `dist/` and `images/` in package

### Migration Guide for v1.0.x Users

After upgrading to v1.1.0:

1. **Reconfigure your settings** via the `Configure Azure DevOps Settings` command, OR
2. **Manually update** in VS Code settings (JSON):

   ```json
   {
     "quickAdoWi.organization": "your-org",
     "quickAdoWi.project": "your-project",
     "quickAdoWi.areaPath": "your-area-path"  // optional
   }
   ```

3. Old `azureDevOps.*` settings will no longer be read by the extension

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
