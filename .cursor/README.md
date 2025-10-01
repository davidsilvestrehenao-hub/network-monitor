# Cursor IDE Configuration

This directory contains Cursor IDE-specific configuration files.

## Files

### `ci-workflow.md`
Complete guide to the CI/CD workflow and pull request process. This is the authoritative guide for how to work with this repository.

### `mcp-config.json` (gitignored)
Model Context Protocol (MCP) server configuration for Cursor AI integration.

**Setup Instructions:**
1. The `mcp-config.json` is already configured to use environment variables
2. Set your GitHub Personal Access Token in your `.env` file:
   ```bash
   echo "GITHUB_PERSONAL_ACCESS_TOKEN=$(gh auth token)" >> .env
   ```
3. Or manually add to `.env`:
   ```
   GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token-here
   ```
4. Restart Cursor to load the configuration

**Note:** This file is gitignored to keep your token secure.

### `mcp-config.example.json`
Example MCP configuration template. Copy this to create your own `mcp-config.json`.

## MCP Integration

The MCP (Model Context Protocol) allows Cursor AI to interact with GitHub Issues:

- Create issues from chat
- Query and search issues
- Update issue status
- Add comments to issues

See `/TASK-MANAGEMENT.md` for complete usage guide.
