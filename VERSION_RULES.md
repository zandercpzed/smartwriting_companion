# Version Management Rules

## Version Increment Rule

**Rule: Last Digit Increment**

At each interaction (commit, release, or significant change), the last digit of the version number MUST be incremented.

### Version Format
- Format: `MAJOR.MINOR.PATCH`
- Example: `0.1.0` → `0.1.1` → `0.1.2` → etc.

### When to Increment
- After each commit with changes
- After each release
- After each significant interaction or update
- This rule must always be obeyed without exception

### Implementation
- Update both `manifest.json` and `package.json` version fields
- Commit the version change
- Push to repository
- Update plugin in Obsidian vault

### Automation
This rule ensures consistent version tracking and prevents version conflicts.

# Version Rules

- **Current Version:** 0.3.1
- **Version Increment:** Increment the last digit for code updates (e.g., 0.3.1 → 0.3.2).