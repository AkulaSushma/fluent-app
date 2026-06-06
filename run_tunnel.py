import subprocess
import sys
import os
import time

url_file = r"d:\Lingura\tunnel_url.txt"
if os.path.exists(url_file):
    os.remove(url_file)

print("Starting localtunnel...")
cmd = "npx -y localtunnel --port 8000 --local-host 127.0.0.1 --subdomain khaki-boats-fall"
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, shell=True)

# Read output line by line
for line in iter(proc.stdout.readline, ""):
    sys.stdout.write(line)
    sys.stdout.flush()
    if "your url is:" in line.lower():
        url = line.split("your url is:")[-1].strip()
        print(f"FOUND TUNNEL URL: {url}")
        with open(url_file, "w") as f:
            f.write(url)
        print("Wrote URL to tunnel_url.txt")

proc.stdout.close()
proc.wait()
