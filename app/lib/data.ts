import {formatCurrency} from './utils';
import connectionDb from "@/app/lib/connectionDb";
import Revenue from '@/app/models/Revenue';
import Invoice from "@/app/models/Invoice";
import Customer from "@/app/models/Customer";

// export async function fetchRevenue() {
//   try {
//     // Artificially delay a response for demo purposes.
//     // Don't do this in production :)
//
//     // console.log('Fetching revenue data...');
//     // await new Promise((resolve) => setTimeout(resolve, 3000));
//
//     const data = await sql<Revenue>`SELECT * FROM revenue`;
//
//     // console.log('Data fetch completed after 3 seconds.');
//
//     return data.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   }
// }

export async function fetchRevenue() {
  try {
    await connectionDb();

    // Fetch data from MongoDB
    return await Revenue.find({});
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// export async function fetchLatestInvoices() {
//   try {
//     const data = await sql<LatestInvoiceRaw>`
//       SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       ORDER BY invoices.date DESC
//       LIMIT 5`;
//
//     return data.rows.map((invoice) => ({
//       ...invoice,
//       amount: formatCurrency(invoice.amount),
//     }));
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch the latest invoices.');
//   }
// }

export async function fetchLatestInvoices() {
  try {
    await connectionDb();


    const data = await Invoice.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer_id',
          foreignField: '_id',
          as: 'customer_details'
        }
      },
      { $unwind: '$customer_details' },
      { $sort: { date: -1 } },
      { $limit: 5 },
      {
        $project: {
          amount: 1,
          'customer_details.name': 1,
          'customer_details.image_url': 1,
          'customer_details.email': 1,
          id: '$_id'
        }
      }
    ]);

    return data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount)
    }));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// export async function fetchCardData() {
//   try {
//     // You can probably combine these into a single SQL query
//     // However, we are intentionally splitting them to demonstrate
//     // how to initialize multiple queries in parallel with JS.
//     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
//     const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
//     const invoiceStatusPromise = sql`SELECT
//          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
//          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
//          FROM invoices`;
//
//     const data = await Promise.all([
//       invoiceCountPromise,
//       customerCountPromise,
//       invoiceStatusPromise,
//     ]);
//
//     const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
//     const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
//     const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
//     const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
//
//     return {
//       numberOfCustomers,
//       numberOfInvoices,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch card data.');
//   }
// }

export async function fetchCardData() {
  try {
    await connectionDb();

    // Fetching data in parallel
    const [
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ] = await Promise.all([
      Invoice.countDocuments({}),
      Customer.countDocuments({}),
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] } },
          }
        }
      ]),
    ]);

    const numberOfInvoices = invoiceCountPromise;
    const numberOfCustomers = customerCountPromise;
    const totalPaidInvoices = formatCurrency(invoiceStatusPromise[0]?.paid ?? 0);
    const totalPendingInvoices = formatCurrency(invoiceStatusPromise[0]?.pending ?? 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 10;
// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;
//
//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;
//
//     return invoices.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }

export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    await connectionDb();

    // Fetching data in parallel
    return await Invoice.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer_id',
          foreignField: '_id',
          as: 'customer_info'
        }
      },
      {$unwind: '$customer_info'},
      {
        $match: {
          $or: [
            {'customer_info.name': {$regex: query, $options: 'i'}},
            {'customer_info.email': {$regex: query, $options: 'i'}},
            {'amount': {$regex: query, $options: 'i'}},
            {'date': {$regex: query, $options: 'i'}},
            {'status': {$regex: query, $options: 'i'}}
          ]
        }
      },
      {$sort: {'date': -1}},
      {$skip: offset},
      {$limit: ITEMS_PER_PAGE},
      {
        $project: {
          id: '$_id',
          amount: 1,
          date: 1,
          status: 1,
          'customer_info.name': 1,
          'customer_info.email': 1,
          'customer_info.image_url': 1
        }
      }
    ]);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
  // return invoices.rows;
}

// export async function fetchInvoicesPages(query: string) {
//   try {
//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;
//
//     return Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }

export async function fetchInvoicesPages(query: string) {
  const ITEMS_PER_PAGE = 10; // Define your ITEMS_PER_PAGE if not already defined

  try {

    await connectionDb();
    const count = await Invoice.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer_id',
          foreignField: '_id',
          as: 'customer_info'
        }
      },
      { $unwind: '$customer_info' },
      {
        $match: {
          $or: [
            { 'customer_info.name': { $regex: query, $options: 'i' } },
            { 'customer_info.email': { $regex: query, $options: 'i' } },
            { 'amount': { $regex: query, $options: 'i' } },
            { 'date': { $regex: query, $options: 'i' } },
            { 'status': { $regex: query, $options: 'i' } }
          ]
        }
      },
      { $count: 'total' }
    ]);

    return Math.ceil(Number(count[0]?.total ?? 0) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

// export async function fetchInvoiceById(id: string) {
//   try {
//     const data = await sql<InvoiceForm>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;
//
//     const invoice = data.rows.map((invoice) => ({
//       ...invoice,
//       // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));
//
//     return invoice[0];
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoice.');
//   }
// }

export async function fetchInvoiceById(id: string) {

  try {
    await connectionDb();

    // Fetch data from MongoDB
    const invoice = await Invoice.findById(id);

    if (!invoice) {
     return {message: 'Invoice not found'}
    }

    return invoice;


  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// export async function fetchCustomers() {
//   try {
//     const data = await sql<CustomerField>`
//       SELECT
//         id,
//         name
//       FROM customers
//       ORDER BY name ASC
//     `;
//
//     return data.rows;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }

export async function fetchCustomers() {
  try {
    await connectionDb();

    // Fetch data from MongoDB
    return await Customer.find();
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    await connectionDb();

    // Fetch data from MongoDB
    return await Customer.findById(id);
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer.');
  }
}

// customer
export async function fetchCustomersPages(query: string) {
  const ITEMS_PER_PAGE = 10; // Define your ITEMS_PER_PAGE if not already defined

  try{
    await connectionDb();

    const count = await Customer.aggregate([
      {
        $match: {
          $or: [
            { 'name': { $regex: query, $options: 'i' } },
            { 'email': { $regex: query, $options: 'i' } },
          ]
        }
      },
      { $count: 'total' }
    ]);

    return Math.ceil(Number(count[0]?.total ?? 0) / ITEMS_PER_PAGE);

  }catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
  }
}

export async function fetchFilteredCustomers(query: string, currentPage: number) {

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    await connectionDb();

    // Fetch data from MongoDB
    return await Customer.aggregate([
      {
        $match: {
          $or: [
            { 'name': { $regex: query, $options: 'i' } },
            { 'email': { $regex: query, $options: 'i' } },
          ]
        }
      },
      { $skip: offset },
      { $limit: ITEMS_PER_PAGE },
    ])
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customers.');
  }

}

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;
//
//     return data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }
