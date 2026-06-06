module.exports = {
  apps: [
    {
      name: "fluent-backend",
      script: ".venv/Scripts/python.exe",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000",
      cwd: "./backend",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        ENV: "production"
      }
    },
    {
      name: "fluent-tunnel",
      script: "backend/.venv/Scripts/python.exe",
      args: "run_ssh_tunnel.py",
      cwd: "../",
      watch: false,
      autorestart: true,
      max_restarts: 15
    },
    {
      name: "fluent-mobile",
      script: "node_modules/expo/bin/cli",
      args: "start",
      cwd: "./mobile",
      watch: false,
      autorestart: true,
      max_restarts: 5
    }
  ]
};
