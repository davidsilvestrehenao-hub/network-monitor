# Cursor IDE Configuration

This directory contains Cursor IDE-specific configuration files.

## Files

### `ci-workflow.md`
Complete guide to the CI/CD workflow and pull request process. This is the authoritative guide for how to work with this repository.

### `mcp-config.json` (gitignored)
Model Context Protocol (MCP) server configuration for Cursor AI integration.

**Setup Instructions:**
1. Copy `mcp-config.example.json` to `mcp-config.json`
2. Get your GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `repo` scope
3. Replace `your-github-token-here` with your actual token
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
