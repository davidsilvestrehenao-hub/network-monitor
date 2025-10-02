# Cursor AI Build Error Analysis Prompt

## Instructions for AI Agent

You are a senior software engineer tasked with partitioning ALL build errors from a TypeScript/Node.js project into 4 equal workload groups for parallel development work.

### Your Task

1. **Clear the build-errors subdirectory:**
   - Delete all existing files in `error-groups/build-errors/`
   - Create the build-errors group folder: `error-groups/build-errors/`

2. **Run the build command:**

   ```bash
   bun run build
   ```

   Copy the complete terminal output.

3. **Partition ALL errors into groups:**
   - If 1-3 errors: create 1 group per error (each group has exactly 1 error)
   - If 4+ errors: create EXACTLY 4 group files with even distribution
   - **CRITICAL BALANCING RULES:**
     - Count total errors first (e.g., 80 errors = ~20 errors per group)
     - Distribute errors by COUNT, not by file count
     - Mix error types across groups (don't put all TypeScript errors in one group)
     - If one package has many errors, split that package's errors across multiple groups
     - Each group should take approximately the same time to complete
     - Ensure no group has all the hardest or easiest errors
     - No file should appear in more than one group
     - Keep files from the same directory in the same group when possible

4. **For each group with errors, create a markdown file with this structure:**

```markdown
# Group [N]: Build Errors [N]

## Summary
- **Total Errors**: [COUNT]
- **Error Types**: [Brief list of types included]

## Error List

### File: [filename]
```text

[exact error message from terminal]

```text

### File: [filename]
```text

[exact error message from terminal]

```text

### File: [filename]
```text

[exact error message from terminal]

```text

## Notes
- [Any cross-group dependencies to be aware of]

## Cleanup
After completing all fixes in this group, delete this file: `error-groups/build-errors/group[N]-build-errors.md`

## Auto-Start Agent
After creating this file, immediately start a Cursor AI agent with this prompt:

```
# Fixing 1 Build Error with Progress Tracking

I need to fix all build errors in Group [N]. Please read the file `error-groups/build-errors/group[N]-build-errors.md` and systematically fix each error listed.

## Progress Tracking Requirements

**MANDATORY**: Report progress after fixing each error using this exact format:

```
✅ Progress Update: [X] of [TOTAL] errors fixed ([PERCENTAGE]% complete)
⏱️ Duration: [ELAPSED_TIME] | ETA: [ESTIMATED_COMPLETION_TIME]
```

**Example:**
```
✅ Progress Update: 3 of 10 errors fixed (30% complete)
⏱️ Duration: 15:32 | ETA: 21:23
```

**Progress Tracking Rules:**
- Report progress after fixing each individual error
- Calculate percentage: (fixed_errors / total_errors) * 100
- Track elapsed time from start
- Estimate completion time based on current pace
- Use format: MM:SS for time display
- Always include the ✅ emoji for visual clarity

Focus on completing all errors in this group. After finishing, delete the error group file as instructed.

Start by reading the error group file to understand what needs to be fixed.
```
```

### Requirements

1. **Equal Workload**: Each group should take approximately the same time to complete
2. **Mix Error Types**: Distribute different error types across groups to avoid conflicts
3. **Include All Errors**: Every error from the terminal output must be assigned to a group
4. **Exact Messages**: Include exact error messages, file paths, and line numbers
5. **No File Duplication**: No file should appear in more than one group
6. **Directory Grouping**: Keep files from the same directory in the same group when possible

### Output Files to Create

Create only the group files needed based on error count in the `error-groups/build-errors/` folder:
- 1 error: `error-groups/build-errors/group1-build-errors.md`
- 2 errors: `error-groups/build-errors/group1-build-errors.md`, `error-groups/build-errors/group2-build-errors.md`
- 3 errors: `error-groups/build-errors/group1-build-errors.md`, `error-groups/build-errors/group2-build-errors.md`, `error-groups/build-errors/group3-build-errors.md`
- 4+ errors: `error-groups/build-errors/group1-build-errors.md`, `error-groups/build-errors/group2-build-errors.md`, `error-groups/build-errors/group3-build-errors.md`, `error-groups/build-errors/group4-build-errors.md`

**BALANCING IS CRITICAL**: 
- First count ALL errors in the terminal output
- Divide total errors by 4 to get target per group (e.g., 80 errors = 20 per group)
- Distribute errors by COUNT, mixing error types across groups
- If one package has 80 errors, split those 80 errors across all 4 groups (~20 each)
- Don't put all errors from one package in a single group

**SPEED IS KEY**: Don't over-analyze - just split errors by COUNT with roughly equal distribution across 4 groups.

Now analyze the terminal output from `bun run build` and create only the necessary group files.
