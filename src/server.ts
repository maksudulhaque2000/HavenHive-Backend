import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { printEnvStatus } from "./config/envStatus";

const start = async () => {
  printEnvStatus();
  await connectDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`\n✓ HavenHive API listening on port ${env.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`✓ Database: Connected`);
    // eslint-disable-next-line no-console
    console.log(`✓ Environment: ${env.NODE_ENV.toUpperCase()}\n`);
  });
};

void start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
