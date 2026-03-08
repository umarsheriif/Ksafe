import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
      where: { email: "admin@ksafe.com" },
      update: { hashedPassword: adminPassword },
      create: {
        name: "System Admin",
        email: "admin@ksafe.com",
        hashedPassword: adminPassword,
        role: "ADMIN",
      },
    });

    // Create finance user
    const financePassword = await bcrypt.hash("finance123", 12);
    await prisma.user.upsert({
      where: { email: "finance@ksafe.com" },
      update: { hashedPassword: financePassword },
      create: {
        name: "Finance Manager",
        email: "finance@ksafe.com",
        hashedPassword: financePassword,
        role: "FINANCE",
      },
    });

    // Create CFO
    const cfoPassword = await bcrypt.hash("cfo123", 12);
    await prisma.user.upsert({
      where: { email: "cfo@ksafe.com" },
      update: { hashedPassword: cfoPassword },
      create: {
        name: "Chief Financial Officer",
        email: "cfo@ksafe.com",
        hashedPassword: cfoPassword,
        role: "CFO",
      },
    });

    // Create departments
    const engineering = await prisma.department.upsert({
      where: { code: "ENG" },
      update: {},
      create: { code: "ENG", name: "Engineering" },
    });

    const marketing = await prisma.department.upsert({
      where: { code: "MKT" },
      update: {},
      create: { code: "MKT", name: "Marketing" },
    });

    await prisma.department.upsert({
      where: { code: "OPS" },
      update: {},
      create: { code: "OPS", name: "Operations" },
    });

    // Create department heads
    const engHeadPassword = await bcrypt.hash("enghead123", 12);
    const engHead = await prisma.user.upsert({
      where: { email: "eng.head@ksafe.com" },
      update: { hashedPassword: engHeadPassword },
      create: {
        name: "Engineering Head",
        email: "eng.head@ksafe.com",
        hashedPassword: engHeadPassword,
        role: "DEPARTMENT_HEAD",
        departmentId: engineering.id,
      },
    });

    const mktHeadPassword = await bcrypt.hash("mkthead123", 12);
    await prisma.user.upsert({
      where: { email: "mkt.head@ksafe.com" },
      update: { hashedPassword: mktHeadPassword },
      create: {
        name: "Marketing Head",
        email: "mkt.head@ksafe.com",
        hashedPassword: mktHeadPassword,
        role: "DEPARTMENT_HEAD",
        departmentId: marketing.id,
      },
    });

    // Create a requester
    const requesterPassword = await bcrypt.hash("requester123", 12);
    await prisma.user.upsert({
      where: { email: "requester@ksafe.com" },
      update: { hashedPassword: requesterPassword },
      create: {
        name: "John Requester",
        email: "requester@ksafe.com",
        hashedPassword: requesterPassword,
        role: "REQUESTER",
        departmentId: engineering.id,
        managerId: engHead.id,
      },
    });

    // Create fiscal year
    const fiscalYear = await prisma.fiscalYear.upsert({
      where: { name: "FY 2025-2026" },
      update: {},
      create: {
        name: "FY 2025-2026",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2026-03-31"),
        isCurrent: true,
      },
    });

    // Create budget categories
    const engBudget = await prisma.budgetCategory.upsert({
      where: {
        departmentId_name_fiscalYearId: {
          departmentId: engineering.id,
          name: "Software & Tools",
          fiscalYearId: fiscalYear.id,
        },
      },
      update: {},
      create: {
        name: "Software & Tools",
        glCode: "5100",
        totalBudget: 500000,
        currency: "USD",
        departmentId: engineering.id,
        fiscalYearId: fiscalYear.id,
      },
    });

    const mktBudget = await prisma.budgetCategory.upsert({
      where: {
        departmentId_name_fiscalYearId: {
          departmentId: marketing.id,
          name: "Advertising",
          fiscalYearId: fiscalYear.id,
        },
      },
      update: {},
      create: {
        name: "Advertising",
        glCode: "6100",
        totalBudget: 300000,
        currency: "USD",
        departmentId: marketing.id,
        fiscalYearId: fiscalYear.id,
      },
    });

    // Create budget line items
    await prisma.budgetLineItem.createMany({
      data: [
        {
          name: "Cloud Infrastructure",
          description: "AWS/GCP hosting costs",
          allocatedAmount: 200000,
          currency: "USD",
          budgetCategoryId: engBudget.id,
        },
        {
          name: "Dev Tools & Licenses",
          description: "IDE, CI/CD, monitoring tools",
          allocatedAmount: 100000,
          currency: "USD",
          budgetCategoryId: engBudget.id,
        },
        {
          name: "Digital Campaigns",
          description: "Google/Meta ads",
          allocatedAmount: 150000,
          currency: "USD",
          budgetCategoryId: mktBudget.id,
        },
      ],
      skipDuplicates: true,
    });

    // Create vendors
    await prisma.vendor.upsert({
      where: { email: "billing@aws.amazon.com" },
      update: {},
      create: {
        name: "Amazon Web Services",
        email: "billing@aws.amazon.com",
        currency: "USD",
        status: "APPROVED",
        bankName: "Chase Bank",
        bankAccountNo: "****1234",
      },
    });

    await prisma.vendor.upsert({
      where: { email: "billing@google.com" },
      update: {},
      create: {
        name: "Google Cloud",
        email: "billing@google.com",
        currency: "USD",
        status: "APPROVED",
      },
    });

    await prisma.vendor.upsert({
      where: { email: "sales@jetbrains.com" },
      update: {},
      create: {
        name: "JetBrains",
        email: "sales@jetbrains.com",
        currency: "USD",
        status: "PENDING",
      },
    });

    // Create exchange rates
    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_fiscalYearId: {
          fromCurrency: "EUR",
          toCurrency: "USD",
          fiscalYearId: fiscalYear.id,
        },
      },
      update: {},
      create: {
        fromCurrency: "EUR",
        toCurrency: "USD",
        rate: 1.08,
        fiscalYearId: fiscalYear.id,
      },
    });

    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_fiscalYearId: {
          fromCurrency: "GBP",
          toCurrency: "USD",
          fiscalYearId: fiscalYear.id,
        },
      },
      update: {},
      create: {
        fromCurrency: "GBP",
        toCurrency: "USD",
        rate: 1.27,
        fiscalYearId: fiscalYear.id,
      },
    });

    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency_fiscalYearId: {
          fromCurrency: "AED",
          toCurrency: "USD",
          fiscalYearId: fiscalYear.id,
        },
      },
      update: {},
      create: {
        fromCurrency: "AED",
        toCurrency: "USD",
        rate: 0.2723,
        fiscalYearId: fiscalYear.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      users: [
        "admin@ksafe.com / admin123",
        "finance@ksafe.com / finance123",
        "cfo@ksafe.com / cfo123",
        "eng.head@ksafe.com / enghead123",
        "mkt.head@ksafe.com / mkthead123",
        "requester@ksafe.com / requester123",
      ],
    });
  } catch (error) {
    console.error("[seed] Error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
