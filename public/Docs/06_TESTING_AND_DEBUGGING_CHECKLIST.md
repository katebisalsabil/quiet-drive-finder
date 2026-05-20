# Testing and Debugging Checklist

## Test After Every Phase
Before committing, check:
- Does the app run with `npm run dev`?
- Does the browser page load?
- Are there red errors in the browser console?
- Does the feature from this phase work?
- Did you avoid changing unrelated files?

## Browser Console
Open browser developer tools:
- Right click page.
- Click Inspect.
- Click Console.

If there is an error, copy the exact error message and ask Codex/ChatGPT to explain it.

## Common Commands
Start app:

```bash
npm run dev
```

Stop app:

```text
Control + C
```

Install package:

```bash
npm install package-name
```

Check Git changes:

```bash
git status
```

## Before Pushing to GitHub
Make sure `.env` is not staged:

```bash
git status
```

If you see `.env`, stop and fix `.gitignore` before pushing.

## Good Debug Prompt
```text
I am a beginner. My app has this error: [paste error].
Please explain what it means in simple words.
Tell me exactly which file to check.
Fix only the necessary code and do not rewrite the whole project.
```
