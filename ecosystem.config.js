module.exports = {
  apps: [
    {
      name: 'jobhive-app',
      script: 'app.js',
      env_file: '.env',
      max_restarts: 10,
      restart_delay: 3000,
      watch: false
    },
    {
      name: 'jobhive-worker',
      script: 'worker.js',
      env_file: '.env',
      max_restarts: 10,
      restart_delay: 3000,
      watch: false
    }
  ]
};
