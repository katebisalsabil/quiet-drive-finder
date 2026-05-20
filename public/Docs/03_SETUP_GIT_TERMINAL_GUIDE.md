# Setup, Git, and Terminal Guide

## Terminal Basics
The terminal is where you type commands.

Common commands:

```bash
pwd
```
Shows your current folder.

```bash
ls
```
Shows files in the current folder.

```bash
cd folder-name
```
Moves into a folder.

```bash
cd ..
```
Moves back one folder.

## Create the React App
Run this in the folder where you want the project saved:

```bash
npm create vite@latest quiet-drive-finder
```

Choose:
- React
- JavaScript

Then:

```bash
cd quiet-drive-finder
npm install
npm run dev
```

Open the local link shown in terminal, usually:

```text
http://localhost:5173
```

## Open Project in VS Code
From inside the project folder:

```bash
code .
```

If `code .` does not work, open VS Code manually and choose File > Open Folder.

## First Git Setup
Only do this once on your computer:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Check Git:

```bash
git --version
```

## Start Git in the Project
Inside the project folder:

```bash
git init
git add .
git commit -m "Initial project setup"
```

## Create GitHub Repository
On GitHub:
1. Create a new repository.
2. Name it `quiet-drive-finder`.
3. Do not add README if your local project already has files.
4. Copy the repository URL.

## Connect Local Project to GitHub
Replace `YOUR-USERNAME` with your GitHub username:

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/quiet-drive-finder.git
git push -u origin main
```

## Daily Save Routine
Whenever a phase or feature works:

```bash
git status
git add .
git commit -m "Short description of what changed"
git push
```

## If Something Breaks
First check:

```bash
git status
```

Do not panic. Ask Codex or ChatGPT:

```text
My React app broke after the last change. Here is the error message. Please explain it simply and help me fix it without changing unrelated files.
```
