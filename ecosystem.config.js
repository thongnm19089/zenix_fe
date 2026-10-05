module.exports = {
  apps: [
    {
      name: 'zenix',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,  // Chỉ định cổng chạy ứng dụng
      },
    },
  ],
};









