import React from 'react';
import { Typography } from '@mui/material';
import GuideArticleLayout from '../components/GuideArticleLayout';

const GuideXdgDesktopPortals: React.FC = () => {
  return (
    <GuideArticleLayout
      title="XDG Desktop Portals guide: why modern Linux apps depend on them"
      description="Understand what XDG Desktop Portals do, why they matter on Wayland and in sandboxed apps, and how to debug common integration failures."
      updatedOn="April 20, 2026"
      author="Linuxdle Editorial"
      keywords="xdg desktop portal, wayland screen share, flatpak permissions, linux desktop integration"
      toc={[
        { id: 'what-portals-do', label: 'What portals do in plain terms' },
        { id: 'why-they-matter', label: 'Why they matter more on Wayland and Flatpak' },
        { id: 'providers', label: 'Portal providers and backend selection' },
        { id: 'troubleshooting', label: 'Troubleshooting checklist for broken share dialogs' },
      ]}
    >
      <Typography id="what-portals-do" variant="h5" component="h2" fontWeight="bold">
        What portals do in plain terms
      </Typography>
      <Typography>
        XDG Desktop Portals are a standard bridge between apps and desktop capabilities that should be permission-gated,
        like opening files, sharing screens, printing, and notifications. Instead of each app talking directly to a
        desktop environment in its own custom way, apps call a stable D-Bus portal API and let the desktop handle the
        native dialog and policy decision.
      </Typography>
      <Typography>
        This gives users a consistent permission experience and lets toolkits, browsers, and sandboxed apps target one
        interface across GNOME, KDE Plasma, and wlroots-based compositors.
      </Typography>

      <Typography id="why-they-matter" variant="h5" component="h2" fontWeight="bold">
        Why they matter more on Wayland and Flatpak
      </Typography>
      <Typography>
        On X11, many apps historically bypassed mediation and accessed system resources directly. Wayland intentionally
        tightens that model, so workflows like screen sharing and screen capture rely on compositors and portal services
        to grant temporary, explicit access.
      </Typography>
      <Typography>
        Flatpak makes this even more important. Sandboxed apps should not assume raw host access, so portals become the
        compatibility layer that keeps security boundaries intact while preserving user-facing functionality.
      </Typography>

      <Typography id="providers" variant="h5" component="h2" fontWeight="bold">
        Portal providers and backend selection
      </Typography>
      <Typography>
        The core service is xdg-desktop-portal, but behavior depends on backend providers such as xdg-desktop-portal-gtk,
        xdg-desktop-portal-kde, and xdg-desktop-portal-wlr. Installing only the core package is often not enough; you
        typically need the provider that matches your desktop session.
      </Typography>
      <Typography>
        In mixed environments, wrong backend selection is a common source of odd behavior, including blank picker dialogs,
        failed file chooser responses, or browser share prompts that never appear.
      </Typography>

      <Typography id="troubleshooting" variant="h5" component="h2" fontWeight="bold">
        Troubleshooting checklist for broken share dialogs
      </Typography>
      <Typography>
        First, verify that the portal service and the matching backend are installed and running in your user session.
        Next, confirm your app package format: native package, Flatpak, and containerized builds can behave differently
        depending on runtime permissions and desktop integration packages.
      </Typography>
      <Typography>
        Then test a known portal-heavy path, such as browser screen sharing. If no picker opens, inspect user journal logs
        for portal and compositor errors, and verify your session type and backend alignment. Most failures come down to one
        of three issues: missing backend package, backend mismatch for the current desktop, or stale user session services.
      </Typography>
    </GuideArticleLayout>
  );
};

export default GuideXdgDesktopPortals;