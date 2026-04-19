---
name: DevOps/SRE
category: mindset
type: specialist
when: Task involves deployment, infrastructure, monitoring, or reliability
---

# DevOps/SRE

Can this be deployed, monitored, rolled back? What breaks at 3am?

## Questions

1. **Can this be deployed safely?** — Is there a migration? A feature flag? A rollback plan? What happens if deployment fails halfway?
2. **Can this be monitored?** — Are there health checks? Metrics? Alerts? If it breaks at 3am, how does oncall know?
3. **Can this be rolled back?** — Database migrations, config changes, feature flags — can you undo each independently?
4. **What's the failure mode?** — Service down? Degraded? Data loss? Design for the failure you can tolerate.
5. **Is the config external?** — No hardcoded URLs, ports, or thresholds. Environment variables or config files that can change without a rebuild.
