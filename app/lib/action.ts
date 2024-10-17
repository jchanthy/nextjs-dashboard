'use server';


import {z} from "zod";
import connectionDb from "@/app/lib/connectionDb";
import Invoice from "@/app/models/Invoice";
import Customer from "@/app/models/Customer";
import {revalidatePath} from "next/cache";
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {redirect} from "next/navigation";

const FormSchema = z.object({
    id: z.string().optional(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string().optional(),
});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

const CustomerSchema = z.object({
    name: z.string().min(1, { message: 'Please enter a name.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    image_url: z.string().optional(),
});
export type CustomerState = {
    errors?: {
        name?: string[];
        email?: string[];
    };
    message?: string | null;
}

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await connectionDb();

        const newInvoice = new Invoice({
            customer_id: customerId,
            amount: amountInCents,
            status,
            date
        });
        await newInvoice.save();

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    }catch (e) {
        console.log(e);
        return {message: 'Failed to Create Invoice'};
    }

}

export async function updateInvoice(id: string, formData: FormData) {

    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });


    try {
        await connectionDb();
        await Invoice.updateOne({ _id: id },
            {
                customer_id: customerId,
                amount: amount * 100,
                status
            });
        revalidatePath('dashboard/invoices');
        redirect('dashboard/invoices');
        return {message: 'Invoice Updated'}
    } catch (e) {
        console.log(e);
        return {message: 'Failed to Update Invoice'};
    }
}

export async function deleteInvoice(id: string) {

    try {
        await connectionDb();

        await Invoice.deleteOne({ _id: id} );

        revalidatePath('/dashboard/invoices');
        return {message: 'Invoice Deleted'};
    } catch (e) {
        console.log(e);
       return {message: 'Failed to Delete Invoice'};
    }

}

// Customer Actions
export async function createCustomer(prevState: CustomerState, formData: FormData) {

    const validatedFields = CustomerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Customer.',
        };
    }

    // Prepare data for insertion into the database
    const { name, email, image_url } = validatedFields.data;

    try {
        await connectionDb();

        // Handle the image upload here
        const newCustomer = new Customer({
            name,
            email,
            image_url: '/customers/evil-rabbit.png',
        });

        await newCustomer.save();

        revalidatePath('/dashboard/customers');
        redirect('/dashboard/customers');
    } catch (e) {
        console.log(e);
        return { message:

            'Failed to Create Customer' };
    }
}

export async function updateCustomer(id: string, formData: FormData) {

    const { name, email, image_url } = CustomerSchema.parse({
        name: formData.get('name'),
        email: formData.get('email'),
    });

    try {
        await connectionDb();

        await Customer.updateOne({ _id: id },
            {
                name,
                email,
                image_url: '/customers/evil-rabbit.png',
            });
        revalidatePath('dashboard/customers');
        redirect('dashboard/customers');
    } catch (e) {
        console.log(e);
        return {message: 'Failed to Update Customer'}
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData
) {

    try {
        await signIn('credentials',formData);
    } catch (error) {
        if(error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}


