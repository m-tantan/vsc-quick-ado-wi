# Configure Your Organization and Project

After signing in, you need to configure which Azure DevOps organization and project you want to work with.

## Configuration Steps

Click the **Configure Now** button below to start the configuration wizard.

### What Information You'll Need

1. **Organization Name**: Your Azure DevOps organization (e.g., `microsoft`, `WrecklessEngineer`)
   - This is the name that appears in your Azure DevOps URL
   - Example: For `https://dev.azure.com/microsoft/`, the organization is `microsoft`

2. **Project Name**: The specific project within your organization (e.g., `DefenderCommon`, `MyFirstProject`)

3. **Area Path** (Optional): If you have restricted permissions, you can specify an area path
   - Format: `ProjectName\Team\SubArea`
   - Leave blank to use the project root

## The Configuration Process

When you click **Configure Now**, the extension will:

1. **Fetch Your Organizations**: Display a list of all Azure DevOps organizations you have access to
2. **Select Organization**: Choose which organization to work with
3. **Fetch Projects**: Load all projects in that organization
4. **Select Project**: Choose your project
5. **Save Configuration**: Store these settings for future use

## After Configuration

Once configured:
- The extension remembers your organization and project
- You can create work items immediately
- You can reconfigure at any time using **"Configure Azure DevOps Settings"** command

## Checking Your Configuration

To view your current configuration:
- Run the **"Configure Azure DevOps Settings"** command
- Your current organization and project will be pre-selected

---

**Note**: You can change your organization and project at any time by running the configuration command again.
