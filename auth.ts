import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import connectionDb from "@/app/lib/connectionDb";
import bcrypt from "bcrypt";
import User from "@/app/models/User";

async function getUser(email: string) {
    try{
        await connectionDb();

        // Fetch data from MongoDB
        return await User.findOne({ email });

    }catch(error){
        console.log('Failed to fetch user', error);
        throw new Error('Failed to fetch user');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if(parsedCredentials.success) {
                    const {email, password} = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) return user;
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});