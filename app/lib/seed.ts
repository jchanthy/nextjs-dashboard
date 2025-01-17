// seed.js
import bcrypt from 'bcrypt';

import { users, invoices, customers, revenue } from './placeholder-data';
import connectionDb from "@/app/lib/connectionDb";
import User from "@/app/models/User";
import Customer from "@/app/models/Customer";
import Invoice from "@/app/models/Invoice";
import Revenue from "@/app/models/Revenue";

async function seedUsers() {
    await connectionDb();

    const hashedUsers = await Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return { ...user, password: hashedPassword };
        })
    );

    for (const user of hashedUsers) {
        await User.updateOne(
            { email: user.email },
            { $setOnInsert: user },
            { upsert: true }
        );
    }
    return User.insertMany(hashedUsers);
}

async function seedCustomers() {
    await connectionDb();
    return Customer.insertMany(customers);
}

async function seedInvoices() {
    await connectionDb();
    return Invoice.insertMany(invoices);
}

async function seedRevenue() {
    await connectionDb();
    return Revenue.insertMany(revenue);
}

export async function seedDatabase() {
    try {
        await seedUsers();
        await seedCustomers();
        await seedInvoices();
        await seedRevenue();
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database', error);
    }
}
