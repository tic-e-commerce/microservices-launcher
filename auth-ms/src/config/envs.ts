import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  JWT_SECRET: string;
  APP_EMAIL_PASSWORD: string;
  EMAIL: string;
  FRONTEND_URL: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    JWT_SECRET: joi.string().required(),
    APP_EMAIL_PASSWORD: joi.string().required(),
    EMAIL: joi.string().email().required(),
    FRONTEND_URL: joi.string().uri().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  NATS_SERVERS: envVars.NATS_SERVERS,
  JWT_SECRET: envVars.JWT_SECRET,
  APP_EMAIL_PASSWORD: envVars.APP_EMAIL_PASSWORD,
  EMAIL: envVars.EMAIL,
  FRONTEND_URL: envVars.FRONTEND_URL,
};
