module.exports = {
  apps: [{
    name: 'metrics-api',
    script: './api-server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    max_memory_restart: '250M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    out_file: './logs/api-out.log',
    error_file: './logs/api-error.log',
    log_file: './logs/api-combined.log',
    time: true,
    max_restarts: 5,
    min_uptime: '10s',
    autorestart: true,
    watch: false,
    ignore_watch: ['logs', 'node_modules'],
    log_type: 'json'
  }]
};