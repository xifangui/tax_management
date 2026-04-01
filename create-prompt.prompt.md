---
name: create-prompt
description: Create a reusable prompt file (.prompt.md) for a common task in this workspace.
argument-hint: Describe the task or workflow the new prompt should support.
agents: agent
scope: workspace
---
Related skill: `agent-customization`. Use workspace context and conversation history to build a `.prompt.md`.

## Goal
Help the user turn a repeatable task or workflow into a reusable prompt file that can be invoked again later.

## Steps
1. Review the current conversation and any relevant workspace files.
2. Identify the core repeatable task:
   - What is the task being performed repeatedly?
   - What inputs are implied (e.g. selected code, file type, project context)?
   - What output format or style does the user expect?
3. Determine the prompt shape:
   - Should it accept arguments or use fixed context?
   - Is it workspace-scoped or personal?
4. Draft the `.prompt.md` content with a clear name, description, instructions, and example usage.
5. If anything is ambiguous, ask the user one clarifying question.
6. Summarize the new prompt and suggest related prompt customizations.

## Output
- A `.prompt.md` draft for the user.
- A short explanation of what the prompt does and how to invoke it.
- One suggestion for a related prompt to add next.
