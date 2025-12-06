import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// Usar NON_POOLING para operações de schema (CREATE TABLE, etc)
const sql = postgres(process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!, { 
  ssl: 'require',
  max: 1
});

async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

async function seedCustomers() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map((customer) => sql`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
      ON CONFLICT (id) DO NOTHING;
    `)
  );

  return insertedCustomers;
}

async function seedInvoices() {
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map((invoice) => sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date});
    `)
  );

  return insertedInvoices;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map((rev) => sql`
      INSERT INTO revenue (month, revenue)
      VALUES (${rev.month}, ${rev.revenue})
      ON CONFLICT (month) DO NOTHING;
    `)
  );

  return insertedRevenue;
}

async function cleanDatabase() {
  // Limpar dados das tabelas (na ordem correta devido às foreign keys)
  await sql`TRUNCATE TABLE invoices CASCADE`;
  await sql`TRUNCATE TABLE revenue CASCADE`;
  await sql`TRUNCATE TABLE customers CASCADE`;
  await sql`TRUNCATE TABLE users CASCADE`;
}

export async function GET() {
  try {
    // Verificar se a variável de ambiente está configurada
    if (!process.env.POSTGRES_URL_NON_POOLING && !process.env.POSTGRES_URL) {
      return Response.json(
        { 
          error: "POSTGRES_URL não está configurada. Verifique o arquivo .env.local",
          details: "A variável POSTGRES_URL ou POSTGRES_URL_NON_POOLING é necessária."
        }, 
        { status: 500 }
      );
    }

    // Limpar as tabelas antes de inserir novos dados
    await cleanDatabase();

    // Inserir os dados
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: "Database cleaned and seeded successfully" });
  } catch (error: any) {
    console.error('Erro ao fazer seed:', error);
    return Response.json(
      { 
        error: error?.message || "Erro desconhecido",
        details: error?.toString() || String(error)
      }, 
      { status: 500 }
    );
  }
}
