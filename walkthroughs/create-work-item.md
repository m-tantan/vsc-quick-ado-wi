# Create a Work Item from Code

This extension creates work items **from your current editor selection**.

**Important**: Walkthrough steps can’t guarantee you have an active editor open (or that anything is selected), so the “Create Work Item” command won’t do anything useful until you:
1) have a file open in the editor, and
2) select at least one line of code.

## 1) Open a file (so you have an active editor)

- Open an existing file in your workspace **or** create a new one:
  - [Open a new untitled file](command:workbench.action.files.newUntitledFile)

## 2) Paste or find some code, then select it

If you created a new file, paste a small snippet like this and highlight a few lines:

```ts
function add(a: number, b: number) {
  return a + b;
}
```

## 3) Create the work item (two equivalent ways)

### Option A — Command Palette (keyboard-first)

1. Open the Command Palette: `Ctrl+Shift+P`
2. Run: **Create Azure DevOps Work Item**

### Option B — Right-click Context Menu (mouse-first)

1. Right-click your selected code
2. Choose: **Create Azure DevOps Work Item**

## 4) Complete the prompts

You’ll be asked for:
- **Title** (required)
- **Context/description** (optional)

After creation:
- The work item URL is copied to your clipboard
- You’ll see a notification with quick actions (open the work item / open the parent)

---

**Tip**: You can make multiple selections (even across files) and the extension will include them all in one work item.