import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
  serviceName: string;
  environment: string;
  port: number;
  instanceId: string;
  serviceHost: string;
  mongodb: {
    uri: string;
    options: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
      maxPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
    };
  };
  redis: {
    uri: string;
    options: {
      maxRetriesPerRequest: number;
      enableReadyCheck: boolean;
      connectTimeout: number;
    };
  };
  consul: {
    host: string;
    port: number;
  };
  rabbitmq: {
    host: string;
    port: number;
    username: string;
    password: string;
    vhost: string;
    exchanges: {
      events: string;
      commands: string;
      dlx: string;
    };
    queues: {
      events: string;
      commands: string;
      dlq: string;
    };
  };
  elasticsearch: {
    url: string;
    username: string;
    password: string;
    index: string;
  };
  jaeger: {
    serviceName: string;
    host: string;
    port: number;
  };
  logging: {
    level: string;
    pretty: boolean;
  };
}

// Generate a unique instance ID
const instanceId = `${process.env.SERVICE_NAME || 'product-service'}-${process.env.HOSTNAME || 'local'}-${Date.now()}`;

// Configuration object
export const config: Config = {
  serviceName: process.env.SERVICE_NAME || 'product-service',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  instanceId,
  serviceHost: process.env.SERVICE_HOST || 'localhost',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/varai',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
    options: {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
    },
  },
  consul: {
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  },
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    username: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASS || 'guest',
    vhost: process.env.RABBITMQ_VHOST || '/',
    exchanges: {
      events: 'varai.events',
      commands: 'varai.commands',
      dlx: 'varai.dlx',
    },
    queues: {
      events: 'product-service.events',
      commands: 'product-service.commands',
      dlq: 'product-service.dlq',
    },
  },
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'elastic_password',
    index: 'products',
  },
  jaeger: {
    serviceName: process.env.SERVICE_NAME || 'product-service',
    host: process.env.JAEGER_AGENT_HOST || 'localhost',
    port: parseInt(process.env.JAEGER_AGENT_PORT || '6831', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.NODE_ENV !== 'production',
  },
};