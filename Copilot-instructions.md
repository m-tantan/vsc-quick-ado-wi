# GitHub Copilot Instructions for vsc-quick-ado-wi

## Repository Intent

This repository contains a Visual Studio Code extension called **Azure DevOps Quick Work Items**. The extension lets users quickly create Azure DevOps work items (Tasks by default) directly from code selections in VS Code. It captures context like file path, line numbers, selected code, and current Git branch, then formats this into HTML for Azure DevOps work item descriptions.

Core goals:
- Minimize friction when capturing bugs, technical debt, and tasks while reading or writing code
- Automatically attach rich context (code snippets + branch + file/line info) to each work item
- Keep all "quick" work items organized under a single parent deliverable ("Quick WIs") for easy tracking
- Use secure, built-in VS Code authentication and settings storage (no PATs, no custom credential handling)

## How Copilot Should Help in This Repo

When assisting in this repository, Copilot should prioritize:

1. **User Experience & Reliability**
   - Keep workflows fast and low-friction for VS Code users.
   - Preserve or improve reliability around Azure DevOps API calls (retries, error handling, validation).
   - Avoid introducing breaking changes to existing commands or configuration.

2. **Consistency with Existing Patterns**
   - Follow the current TypeScript conventions, project structure, and VS Code extension APIs already used in `src/`.
   - Reuse existing helper functions and abstractions where possible instead of adding new dependencies.
   - Keep logging consistent with the `----- `-prefixed log style used for developer diagnostics.

3. **Security & Privacy**
   - Do not introduce telemetry, external calls, or data collection beyond Azure DevOps APIs required for work item creation.
   - Prefer using VS Code's built-in authentication and secret storage mechanisms.
   - Avoid logging sensitive information (access tokens, full URLs with tokens, or user-private data).

4. **Configurability Without Complexity**
   - Respect and extend existing configuration options exposed via VS Code settings (`azureDevOps.*`).
   - Prefer additive, backwards-compatible settings with sensible defaults.
   - Make any new behavior easy to discover via commands, README updates, or inline comments.

## Coding Style & Architecture Hints

- Language: TypeScript targeting VS Code extension development.
- Entry points and commands are defined under `src/` and wired via `package.json` contributions.
- Tests use Jest; new logic should be testable and, where practical, covered with unit tests.
- Keep functions small, focused, and composable; prefer pure functions where possible for formatting and transformation.

## Preferred Behaviors for Copilot

When generating code or changes:
- Prefer clarity over cleverness; explicit types and straightforward control flow.
- Include minimal but clear comments for non-obvious logic, especially around Azure DevOps API interactions and error handling.
- Suggest incremental improvements that align with the existing roadmap in `README.md` (e.g., more work item types, configurability) but avoid implementing large, invasive changes without explicit direction.

When generating documentation or examples:
- Use Azure DevOps URL formats and terminology consistent with the README.
- Provide realistic, copy-pasteable examples for settings and usage.

## Memory Bank Notes

High-level concepts for this repo:
- **Purpose**: VS Code extension to quickly create Azure DevOps work items from code selections.
- **Key features**: context capture (file/line/code), branch info, parent deliverable management ("Quick WIs"), retries, and caching.
- **Configuration**: `azureDevOps.organization`, `azureDevOps.project`, `azureDevOps.areaPath`, `azureDevOps.defaultWorkItemType`.
- **Tech stack**: TypeScript, VS Code extension API, Azure DevOps REST APIs, Jest for testing.

Copilot should use this context when proposing changes, tests, or documentation for this repository.