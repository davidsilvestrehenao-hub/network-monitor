# Cursor AI Test Analysis Prompt

## Instructions for AI Agent

You are a **TEST ANALYSIS AGENT** - your ONLY job is to analyze test output and create partition files. You do NOT fix errors, you do NOT run additional commands, you do NOT investigate issues. You ONLY analyze and partition.

**CRITICAL: You are NOT a fixer agent. You are an analysis agent.**

### Your Task

1. **Clear the test-failures subdirectory:**
   - Delete all existing files in `error-groups/test-failures/`
   - Create the test-failures group folder: `error-groups/test-failures/`

2. **Run the test suite and analyze the output:**

   ```bash
   bun run test
   ```

   - Copy the COMPLETE terminal output exactly as it appears
   - Look for actual test failures, errors, and warnings in the output
   - Do NOT make assumptions about what failures exist
   - Only work with what is explicitly shown in the terminal output
   - **DO NOT ATTEMPT TO FIX ANY ERRORS**
   - **DO NOT RUN ADDITIONAL COMMANDS**
   - **DO NOT INVESTIGATE ISSUES**

3. **If there are test failures, partition them into groups:**
   - If 1-3 failures: create 1 group per failure (each group has exactly 1 failure)
   - If 4+ failures: create EXACTLY 4 group files with even distribution
   - **CRITICAL BALANCING RULES:**
     - Count total failures first (e.g., 80 failures = ~20 failures per group)
     - Distribute failures by COUNT, not by file count
     - Mix failure types across groups (don't put all test failures in one group)
     - If one package has many failures, split that package's failures across multiple groups
     - Each group should take approximately the same time to complete
     - Ensure no group has all the hardest or easiest failures
     - No file should appear in more than one group
     - Keep test files from the same directory in the same group when possible

4. **If there are NO test failures, create a success file:**
   - Create `error-groups/test-failures/all-tests-passing.md` with a success message
   - Do not create any group files

5. **For each group with failures, create a markdown file with this structure:**

```markdown
# Group [N]: Test Failures [N]

## Summary
- **Total Failures**: [COUNT]
- **Failure Types**: [Brief list of types included]

## Failure List

### File: [filename]
```text

[exact failure message from terminal]

```text

### File: [filename]
```text

[exact failure message from terminal]

```text

### File: [filename]
```text

[exact failure message from terminal]

```text

## Notes
- [Any cross-group dependencies to be aware of]

## Cleanup
After completing all fixes in this group, delete this file: `error-groups/test-failures/group[N]-test-errors.md`

## Auto-Start Agent
After creating this file, immediately start a Cursor AI agent with this prompt:

```
# Fixing 1 Test Error with Progress Tracking

I need to fix all test failures in Group [N]. Please read the file `error-groups/test-failures/group[N]-test-errors.md` and systematically fix each failure listed.

## Progress Tracking Requirements

**MANDATORY**: Report progress after fixing each failure using this exact format:

```
✅ Progress Update: [X] of [TOTAL] failures fixed ([PERCENTAGE]% complete)
⏱️ Duration: [ELAPSED_TIME] | ETA: [ESTIMATED_COMPLETION_TIME]
```

**Example:**
```
✅ Progress Update: 3 of 10 failures fixed (30% complete)
⏱️ Duration: 15:32 | ETA: 21:23
```

**Progress Tracking Rules:**
- Report progress after fixing each individual failure
- Calculate percentage: (fixed_failures / total_failures) * 100
- Track elapsed time from start
- Estimate completion time based on current pace
- Use format: MM:SS for time display
- Always include the ✅ emoji for visual clarity

Focus on completing all failures in this group. After finishing, delete the error group file as instructed.

Start by reading the error group file to understand what needs to be fixed.
```
```

### Requirements

1. **Work with Actual Output**: Only analyze what is explicitly shown in the `bun run test` terminal output
2. **No Assumptions**: Do not make assumptions about failures that aren't clearly visible
3. **Equal Workload**: Each group should take approximately the same time to complete
4. **Mix Failure Types**: Distribute different test failure types across groups to avoid conflicts
5. **Include All Failures**: Every test failure from the terminal output must be assigned to a group
6. **Exact Messages**: Include exact failure messages, file paths, and line numbers
7. **No File Duplication**: No file should appear in more than one group
8. **Directory Grouping**: Keep test files from the same directory in the same group when possible

### Output Files to Create

**If there are test failures:**
Create only the group files needed based on actual failure count in the `error-groups/test-failures/` folder:
- 1 failure: `error-groups/test-failures/group1-test-errors.md`
- 2 failures: `error-groups/test-failures/group1-test-errors.md`, `error-groups/test-failures/group2-test-errors.md`
- 3 failures: `error-groups/test-failures/group1-test-errors.md`, `error-groups/test-failures/group2-test-errors.md`, `error-groups/test-failures/group3-test-errors.md`
- 4+ failures: `error-groups/test-failures/group1-test-errors.md`, `error-groups/test-failures/group2-test-errors.md`, `error-groups/test-failures/group3-test-errors.md`, `error-groups/test-failures/group4-test-errors.md`

**If there are NO test failures:**
- Create: `error-groups/test-failures/all-tests-passing.md`

### Important Notes

- **ANALYSIS ONLY**: You are a test analysis agent, not a fixer agent
- **Stop after analysis**: Once you've created the appropriate files, stop. Do not run additional commands or make assumptions.
- **Use exact output**: Copy failure messages exactly as they appear in the terminal
- **Don't infer**: If the output doesn't show clear failures, don't assume they exist
- **NO FIXING**: Do not attempt to fix, investigate, or resolve any errors
- **NO ADDITIONAL COMMANDS**: Only run `bun run test` and create partition files

### What You Will Do:
1. Run `bun run test`
2. Copy the complete output
3. Identify actual test failures in the output
4. Create partition files based on the failures found
5. Stop

### What You Will NOT Do:
- Fix any errors
- Run additional commands
- Investigate issues
- Make assumptions about failures not shown
- Try to resolve build problems

**BALANCING IS CRITICAL**: 
- First count ALL failures in the terminal output
- Divide total failures by 4 to get target per group (e.g., 80 failures = 20 per group)
- Distribute failures by COUNT, mixing failure types across groups
- If one package has 80 failures, split those 80 failures across all 4 groups (~20 each)
- Don't put all failures from one package in a single group

**SPEED IS KEY**: Don't over-analyze - just split failures by COUNT with roughly equal distribution across 4 groups.

Now run `bun run test`, analyze the complete output, and create only the necessary files based on what you actually see.
