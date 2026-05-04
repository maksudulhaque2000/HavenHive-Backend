import { connectDatabase } from "../config/db";
import { env } from "../config/env";
import { User } from "../models/User";

const seedDatabase = async () => {
  try {
    await connectDatabase();
    // eslint-disable-next-line no-console
    console.log("Connected to database. Starting seed...");

    const adminEmail = env.SEED_ADMIN_EMAIL ?? "admin@gmail.com";
    const adminPassword = env.SEED_ADMIN_PASSWORD ?? "Password@123";
    const userEmail = "user@gmail.com";
    const userPassword = "Password@123";

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        phone: "+1234567890",
        isVerified: true
      });
      // eslint-disable-next-line no-console
      console.log(`✓ Created admin: ${adminEmail}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`✓ Admin user ${adminEmail} already exists.`);
    }

    // Check if regular user exists
    const existingUser = await User.findOne({ email: userEmail });
    if (!existingUser) {
      await User.create({
        name: "Test User",
        email: userEmail,
        password: userPassword,
        role: "user",
        phone: "+0987654321",
        isVerified: true
      });
      // eslint-disable-next-line no-console
      console.log(`✓ Created user: ${userEmail}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`✓ User ${userEmail} already exists.`);
    }

    const agents = await User.insertMany([
      {
        name: "Agent User",
        email: "agent@gmail.com",
        password: "Password@123",
        role: "agent",
        phone: "+1234567891",
        isVerified: true,
        wishlist: []
      }
    ]);

    // eslint-disable-next-line no-console
    console.log("\n✓ Seed completed successfully!");
    // eslint-disable-next-line no-console
    console.log("\n📧 Login Credentials:");
    // eslint-disable-next-line no-console
    console.log(`  Admin: ${adminEmail} / Password@123`);
    // eslint-disable-next-line no-console
    console.log(`  User: ${userEmail} / Password@123`);
    // eslint-disable-next-line no-console
    console.log(`  Agent: ${agents.map((a) => a.email).join(", ")}`);

    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

void seedDatabase();
