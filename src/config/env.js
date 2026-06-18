import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config();

export const config = {
  port: process.env.PORT || 5556,
  lawApiOc: process.env.LAW_API_OC || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Simple check
if (!config.lawApiOc) {
  console.warn('⚠️ Warning: LAW_API_OC is not defined in environment variables. The API will return mock data.');
}
