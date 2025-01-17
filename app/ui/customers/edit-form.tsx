'use client';

import {useActionState} from 'react';
import Link from 'next/link';
import { UserCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { CustomerField } from '@/app/lib/definitions';
import { updateCustomer, CustomerState } from '@/app/lib/action';
import {EnvelopeIcon} from "@heroicons/react/16/solid"; // Assuming you have a createCustomer function and State type

export default function EditCustomerForm({customers}: {customers: CustomerField}) {

    const initialState: CustomerState = { message: null, errors: {} };
    const CustomerState = useActionState(updateCustomer, initialState);


    const updateCustomerWithId =  updateCustomer.bind( null, customers._id);


    return (
        <div>
            <p>{JSON.stringify(customers)}</p>
            <form action={updateCustomerWithId}>

                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    {/* Customer Name */}
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-2 block text-sm font-medium">
                            Customer Name
                        </label>
                        <div className="relative">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                defaultValue={customers.name}
                                placeholder="Enter customer name"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                aria-describedby="name-error"
                            />
                            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                        </div>
                        <div>
                            {CustomerState.errors?.name &&
                                CustomerState.errors.name.map((error: string) => (
                                    <p className="mt-2 text-sm text-red-500" key={error}>
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>
                    {/* Customer Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                            Customer Email
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={customers.email}
                                placeholder="Enter customer email"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                aria-describedby="email-error"
                            />
                            <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                        </div>
                        <div>
                            {CustomerState.errors?.email &&
                                CustomerState.errors.email.map((error: string) => (
                                    <p className="mt-2 text-sm text-red-500" key={error}>
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>
                     Customer Image
                    <div className="mb-4">
                        <label htmlFor="image" className="mb-2 block text-sm font-medium">
                            Upload Image
                        </label>
                        <div className="relative">
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            />
                            <PhotoIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Link
                        href="/dashboard/customers"
                        className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                    >
                        Cancel
                    </Link>
                    <Button type="submit">Update Customer</Button>
                </div>
            </form>
        </div>
    );
}
