import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin);

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Latest electronic devices and gadgets",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel for everyone",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    },
  });

  const home = await prisma.category.upsert({
    where: { slug: "home-garden" },
    update: {},
    create: {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Everything for your home and garden",
      image:
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
    },
  });

  console.log("Created categories");

  // Create sample products
  const products = [
    {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description:
        "Premium wireless headphones with noise cancellation and superior sound quality.",
      price: 199.99,
      comparePrice: 249.99,
      stock: 50,
      sku: "WH-001",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
      ],
      featured: true,
      categoryId: electronics.id,
    },
    {
      name: "Smart Watch",
      slug: "smart-watch",
      description:
        "Feature-packed smartwatch with fitness tracking and notifications.",
      price: 299.99,
      stock: 30,
      sku: "SW-001",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      ],
      featured: true,
      categoryId: electronics.id,
    },
    {
      name: "Laptop Backpack",
      slug: "laptop-backpack",
      description:
        "Durable backpack with padded laptop compartment and multiple pockets.",
      price: 49.99,
      stock: 100,
      sku: "LB-001",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      ],
      categoryId: electronics.id,
    },
    {
      name: "Classic T-Shirt",
      slug: "classic-t-shirt",
      description: "Comfortable cotton t-shirt in multiple colors.",
      price: 24.99,
      stock: 200,
      sku: "TS-001",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      ],
      categoryId: clothing.id,
    },
    {
      name: "Denim Jeans",
      slug: "denim-jeans",
      description: "Premium quality denim jeans with perfect fit.",
      price: 79.99,
      comparePrice: 99.99,
      stock: 75,
      sku: "DJ-001",
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
      ],
      featured: true,
      categoryId: clothing.id,
    },
    {
      name: "Table Lamp",
      slug: "table-lamp",
      description: "Modern LED table lamp with adjustable brightness.",
      price: 39.99,
      stock: 60,
      sku: "TL-001",
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
      ],
      categoryId: home.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log("Created sample products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
