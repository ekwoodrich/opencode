# OpenCode Expo Dev Service

This systemd unit runs the Expo dev server on boot using a helper script in this repo.

- `dev/opencode-expo-dev.service`: systemd unit that runs the helper script.
- `dev/opencode-expo-dev.sh`: runs Expo via Bun with `--host lan`.

## Commands

```bash
sudo systemctl daemon-reload
sudo systemctl enable opencode-expo-dev.service
sudo systemctl start opencode-expo-dev.service
sudo systemctl stop opencode-expo-dev.service
sudo systemctl restart opencode-expo-dev.service
sudo systemctl status opencode-expo-dev.service
sudo journalctl -u opencode-expo-dev.service -n 200
sudo journalctl -u opencode-expo-dev.service -f
```
