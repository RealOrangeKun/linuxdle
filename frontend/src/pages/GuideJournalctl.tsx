import React from 'react';
import { Typography } from '@mui/material';
import GuideArticleLayout from '../components/GuideArticleLayout';

const GuideJournalctl: React.FC = () => {
  return (
    <GuideArticleLayout
      title="journalctl guide: read Linux logs fast without noise"
      description="A practical journalctl workflow for filtering, tracing incidents, and exporting logs cleanly."
      updatedOn="April 12, 2026"
      author="Linuxdle Editorial"
      keywords="journalctl tutorial, linux logs, systemd journal debugging"
      toc={[
        { id: 'mental-model', label: 'Mental model: think in units, boots, and priorities' },
        { id: 'daily-queries', label: 'Daily queries you should memorize' },
        { id: 'incident-flow', label: 'Incident flow: from symptom to root cause' },
        { id: 'exporting', label: 'Exporting and sharing logs safely' },
      ]}
    >
      <Typography id="mental-model" variant="h5" component="h2" fontWeight="bold">
        Mental model: think in units, boots, and priorities
      </Typography>
      <Typography>
        journalctl becomes easy when you stop treating it as a giant log file. Start from three dimensions:
        the systemd unit, the boot session, and the severity level. This narrows noise quickly and keeps
        troubleshooting reproducible for teammates.
      </Typography>
      <Typography>
        Instead of scrolling endlessly, ask focused questions like: what did nginx log since the last boot,
        and what warnings escalated to errors in the last 15 minutes.
      </Typography>

      <Typography id="daily-queries" variant="h5" component="h2" fontWeight="bold">
        Daily queries you should memorize
      </Typography>
      <Typography>
        Use unit-focused views for service triage, for example journalctl -u your-service-name. Add --since
        with relative times for tight windows during deploy validation. Use -p warning or -p err to focus
        on actionable entries when the log volume is high.
      </Typography>
      <Typography>
        For boot-specific failures, query the previous boot directly. This avoids mixing old startup noise
        with current session behavior and helps validate whether a reboot changed the error profile.
      </Typography>

      <Typography id="incident-flow" variant="h5" component="h2" fontWeight="bold">
        Incident flow: from symptom to root cause
      </Typography>
      <Typography>
        Start with the failing unit, then fan out by dependency. If a web service crashes, inspect its unit,
        then related database and network units over the same time window. Correlating by timestamp exposes
        causal chains faster than reading each service in isolation.
      </Typography>
      <Typography>
        During active incidents, follow logs live and keep one terminal per critical unit. This preserves
        context and prevents command churn while systems are changing.
      </Typography>

      <Typography id="exporting" variant="h5" component="h2" fontWeight="bold">
        Exporting and sharing logs safely
      </Typography>
      <Typography>
        When handing logs to teammates, export only the required unit, time window, and priority band.
        This improves signal and reduces accidental disclosure. If sensitive values might appear, run a
        redaction pass before posting to issue trackers.
      </Typography>
      <Typography>
        The strongest journalctl workflow is disciplined scoping, not memorizing every flag. Keep queries
        explicit, time-bounded, and unit-aware, and incident response gets dramatically faster.
      </Typography>
    </GuideArticleLayout>
  );
};

export default GuideJournalctl;
