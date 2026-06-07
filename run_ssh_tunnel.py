import subprocess
import sys
import os
import re

url_file = r"d:\Lingura\tunnel_url.txt"
env_file = r"d:\Lingura\fluent\mobile\.env"

if os.path.exists(url_file):
    os.remove(url_file)

client_ts_file = r"d:\Lingura\fluent\mobile\src\api\client.ts"

def update_mobile_env(url):
    """Automatically update the mobile client's .env with the active tunnel URL."""
    api_url = f"{url.strip()}/api/v1"
    if os.path.exists(env_file):
        try:
            with open(env_file, "r") as f:
                content = f.read()
            if "EXPO_PUBLIC_API_URL=" in content:
                updated = re.sub(r"EXPO_PUBLIC_API_URL=.*", f"EXPO_PUBLIC_API_URL={api_url}", content)
            else:
                updated = content + f"\nEXPO_PUBLIC_API_URL={api_url}\n"
            with open(env_file, "w") as f:
                f.write(updated)
            print(f"Updated mobile .env with new API URL: {api_url}")
        except Exception as e:
            print(f"Error updating mobile .env: {e}")


print("Starting SSH tunnel via localhost.run...")
# StrictHostKeyChecking=no to avoid prompt, NUL or /dev/null for UserKnownHostsFile on Windows (NUL works)
cmd = "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -R 80:127.0.0.1:8000 nokey@localhost.run"
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, shell=True)

# Read output line by line
for line in iter(proc.stdout.readline, ""):
    sys.stdout.write(line)
    sys.stdout.flush()
    # Strip ANSI escape codes
    clean_line = re.sub(r'\x1b\[[0-9;]*[mGKH]', '', line)
    # Check for domain like xxxx.lhr.life or similar
    match = re.search(r"([a-zA-Z0-9.-]+\.lhr\.(?:life|run|rocks|net))", clean_line)
    if match:
        url = f"https://{match.group(1)}"
        print(f"\nFOUND SSH TUNNEL URL: {url}\n")
        with open(url_file, "w") as f:
            f.write(url)
        print("Wrote URL to tunnel_url.txt")
        update_mobile_env(url)

proc.stdout.close()
proc.wait()

