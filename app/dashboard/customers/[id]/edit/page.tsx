import {fetchCustomerById } from '@/app/lib/data';
import {Metadata} from "next";
import Breadcrumbs from '@/app/ui/customers/breadcrumbs';
import Form from '@/app/ui/customers/edit-form';

export const metadata: Metadata = {
    title: 'Edit Customer',
}

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;

    const [customers] = await Promise.all([ fetchCustomerById(id)]);


    return (
        <main>
            <p>{JSON.stringify(customers)}</p>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Customer', href: '/dashboard/customers' },
                    {
                        label: 'Edit Customer',
                        href: `/dashboard/customers/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form customers={customers}  />
        </main>
    );
}
