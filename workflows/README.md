# Workflow Development Guide

This folder contains all Gremlin demo workflows. Each workflow consists of two files that work together in the demo UI.

## Quick Start

1. Copy the template files:
   ```bash
   cp mm-fusion-cli.html my-workflow-cli.html
   cp mm-fusion-walkthrough.html my-workflow-walkthrough.html
   ```

2. Edit both files with your content

3. Register in `demo.html` (add to `WORKFLOWS` array around line 263):
   ```javascript
   {
       id: 'my-workflow',
       name: 'My Workflow Name',
       description: 'Brief description for tooltip',
       cli: 'workflows/my-workflow-cli.html',
       walkthrough: 'workflows/my-workflow-walkthrough.html'
   }
   ```

4. Test locally: `./open-demos.sh`

5. Deploy: `./deploy_demo.sh`

---

## File Naming Convention

```
{workflow-id}-cli.html         # Interactive terminal demo
{workflow-id}-walkthrough.html # Step-by-step guide
```

The `workflow-id` must:
- Be lowercase
- Use hyphens for spaces (e.g., `data-pipeline`, `model-training`)
- Match the `id` field in demo.html's WORKFLOWS array

---

## CLI Demo Structure

The CLI demo (`*-cli.html`) simulates an interactive terminal session. Here's the key structure:

### Scenario Array

The demo is driven by an array of user/AI exchanges:

```javascript
const endToEndScenario = [
    {
        user: "The text the user 'types' in the terminal",
        ai: {
            think: "What appears in the [LOG] line (e.g., 'Invoking DataTools.query()...')",
            response: `
                <div class="text-[#c9d1d9]">Your HTML response here</div>
            `
        }
    },
    // Add more steps...
];
```

### Available CSS Classes for Responses

| Class | Purpose |
|-------|---------|
| `text-green-400` | Success, confirmations, highlights |
| `text-purple-400` | Links, identifiers, job IDs |
| `text-yellow-400` | Warnings |
| `text-red-400` | Errors |
| `text-[#c9d1d9]` | Normal text |
| `text-[#8b949e]` | Muted/secondary text |
| `diff-add` | Green diff lines (additions) |
| `diff-remove` | Red diff lines (removals) |
| `diff-header` | Gray diff context |

### Table Template

```html
<table class="term-table">
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data</td>
            <td><span class="text-green-400">✅ Status</span></td>
        </tr>
    </tbody>
</table>
```

### Alert/Callout Template

```html
<div class="border-l-2 border-[#d29922] pl-4 py-1 bg-[#d29922]/10 mb-4">
    <div class="text-[#d29922] font-bold text-sm mb-1">⚠️ Warning Title</div>
    <div class="text-[#c9d1d9] text-sm">Warning message content.</div>
</div>
```

### Code Block Template

```html
<div class="bg-[#161b22] p-3 rounded border border-[#30363d] font-mono text-xs mb-4">
    <div class="diff-header">config:</div>
    <div class="diff-add">+  new_setting: true</div>
</div>
```

---

## Walkthrough Structure

The walkthrough (`*-walkthrough.html`) provides educational context. Key sections:

### Section Template

```html
<h2>1. Section Title</h2>
<span class="section-desc">Brief description of this step.</span>

<p><strong>Input</strong>:</p>
<blockquote>
    "The user's input from the CLI demo"
</blockquote>
<br>

<div class="markdown-alert markdown-alert-tip">
    <div class="markdown-alert-title">
        <!-- Lightbulb SVG icon -->
        Key Concepts
    </div>
    <ul>
        <li><strong>Concept 1</strong>: Explanation</li>
        <li><strong>Concept 2</strong>: Explanation</li>
    </ul>
</div>
```

### Alert Types

**Tip (Green)** - For best practices and key concepts:
```html
<div class="markdown-alert markdown-alert-tip">
    <div class="markdown-alert-title">Key Concepts</div>
    <ul>...</ul>
</div>
```

**Important (Purple)** - For critical insights or warnings:
```html
<div class="markdown-alert markdown-alert-important">
    <div class="markdown-alert-title">Important Insight</div>
    <p>...</p>
</div>
```

---

## Workflow Ideas

Here are some potential workflows you could create:

| ID | Name | Description |
|----|------|-------------|
| `data-ingestion` | Data Ingestion Pipeline | Uploading and validating new datasets |
| `feature-eng` | Feature Engineering | Creating and registering new features |
| `model-comparison` | Model Comparison | Comparing multiple model architectures |
| `batch-inference` | Batch Inference | Running predictions on large datasets |
| `monitoring` | Model Monitoring | Setting up drift detection and alerts |

---

## Testing Tips

1. **Local testing**: Always run `./open-demos.sh` before deploying
2. **Check both panels**: Ensure CLI and walkthrough content align
3. **Test tab completion**: Press TAB in the CLI to auto-complete
4. **Test all steps**: Press ENTER through every scenario step
5. **Mobile check**: Resize browser to test responsive behavior

---

## Troubleshooting

**Demo not loading?**
- Check file names match exactly (case-sensitive)
- Verify the workflow is registered in `demo.html`
- Check browser console for errors

**Styling looks wrong?**
- CLI demo uses Tailwind CSS via CDN
- Walkthrough uses custom CSS (no framework)
- Don't mix styles between the two

**Deploy failing?**
- Ensure both `-cli.html` and `-walkthrough.html` exist for each workflow
- Check `deploy_demo.sh` has execute permissions (`chmod +x deploy_demo.sh`)
