import { createApp } from "../src/app";
import { connectDatabase } from "../src/config/db";

const app = createApp();

export default async function handler(req: unknown, res: unknown) {
  await connectDatabase();
  return app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
