import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";

/**
 * Seed script: fills an empty database with realistic demo data so the
 * dashboard has something to show and so we can log in immediately in Phase 3.
 *
 * Run with: npm run db:seed   (or `npx prisma db seed`)
 */

const DEMO_PASSWORD = "password123";

async function main() {
  console.log("🌱 Seeding database…");

  // Hash the shared demo password once.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Clear existing data (order matters: children before parents) ---
  await prisma.ticketStatusHistory.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      email: "admin@supportflow.test",
      name: "Avery Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  const agentSam = await prisma.user.create({
    data: {
      email: "agent@supportflow.test",
      name: "Sam Agent",
      role: "SUPPORT_AGENT",
      passwordHash,
    },
  });

  const agentRiley = await prisma.user.create({
    data: {
      email: "riley@supportflow.test",
      name: "Riley Agent",
      role: "SUPPORT_AGENT",
      passwordHash,
    },
  });

  const customerCasey = await prisma.user.create({
    data: {
      email: "customer@supportflow.test",
      name: "Casey Customer",
      role: "CUSTOMER",
      passwordHash,
    },
  });

  const customerJordan = await prisma.user.create({
    data: {
      email: "jordan@supportflow.test",
      name: "Jordan Customer",
      role: "CUSTOMER",
      passwordHash,
    },
  });

  // --- Tickets (with nested comments + an initial status-history row) ---
  await prisma.ticket.create({
    data: {
      title: "Cannot reset my password",
      description:
        "I clicked 'Forgot password' but never received the reset email.",
      status: "OPEN",
      priority: "HIGH",
      category: "Account",
      createdById: customerCasey.id,
      assignedAgentId: agentSam.id,
      statusHistory: {
        create: { toStatus: "OPEN", changedById: customerCasey.id },
      },
      comments: {
        create: [
          {
            body: "Thanks for reaching out — checking our email logs now.",
            authorId: agentSam.id,
          },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Billing charged me twice",
      description: "My March invoice shows two identical charges of $49.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      category: "Billing",
      createdById: customerJordan.id,
      assignedAgentId: agentRiley.id,
      statusHistory: {
        create: [
          { toStatus: "OPEN", changedById: customerJordan.id },
          {
            fromStatus: "OPEN",
            toStatus: "IN_PROGRESS",
            changedById: agentRiley.id,
          },
        ],
      },
      comments: {
        create: [
          {
            body: "Confirmed the duplicate charge. Processing a refund.",
            authorId: agentRiley.id,
          },
        ],
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "Feature request: dark mode",
      description: "Would love a dark theme for the dashboard.",
      status: "OPEN",
      priority: "LOW",
      category: "Feature Request",
      createdById: customerCasey.id,
      statusHistory: {
        create: { toStatus: "OPEN", changedById: customerCasey.id },
      },
    },
  });

  await prisma.ticket.create({
    data: {
      title: "App crashes on file upload",
      description: "Uploading a PDF over 5MB freezes the page.",
      status: "RESOLVED",
      priority: "MEDIUM",
      category: "Bug",
      createdById: customerJordan.id,
      assignedAgentId: agentSam.id,
      statusHistory: {
        create: [
          { toStatus: "OPEN", changedById: customerJordan.id },
          {
            fromStatus: "OPEN",
            toStatus: "IN_PROGRESS",
            changedById: agentSam.id,
          },
          {
            fromStatus: "IN_PROGRESS",
            toStatus: "RESOLVED",
            changedById: agentSam.id,
          },
        ],
      },
    },
  });

  const counts = {
    users: await prisma.user.count(),
    tickets: await prisma.ticket.count(),
    comments: await prisma.ticketComment.count(),
    statusHistory: await prisma.ticketStatusHistory.count(),
  };

  console.log("✅ Seed complete:", counts);
  console.log(`   Demo login password for every account: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
