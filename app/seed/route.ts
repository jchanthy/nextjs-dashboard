// app/seed/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {seedDatabase} from "@/app/lib/seed";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        await seedDatabase();
        res.status(200).json({ message: 'Database seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding database', error: error });
    }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ message: 'Method not allowed' });
}
