# Triage

Use this for incoming tasks or local issues.

States:

- `needs-triage` - maintainer has not evaluated the issue yet.
- `needs-info` - cannot be implemented without clarification.
- `ready` - clear enough to implement.
- `ready-for-human` - requires human interaction or credentials.
- `blocked` - waiting on dependency or external state.
- `completed` - acceptance criteria and verification have passed.
- `wontfix` - will not be actioned.

Work types:

- `bug` - incorrect behavior.
- `feature` - new behavior.
- `refactor` - behavior-preserving structure change.
- `infra` - tooling, CI, deploy, or environment work.
- `docs` - documentation-only change.
- `test` - testing-only change.

Use exactly one state and one work type. See `docs/agents/config/triage-labels.md` for the
canonical skill mapping.
