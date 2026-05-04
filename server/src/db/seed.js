import bcrypt from 'bcryptjs';

import { closePool, query } from '../config/db.js';
import { getDatabaseErrorMessage } from '../utils/databaseError.js';

const demoUsers = [
  {
    name: 'Maintenix Admin',
    email: 'admin@maintenix.com',
    password: 'Password123',
    role: 'admin',
    phone: '+44 20 7946 0101'
  },
  {
    name: 'Amelia Clarke',
    email: 'operative@maintenix.com',
    password: 'Password123',
    role: 'operative',
    phone: '+44 7700 900101'
  },
  {
    name: 'Northstar Housing Association',
    email: 'client@maintenix.com',
    password: 'Password123',
    role: 'client',
    phone: '+44 20 7946 0202'
  }
];

try {
  const seededUsers = {};

  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    const result = await query(
      `
        INSERT INTO users (name, email, password_hash, role, phone, is_active)
        VALUES ($1, LOWER($2), $3, $4, $5, true)
        ON CONFLICT (LOWER(email))
        DO UPDATE SET
          name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          phone = EXCLUDED.phone,
          is_active = true
        RETURNING id, email, role
      `,
      [user.name, user.email, passwordHash, user.role, user.phone]
    );

    seededUsers[result.rows[0].email] = result.rows[0];
  }

  const clients = [
    {
      name: 'Northstar Housing Association',
      contactName: 'Eleanor Price',
      email: 'repairs@northstarhousing.co.uk',
      phone: '+44 20 7946 0301',
      billingAddress: '18 Borough High Street, London, SE1 9QQ',
      clientUserEmail: 'client@maintenix.com'
    },
    {
      name: 'Harbour Estates',
      contactName: 'Marcus Bennett',
      email: 'facilities@harbourestates.co.uk',
      phone: '+44 20 7946 0302',
      billingAddress: '4 Harbour Yard, Brighton, BN1 1AA'
    },
    {
      name: 'Greenfield Property Services',
      contactName: 'Sophie Williams',
      email: 'maintenance@greenfieldpropertyservices.co.uk',
      phone: '+44 20 7946 0303',
      billingAddress: '72 Queen Street, Croydon, CR0 1SY'
    }
  ];

  const seededClients = {};

  for (const client of clients) {
    const clientUserId = client.clientUserEmail
      ? seededUsers[client.clientUserEmail]?.id || null
      : null;

    const result = await query(
      `
        INSERT INTO clients (
          client_user_id,
          name,
          contact_name,
          email,
          phone,
          billing_address
        )
        VALUES ($1, $2, $3, LOWER($4), $5, $6)
        ON CONFLICT (LOWER(email))
        DO UPDATE SET
          client_user_id = EXCLUDED.client_user_id,
          name = EXCLUDED.name,
          contact_name = EXCLUDED.contact_name,
          phone = EXCLUDED.phone,
          billing_address = EXCLUDED.billing_address
        RETURNING id, name, email
      `,
      [
        clientUserId,
        client.name,
        client.contactName,
        client.email,
        client.phone,
        client.billingAddress
      ]
    );

    seededClients[result.rows[0].name] = result.rows[0];
  }

  const properties = [
    {
      client: 'Northstar Housing Association',
      name: '24 Maple Court',
      addressLine1: '24 Maple Court',
      addressLine2: null,
      city: 'London',
      postcode: 'NW1 9EA',
      accessNotes: 'Key safe beside concierge desk. Call the housing officer on arrival.'
    },
    {
      client: 'Harbour Estates',
      name: 'Flat 12, Harbour View Block C',
      addressLine1: 'Flat 12, Harbour View Block C',
      addressLine2: '16 Marina Parade',
      city: 'Brighton',
      postcode: 'BN2 1TA',
      accessNotes: 'Parking bay C12 available for contractors.'
    },
    {
      client: 'Greenfield Property Services',
      name: '8 King Street',
      addressLine1: '8 King Street',
      addressLine2: null,
      city: 'Bristol',
      postcode: 'BS1 4EF',
      accessNotes: 'Collect keys from reception. Contractor parking is behind the building.'
    }
  ];

  const seededProperties = {};

  for (const property of properties) {
    const client = seededClients[property.client];

    const result = await query(
      `
        INSERT INTO properties (
          client_id,
          name,
          address_line1,
          address_line2,
          city,
          postcode,
          access_notes
        )
        VALUES ($1, $2, $3, $4, $5, UPPER($6), $7)
        ON CONFLICT (client_id, LOWER(name))
        DO UPDATE SET
          address_line1 = EXCLUDED.address_line1,
          address_line2 = EXCLUDED.address_line2,
          city = EXCLUDED.city,
          postcode = EXCLUDED.postcode,
          access_notes = EXCLUDED.access_notes
        RETURNING id, client_id, name
      `,
      [
        client.id,
        property.name,
        property.addressLine1,
        property.addressLine2,
        property.city,
        property.postcode,
        property.accessNotes
      ]
    );

    seededProperties[result.rows[0].name] = result.rows[0];
  }

  const adminUser = seededUsers['admin@maintenix.com'];
  const operativeUser = seededUsers['operative@maintenix.com'];

  const jobs = [
    {
      client: 'Harbour Estates',
      property: 'Flat 12, Harbour View Block C',
      title: 'Bathroom leak repair',
      description:
        'Investigate bathroom leak, isolate the source, repair pipework, and make the affected area safe.',
      status: 'in_progress',
      priority: 'urgent',
      scheduledDate: '2026-05-02',
      dueDate: '2026-05-02',
      completionDate: null,
      assignedOperativeId: operativeUser.id
    },
    {
      client: 'Northstar Housing Association',
      property: '24 Maple Court',
      title: 'Communal hallway light replacement',
      description:
        'Replace failed communal hallway light fittings and test the circuit after installation.',
      status: 'assigned',
      priority: 'high',
      scheduledDate: '2026-05-03',
      dueDate: '2026-05-05',
      completionDate: null,
      assignedOperativeId: operativeUser.id
    },
    {
      client: 'Greenfield Property Services',
      property: '8 King Street',
      title: 'Kitchen cabinet door repair',
      description:
        'Repair loose kitchen cabinet door hinges, realign the door, and confirm smooth closing.',
      status: 'assigned',
      priority: 'medium',
      scheduledDate: '2026-05-06',
      dueDate: '2026-05-08',
      completionDate: null,
      assignedOperativeId: operativeUser.id
    },
    {
      client: 'Northstar Housing Association',
      property: '24 Maple Court',
      title: 'Boiler pressure check',
      description:
        'Inspect reported low boiler pressure, repressurise the system, and confirm heating operation.',
      status: 'completed',
      priority: 'medium',
      scheduledDate: '2026-04-29',
      dueDate: '2026-05-01',
      completionDate: '2026-04-30',
      assignedOperativeId: operativeUser.id
    },
    {
      client: 'Greenfield Property Services',
      property: '8 King Street',
      title: 'Damaged fence panel replacement',
      description:
        'Remove damaged rear garden fence panel, fit matching replacement panel, and clear debris from site.',
      status: 'on_hold',
      priority: 'low',
      scheduledDate: '2026-05-07',
      dueDate: '2026-05-12',
      completionDate: null,
      assignedOperativeId: operativeUser.id
    }
  ];

  for (const job of jobs) {
    const client = seededClients[job.client];
    const property = seededProperties[job.property];

    const existing = await query(
      `
        SELECT id
        FROM jobs
        WHERE title = $1
          AND property_id = $2
        LIMIT 1
      `,
      [job.title, property.id]
    );

    if (existing.rows[0]) {
      await query(
        `
          UPDATE jobs
          SET
            client_id = $1,
            property_id = $2,
            assigned_operative_id = $3,
            description = $4,
            status = $5,
            priority = $6,
            scheduled_date = $7,
            due_date = $8,
            completion_date = $9,
            created_by = $10
          WHERE id = $11
        `,
        [
          client.id,
          property.id,
          job.assignedOperativeId,
          job.description,
          job.status,
          job.priority,
          job.scheduledDate,
          job.dueDate,
          job.completionDate,
          adminUser.id,
          existing.rows[0].id
        ]
      );
    } else {
      await query(
        `
          INSERT INTO jobs (
            client_id,
            property_id,
            assigned_operative_id,
            title,
            description,
            status,
            priority,
            scheduled_date,
            due_date,
            completion_date,
            created_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          client.id,
          property.id,
          job.assignedOperativeId,
          job.title,
          job.description,
          job.status,
          job.priority,
          job.scheduledDate,
          job.dueDate,
          job.completionDate,
          adminUser.id
        ]
      );
    }
  }

  const noteSeeds = [
    {
      title: 'Bathroom leak repair',
      property: 'Flat 12, Harbour View Block C',
      authorId: operativeUser.id,
      note:
        'Arrived on site and isolated the bathroom supply. Leak source confirmed behind bath panel.'
    },
    {
      title: 'Communal hallway light replacement',
      property: '24 Maple Court',
      authorId: operativeUser.id,
      note:
        'Replacement LED bulkheads confirmed. Access to riser cupboard arranged with site contact.'
    },
    {
      title: 'Boiler pressure check',
      property: '24 Maple Court',
      authorId: operativeUser.id,
      note:
        'Boiler repressurised to 1.4 bar and heating tested successfully before leaving site.'
    }
  ];

  for (const noteSeed of noteSeeds) {
    const property = seededProperties[noteSeed.property];
    const jobResult = await query(
      `
        SELECT id
        FROM jobs
        WHERE title = $1
          AND property_id = $2
        LIMIT 1
      `,
      [noteSeed.title, property.id]
    );

    const job = jobResult.rows[0];

    if (job) {
      await query(
        `
          INSERT INTO job_notes (job_id, user_id, note)
          SELECT $1, $2, $3
          WHERE NOT EXISTS (
            SELECT 1
            FROM job_notes
            WHERE job_id = $1
              AND user_id = $2
              AND note = $3
          )
        `,
        [job.id, noteSeed.authorId, noteSeed.note]
      );
    }
  }

  const variationSeeds = [
    {
      title: 'Bathroom leak repair',
      property: 'Flat 12, Harbour View Block C',
      description: 'Replace damaged bath waste trap and reseal the bath perimeter.',
      reason:
        'The leak investigation found a brittle waste fitting outside the original call-out scope.',
      estimatedAmount: 120,
      adminPrice: null,
      clientDecisionNote: null,
      status: 'pending_admin_review'
    },
    {
      title: 'Communal hallway light replacement',
      property: '24 Maple Court',
      description: 'Replace cracked ceiling rose discovered above the failed hallway light.',
      reason:
        'The existing ceiling rose is brittle and cannot safely hold the new fitting.',
      estimatedAmount: 180,
      adminPrice: 245,
      clientDecisionNote: null,
      status: 'pending_client_approval'
    },
    {
      title: 'Boiler pressure check',
      property: '24 Maple Court',
      description: 'Replace worn filling loop valve after completing the boiler pressure check.',
      reason:
        'The filling loop valve is passing slightly and should be replaced to prevent repeat pressure loss.',
      estimatedAmount: 95,
      adminPrice: 135,
      clientDecisionNote: 'Approved to avoid a repeat call-out for the same system fault.',
      status: 'approved'
    },
    {
      title: 'Damaged fence panel replacement',
      property: '8 King Street',
      description: 'Replace two additional weathered fence panels next to the damaged panel.',
      reason:
        'Adjacent panels are serviceable but weathered, so replacement is optional and outside the urgent repair.',
      estimatedAmount: 210,
      adminPrice: 285,
      clientDecisionNote: 'Rejected for now; client only approved replacement of the damaged panel.',
      status: 'rejected'
    }
  ];

  for (const variationSeed of variationSeeds) {
    const property = seededProperties[variationSeed.property];
    const jobResult = await query(
      `
        SELECT id
        FROM jobs
        WHERE title = $1
          AND property_id = $2
        LIMIT 1
      `,
      [variationSeed.title, property.id]
    );

    const job = jobResult.rows[0];

    if (job) {
      await query(
        `
          INSERT INTO variations (
            job_id,
            raised_by,
            reviewed_by,
            description,
            reason,
            estimated_amount,
            admin_price,
            client_decision_note,
            status
          )
          SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9
          WHERE NOT EXISTS (
            SELECT 1
            FROM variations
            WHERE job_id = $1
              AND raised_by = $2
              AND description = $4
          )
        `,
        [
          job.id,
          operativeUser.id,
          variationSeed.status === 'pending_admin_review' ? null : adminUser.id,
          variationSeed.description,
          variationSeed.reason,
          variationSeed.estimatedAmount,
          variationSeed.adminPrice,
          variationSeed.clientDecisionNote,
          variationSeed.status
        ]
      );

      await query(
        `
          UPDATE variations
          SET
            reviewed_by = $3,
            reason = $5,
            estimated_amount = $6,
            admin_price = $7,
            client_decision_note = $8,
            status = $9
          WHERE job_id = $1
            AND description = $4
            AND raised_by = $2
        `,
        [
          job.id,
          operativeUser.id,
          variationSeed.status === 'pending_admin_review' ? null : adminUser.id,
          variationSeed.description,
          variationSeed.reason,
          variationSeed.estimatedAmount,
          variationSeed.adminPrice,
          variationSeed.clientDecisionNote,
          variationSeed.status
        ]
      );
    }
  }

  console.log(
    'Demo users, clients, properties, jobs, job notes, and variations seeded successfully.'
  );
} catch (error) {
  console.error('Failed to seed demo data:');
  console.error(getDatabaseErrorMessage(error));
  process.exitCode = 1;
} finally {
  await closePool();
}
