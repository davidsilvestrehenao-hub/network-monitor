# Task Management with GitHub Issues

This project uses **GitHub Issues** for task management, integrated with Cursor AI via MCP (Model Context Protocol).

## 🎯 Quick Links

- **All Issues**: https://github.com/davidsilvestrehenao-hub/network-monitor/issues
- **Open Tasks**: https://github.com/davidsilvestrehenao-hub/network-monitor/issues?q=is%3Aissue+is%3Aopen+label%3Atask
- **Bugs**: https://github.com/davidsilvestrehenao-hub/network-monitor/issues?q=is%3Aissue+is%3Aopen+label%3Abug
- **Features**: https://github.com/davidsilvestrehenao-hub/network-monitor/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement

## 📋 Available Labels

| Label | Description | Color |
|-------|-------------|-------|
| `enhancement` | New feature or request | ![#a2eeef](https://via.placeholder.com/15/a2eeef/000000?text=+) |
| `bug` | Something isn't working | ![#d73a4a](https://via.placeholder.com/15/d73a4a/000000?text=+) |
| `task` | General development task | ![#0e8a16](https://via.placeholder.com/15/0e8a16/000000?text=+) |
| `documentation` | Documentation improvements | ![#0075ca](https://via.placeholder.com/15/0075ca/000000?text=+) |
| `frontend` | Frontend/UI related | ![#f9d0c4](https://via.placeholder.com/15/f9d0c4/000000?text=+) |
| `backend` | Backend/API related | ![#c5def5](https://via.placeholder.com/15/c5def5/000000?text=+) |
| `storybook` | Storybook related tasks | ![#ff69b4](https://via.placeholder.com/15/ff69b4/000000?text=+) |

## 🤖 Using with Cursor AI + MCP

### Create Issues from Chat

```
"Create a GitHub issue: Implement user authentication with OAuth"
"Add issue: Bug in chart rendering on mobile. Labels: bug, frontend"
"Create task: Refactor MonitorService to use dependency injection"
```

### Query Issues

```
"Show me all open issues"
"List all bugs assigned to me"
"What are the high priority frontend tasks?"
"Show issues with label storybook"
```

### Update Issues

```
"Close issue #5"
"Add comment to issue #3: Completed configuration setup"
"Update issue #2 title to: Complete Storybook setup with testing"
```

## 📝 Issue Templates

When creating issues via GitHub UI, use these templates:

- **Feature Request** - For new features
- **Bug Report** - For bugs
- **Task** - For general development tasks

## 🚀 CLI Commands

### View Issues
```bash
gh issue list                          # List all open issues
gh issue list --label bug              # List only bugs
gh issue list --label storybook        # List Storybook tasks
gh issue view 5                        # View issue #5
```

### Create Issues
```bash
gh issue create                        # Interactive creation
gh issue create --title "Title" --body "Description" --label "task,frontend"
```

### Update Issues
```bash
gh issue close 5                       # Close issue #5
gh issue reopen 5                      # Reopen issue #5
gh issue comment 5 --body "Comment"    # Add comment
```

## 📊 Current Active Epics

### Storybook Implementation (Issues #2-6)

- **Issue #2**: Set up Storybook configuration for SolidJS components
- **Issue #3**: Create Storybook configuration files
- **Issue #4**: Set up Vitest integration for Storybook
- **Issue #5**: Create example stories for existing components
- **Issue #6**: Write component library documentation using MDX

### PLG Stack Implementation (Issues #7-15)

**Epic #7**: Implement PLG Stack (Prometheus, Loki, Grafana) for Observability

**Implementation Tasks**:
- **Issue #8**: PLG Stack Architecture Planning and Docker Setup
- **Issue #9**: Set up Prometheus for Metrics Collection
- **Issue #10**: Set up Loki and Promtail for Log Aggregation
- **Issue #11**: Set up Grafana with Prometheus and Loki Data Sources
- **Issue #12**: Integrate Application Services with Prometheus and Loki
- **Issue #13**: Create Grafana Dashboards for Network Monitor
- **Issue #14**: Configure Prometheus Alerting and Grafana Alerts
- **Issue #15**: Document PLG Stack Setup and Operations

View the complete implementation plan: [docs/PLG-STACK-IMPLEMENTATION.md](docs/PLG-STACK-IMPLEMENTATION.md)

## 💡 Best Practices

1. **Always use labels** - Makes filtering and organization easier
2. **Link related issues** - Use "Related to #X" or "Depends on #Y"
3. **Use checkboxes** - For tracking progress within an issue
4. **Close when done** - Keep the issue list clean
5. **Add context** - Include screenshots, code snippets, or links

## 🔄 Workflow

1. **Create Issue** - Via AI chat, CLI, or GitHub UI
2. **Assign & Label** - Categorize the issue
3. **Work on Task** - Implement the feature/fix
4. **Create PR** - Link to the issue using "Fixes #X"
5. **Close** - Issue closes automatically when PR merges

## 📈 Staying Under Limits

GitHub Issues are **FREE** with:
- ✅ Unlimited issues
- ✅ Unlimited labels
- ✅ Unlimited comments
- ✅ Full search functionality
- ✅ API access
- ✅ Projects/Kanban boards

No need to worry about hitting any limits! 🎉

## 🔗 Resources

- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [MCP GitHub Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)

