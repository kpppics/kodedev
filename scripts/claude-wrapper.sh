#!/bin/bash
# Allows `claude --dangerously-skip-permissions` when running as root by
# re-launching inside a user namespace that maps uid/gid to 1000.
exec unshare --user --map-user=1000 --map-group=1000 /opt/claude-code/bin/claude "$@"
