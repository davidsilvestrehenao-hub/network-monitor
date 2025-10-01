# Gemini Code Assist Commands

This project uses Gemini Code Assist for automated PR reviews.

## Available Commands

Use these commands in PR comments:

### `/gemini review`
Performs a code review for the current pull request in its current state.

```
/gemini review
```

### `/gemini summary`
Generates a summary of the pull request changes.

```
/gemini summary
```

### `/gemini help`
Shows all available commands.

```
/gemini help
```

### Mention for Questions
Ask Gemini specific questions by mentioning the bot:

```
@gemini-code-assist how should I refactor this service?
```

## Automatic Reviews

Gemini Code Assist automatically reviews all new pull requests within ~5 minutes of creation.

## Configuration

The `.gemini/config.yml` file contains project-specific guidelines that Gemini follows:

- Architecture patterns (Router → Service → Repository)
- TypeScript standards (no 'any' types, proper interfaces)
- Code quality requirements (ESLint, Prettier, type checking)
- 12-Factor App compliance
- Testing requirements

## Review Focus Areas

Gemini reviews for:
- ✅ Architecture compliance
- ✅ Security vulnerabilities
- ✅ Performance issues
- ✅ Type safety
- ✅ Code quality
- ✅ Best practices
- ✅ Testing coverage

