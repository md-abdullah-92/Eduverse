interface Config {
  port: number;
  jwtSecret: string;
  corsOrigin: string | string[];
  rateLimitWindow: number;
  rateLimitMax: number;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100 // limit each IP to 100 requests per windowMs
};

export default config;
