# Create a Work Item Using the Command Palette

Now that you're signed in and configured, let's create your first work item!

## Steps to Create a Work Item

### 1. Select Code in Your Editor

Open any file in VS Code and **select some code** that you want to create a work item for.

For example:
- A function that needs refactoring
- A code section with a bug
- Technical debt you want to track

### 2. Open the Command Palette

Press **`Ctrl+Shift+P`** (Windows/Linux) or **`Cmd+Shift+P`** (Mac) to open the Command Palette.

### 3. Run the Create Work Item Command

Type **"Create Azure DevOps Work Item"** and press Enter.

Alternatively, you can search for **"ADO"** or **"work item"** to find the command quickly.

### 4. Enter a Title

You'll be prompted to enter a **title** for your work item. This should be a brief, descriptive summary.

Example: `Refactor calculateTotal to handle null items`

### 5. Add Context (Optional)

Next, you'll be asked for **additional context or description**. This is optional but recommended.

Example: `Need to add null checking and improve error handling`

Press Enter to continue (or leave blank to skip).

### 6. Work Item Created! 🎉

The work item will be created in Azure DevOps with:
- ✅ Your title and description
- ✅ The selected code snippet with file path and line numbers
- ✅ Current git branch name (if available)
- ✅ Automatic link to a parent deliverable for tracking

The URL is automatically **copied to your clipboard**, and you'll see a notification with options to:
- **Open Work Item** - View in Azure DevOps
- **Open Parent** - View the parent deliverable

---

**Pro Tip**: You can select code from multiple locations (even across different files) and they'll all be included in a single work item!
