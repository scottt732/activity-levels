# Security policy

## Supported versions

Only the latest release is supported. If you are running an older version, upgrade
before reporting — the issue may already be fixed.

| Version | Supported |
| --- | --- |
| Latest release | Yes |
| Anything older | No |

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Report it through GitHub's private vulnerability reporting: go to the
[Security tab](https://github.com/scottt732/activity-levels/security) and choose
**Report a vulnerability**. That opens a private advisory only you and the maintainer
can see.

Include what you can: what an attacker can do, the Home Assistant and integration
versions, and the steps to reproduce it.

This is a hobby project maintained by one person, so there is no response-time
guarantee — but reports are read, and you will get an acknowledgement. Once a fix is
released the advisory is published, crediting you unless you would rather it didn't.

## Scope

This integration runs inside Home Assistant with the privileges Home Assistant has. Its
websocket API is admin-only, and it reads entity states, the entity/device registries,
recorder statistics and the calendars you configure. Anything that lets a non-admin user
read or change the configuration, or that lets configuration data escape the instance,
is in scope.
