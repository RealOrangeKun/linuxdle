import React from 'react';
import { Typography } from '@mui/material';
import GuideArticleLayout from '../components/GuideArticleLayout';

const GuideSystemctl: React.FC = () => {
  return (
    <GuideArticleLayout
      title="systemctl guide: manage services with confidence"
      description="A practical systemctl playbook for service lifecycle, startup policy, and safe production changes."
      updatedOn="April 12, 2026"
      author="Linuxdle Editorial"
      keywords="systemctl tutorial, linux service management, systemd units"
      toc={[
        { id: 'core-model', label: 'Core model: state, enablement, and unit files' },
        { id: 'everyday-ops', label: 'Everyday operations that prevent surprises' },
        { id: 'safe-rollouts', label: 'Safe rollout and rollback habits' },
        { id: 'debugging', label: 'Debugging failed units quickly' },
      ]}
    >
      <Typography id="core-model" variant="h5" component="h2" fontWeight="bold">
        Core model: state, enablement, and unit files
      </Typography>
      <Typography>
        To use systemctl well, separate runtime state from boot policy. A service can be running now but not
        enabled for startup, or enabled but currently stopped. Keeping that distinction clear prevents most
        operations mistakes.
      </Typography>
      <Typography>
        Unit files define behavior, dependencies, restart policy, and environment. Treat unit definitions as
        production code: review changes, document intent, and keep overrides explicit.
      </Typography>

      <Typography id="everyday-ops" variant="h5" component="h2" fontWeight="bold">
        Everyday operations that prevent surprises
      </Typography>
      <Typography>
        Favor status checks before and after every restart. A quick status snapshot catches dependency errors,
        missing environment values, and permission issues that otherwise appear later as vague outages.
      </Typography>
      <Typography>
        Use daemon reload after unit file edits, then restart only the affected services. This keeps blast radius
        narrow and makes post-change validation easier.
      </Typography>

      <Typography id="safe-rollouts" variant="h5" component="h2" fontWeight="bold">
        Safe rollout and rollback habits
      </Typography>
      <Typography>
        Roll out service changes in small stages. Update one host or one workload slice, verify health checks,
        then continue. If metrics degrade, revert the unit override and restart to restore the previous baseline.
      </Typography>
      <Typography>
        Store unit overrides in version control and pair each operational change with a rollback note.
        This turns emergency actions into repeatable runbooks.
      </Typography>

      <Typography id="debugging" variant="h5" component="h2" fontWeight="bold">
        Debugging failed units quickly
      </Typography>
      <Typography>
        When a unit fails, inspect status first for immediate exit codes and dependency hints. Then pivot to
        focused logs for that unit over a tight time range. Combining systemctl state with journal evidence is
        the fastest path to root cause.
      </Typography>
      <Typography>
        The goal is not memorizing dozens of commands. It is building a reliable routine: inspect, scope,
        change minimally, verify, and document. With that workflow, service management becomes calm and predictable.
      </Typography>
    </GuideArticleLayout>
  );
};

export default GuideSystemctl;
