import { PrismaClient, UserRole, ObligationFrequency, ObligationCriticality, ObligationFieldType, TaskStatus, TaskType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with comprehensive realistic data...');

  // Clear existing data (Order matters for Foreign Keys!)
  // 1. Logs & Sessions
  try { await prisma.auditLog.deleteMany(); } catch (e) { }

  // 2. Business Data
  await prisma.task.deleteMany();
  await prisma.submissionCheck.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.submissionPeriod.deleteMany();
  await prisma.station.deleteMany();

  // 3. Core Users & Companies
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.obligation.deleteMany();
  console.log('Cleared existing data');

  // 1. Create Companies
  const alpha = await prisma.company.upsert({
    where: { taxId: 'EL094012345' },
    update: {},
    create: { name: 'Alpha Petroleum S.A.', taxId: 'EL094012345' },
  });

  const beta = await prisma.company.upsert({
    where: { taxId: 'EL099876543' },
    update: {},
    create: { name: 'Beta Fuels Ltd.', taxId: 'EL099876543' },
  });

  console.log('Created companies');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@alpha.gr', role: UserRole.COMPANY_ADMIN, companyId: alpha.id },
    { email: 'user@alpha.gr', role: UserRole.COMPANY_OPERATOR, companyId: alpha.id },
    { email: 'admin@beta.gr', role: UserRole.COMPANY_ADMIN, companyId: beta.id },
    { email: 'user@beta.gr', role: UserRole.COMPANY_OPERATOR, companyId: beta.id },
    { email: 'reviewer@customs.gov.gr', role: UserRole.CUSTOMS_REVIEWER, companyId: null },
    { email: 'admin@system.gov.gr', role: UserRole.SYSTEM_ADMIN, companyId: null },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash },
      create: {
        email: u.email,
        passwordHash,
        role: u.role,
        companyId: u.companyId
      }
    });
  }
  console.log('Created users');

  // 3. Create Obligations Catalog
  const catalogVersion = await prisma.obligationCatalogVersion.upsert({
    where: { version: '2025.1' },
    update: {},
    create: { version: '2025.1', effectiveDate: new Date('2025-01-01') },
  });

  const obligationsData = [
    { code: 'OBL-001', title: 'ΤΗΡΗΣΗ ΣΤΟΙΧΕΙΩΝ ΦΟΡΟΛΟΓΙΚΟΥ ΜΗΤΡΩΟΥ', fieldType: ObligationFieldType.BOOLEAN, criticality: ObligationCriticality.CRITICAL },
    { code: 'OBL-002', title: 'ΑΔΕΙΑ ΛΕΙΤΟΥΡΓΙΑΣ ΠΡΑΤΗΡΙΟΥ', fieldType: ObligationFieldType.DATE, criticality: ObligationCriticality.CRITICAL }, // Needs Valid Date
    { code: 'OBL-003', title: 'ΒΕΒΑΙΩΣΗ ΟΓΚΟΜΕΤΡΗΣΗΣ ΔΕΞΑΜΕΝΩΝ', fieldType: ObligationFieldType.DATE, criticality: ObligationCriticality.MAJOR },
    { code: 'OBL-004', title: 'ΕΓΚΡΙΣΕΙΣ ΤΥΠΟΥ ΑΝΤΛΙΩΝ', fieldType: ObligationFieldType.BOOLEAN, criticality: ObligationCriticality.MAJOR },
    { code: 'OBL-005', title: 'ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ ΣΥΝΕΡΓΕΙΟΥ', fieldType: ObligationFieldType.BOOLEAN, criticality: ObligationCriticality.MAJOR },
    { code: 'OBL-006', title: 'ΥΠΕΥΘΥΝΗ ΔΗΛΩΣΗ ΕΓΚΑΤΑΣΤΑΤΗ', fieldType: ObligationFieldType.BOOLEAN, criticality: ObligationCriticality.CRITICAL },
    { code: 'OBL-007', title: 'ΕΞΕΤΑΣΗ ΔΕΙΓΜΑΤΩΝ ΚΑΥΣΙΜΩΝ', fieldType: ObligationFieldType.BOOLEAN, criticality: ObligationCriticality.MINOR },
  ];

  const obligations = [];
  for (const o of obligationsData) {
    const ob = await prisma.obligation.upsert({
      where: { code_catalogVersionId: { code: o.code, catalogVersionId: catalogVersion.id } },
      update: {},
      create: { ...o, description: o.title, frequency: ObligationFrequency.PER_10_DAY, triggerAction: 'none', catalogVersionId: catalogVersion.id }
    });
    obligations.push(ob);
  }

  // 4. Create Stations (10 Alpha, 10 Beta)
  // ~15% bad stations = 3 stations total (e.g. 2 Alpha, 1 Beta)
  const stationConfigs = [
    // Alpha Stations (Athens Area)
    { name: 'Alpha Kifisias', address: 'Leof. Kifisias 100, Marousi 15125', isProblematic: false, companyId: alpha.id, amdika: '094012345' },
    { name: 'Alpha Glyfada', address: 'Leof. Poseidonos 45, Glyfada 16675', isProblematic: false, companyId: alpha.id, amdika: '094012346' },
    // Alpha Stations (Athens Area)
    { name: 'Alpha Peiraias', address: 'Akti Miaouli 10, Peiraias 18535', isProblematic: true, companyId: alpha.id, amdika: '094012347', lat: 37.9429, lng: 23.6470 }, // Problematic
    { name: 'Alpha Peristeri', address: 'Thivon 150, Peristeri 12134', isProblematic: false, companyId: alpha.id, lat: 38.0090, lng: 23.6931 },
    { name: 'Alpha Syntagma', address: 'Leof. Amalias 2, Athens 10557', isProblematic: false, companyId: alpha.id, lat: 37.9755, lng: 23.7348 },
    { name: 'Alpha Chalandri', address: 'Leof. Pentelis 55, Chalandri 15233', isProblematic: false, companyId: alpha.id, lat: 38.0219, lng: 23.7995 },
    { name: 'Alpha Nea Smyrni', address: 'Leof. Syggrou 200, Nea Smyrni 17121', isProblematic: true, companyId: alpha.id, lat: 37.9463, lng: 23.7162 }, // Problematic
    { name: 'Alpha Egaleo', address: 'Iera Odos 200, Egaleo 12241', isProblematic: false, companyId: alpha.id, lat: 37.9897, lng: 23.6826 },
    { name: 'Alpha Kallithea', address: 'Thiseos 100, Kallithea 17671', isProblematic: false, companyId: alpha.id, lat: 37.9542, lng: 23.7003 },
    { name: 'Alpha Alimos', address: 'Leof. Vouliagmenis 500, Alimos 17456', isProblematic: false, companyId: alpha.id, lat: 37.9157, lng: 23.7226 },
    { name: 'Alpha Glyfada', address: 'Leof. Poseidonos 33, Glyfada 16675', isProblematic: false, companyId: alpha.id, lat: 37.8631, lng: 23.7431 },
    { name: 'Alpha Kifisia', address: 'Leof. Kifisias 250, Kifisia 14562', isProblematic: false, companyId: alpha.id, lat: 38.0776, lng: 23.8111 },

    // Beta Stations (Thessaloniki Area)
    { name: 'Beta Tsimiski', address: 'Tsimiski 50, Thessaloniki 54623', isProblematic: false, companyId: beta.id, lat: 40.6321, lng: 22.9406 },
    { name: 'Beta Kalamaria', address: 'Ethnikis Antistaseos 40, Kalamaria 55133', isProblematic: false, companyId: beta.id, lat: 40.5843, lng: 22.9468 },
    { name: 'Beta Toumpa', address: 'Grigoriou Lampraki 150, Thessaloniki 54351', isProblematic: true, companyId: beta.id, lat: 40.6127, lng: 22.9730 }, // Problematic
    { name: 'Beta Evosmos', address: 'Megalu Alexandrou 80, Evosmos 56224', isProblematic: false, companyId: beta.id, lat: 40.6622, lng: 22.9103 },
    { name: 'Beta Pylaia', address: 'Leof. Georgikis Scholis 60, Pylaia 57001', isProblematic: false, companyId: beta.id, lat: 40.5985, lng: 22.9860 },
    { name: 'Beta Thermi', address: 'Main Road Thermi, Thermi 57001', isProblematic: false, companyId: beta.id, lat: 40.5471, lng: 23.0202 },
    { name: 'Beta Stavroupoli', address: 'Lagkada 200, Stavroupoli 56430', isProblematic: false, companyId: beta.id, lat: 40.6695, lng: 22.9320 },
    { name: 'Beta Ampelokipoi', address: 'Monastiriou 150, Ampelokipoi 56123', isProblematic: false, companyId: beta.id, lat: 40.6500, lng: 22.9242 },
    { name: 'Beta Panorama', address: 'Komninon 20, Panorama 55236', isProblematic: false, companyId: beta.id, lat: 40.5898, lng: 23.0361 },
    { name: 'Beta Oreokastro', address: 'Dimokratias 15, Oreokastro 57013', isProblematic: false, companyId: beta.id, lat: 40.7300, lng: 22.9189 },
  ];

  const createdStations = [];
  for (const s of stationConfigs) {
    const baseSlug = s.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    // Simple unique slug logic for seed data - append random string if needed or just trust unique names in seed
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const station = await prisma.station.create({
      data: {
        name: s.name,
        companyId: s.companyId,
        address: s.address,
        amdika: s.amdika || Math.random().toString().slice(2, 11),
        isActive: true,
        installationType: 'Πρατήριο Υγρών Καυσίμων',
        city: s.address.split(',').pop()?.trim().replace(/[0-9]/g, '').trim(),
        lat: s.lat,
        lng: s.lng,
        slug: slug
      }
    });
    // @ts-ignore
    station.isProblematic = s.isProblematic;
    createdStations.push(station);
  }
  console.log(`Created ${createdStations.length} stations`);

  // 5. Generate Periods (36 Periods = 1 Year)
  // Assuming current date is Jan 2026. We generate for entire year of 2025.
  const periods = [];
  const startYear = 2025;

  for (let month = 1; month <= 12; month++) {
    const lastDayOfMonth = new Date(startYear, month, 0).getDate();

    // Period 1: 1-10
    periods.push({
      start: new Date(startYear, month - 1, 1),
      end: new Date(startYear, month - 1, 10),
      deadline: new Date(startYear, month - 1, 12),
      pNum: 1, month, year: startYear
    });
    // Period 2: 11-20
    periods.push({
      start: new Date(startYear, month - 1, 11),
      end: new Date(startYear, month - 1, 20),
      deadline: new Date(startYear, month - 1, 22),
      pNum: 2, month, year: startYear
    });
    // Period 3: 21-End
    periods.push({
      start: new Date(startYear, month - 1, 21),
      end: new Date(startYear, month - 1, lastDayOfMonth),
      deadline: new Date(startYear, month, 2), // 2nd of next month
      pNum: 3, month, year: startYear
    });
  }

  // Current Active Period (Jan 1-10 2026)
  periods.push({
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 10),
    deadline: new Date(2026, 0, 12),
    pNum: 1, month: 1, year: 2026
  });

  const dbPeriods = [];
  for (const p of periods) {
    const prd = await prisma.submissionPeriod.upsert({
      where: { periodNumber_month_year: { periodNumber: p.pNum, month: p.month, year: p.year } },
      update: {},
      create: {
        startDate: p.start, endDate: p.end, deadlineDate: p.deadline,
        periodNumber: p.pNum, month: p.month, year: p.year
      } // @ts-ignore
    });
    // @ts-ignore
    prd.config = p;
    dbPeriods.push(prd);
  }
  console.log(`Created ${dbPeriods.length} periods`);

  // 6. Generate Submissions and Tasks
  // "Problematic" stations: 
  //   - 30% chance of MISSING submission
  //   - 30% chance of BAD data (expired cert)
  //   - 40% chance of OK submission
  // "Good" stations:
  //   - 95% chance of OK submission
  //   - 5% chance of LATE submission (but compliant)

  for (const station of createdStations) {
    // @ts-ignore
    const isProblematic = station.isProblematic;
    const operatorId = station.companyId === alpha.id ? users[1].email : users[3].email; // get email, need ID but wait
    const user = await prisma.user.findUnique({ where: { email: operatorId } });

    for (const period of dbPeriods) {
      // Logic for this specific submission
      const rand = Math.random();
      let status = 'APPROVED';
      let issueType = 'NONE'; // NONE, MISSING, EXPIRED_CERT, OPEN_TASK

      if (isProblematic) {
        if (rand < 0.3) issueType = 'MISSING';
        else if (rand < 0.6) issueType = 'EXPIRED_CERT';
        else if (rand < 0.7) issueType = 'OPEN_TASK';
      } else {
        // Good station
        if (rand < 0.02) issueType = 'MISSING'; // Very rare miss
        else if (rand < 0.05) issueType = 'OPEN_TASK'; // Rare task
      }

      // If Current Active Period (2026), nearly everyone hasn't submitted yet except maybe 1 or 2
      // @ts-ignore
      if (period.year === 2026) {
        if (Math.random() > 0.1) continue; // 90% haven't submitted yet for current period
        status = 'DRAFT'; // Or submitted
      }

      if (issueType === 'MISSING') continue; // No submission created

      // Create Submission
      const submission = await prisma.submission.create({
        data: {
          periodId: period.id,
          stationId: station.id,
          companyId: station.companyId,
          status: status as any,
          submittedAt: new Date(period.deadlineDate.getTime() - Math.random() * 86400000 * 2),
          submittedById: user?.id,
          reviewedAt: status === 'APPROVED' ? new Date() : null,
          reviewedById: status === 'APPROVED' ? (await prisma.user.findUnique({ where: { email: 'reviewer@customs.gov.gr' } }))?.id : null
        }
      });

      // Create Checks
      for (const obl of obligations) {
        let value = 'YES';

        // Handle Issues
        if (issueType === 'EXPIRED_CERT' && obl.code === 'OBL-002') {
          value = JSON.stringify({ answer: 'YES', validUntil: '2023-01-01' }); // Expired
        } else if (obl.fieldType === ObligationFieldType.DATE) {
          value = JSON.stringify({ answer: 'YES', validUntil: '2030-01-01' }); // Valid
        }

        await prisma.submissionCheck.create({
          data: {
            submissionId: submission.id,
            obligationId: obl.id,
            value: value
          }
        });
      }

      // Create Tasks (Open Issues)
      if (issueType === 'OPEN_TASK') {
        const task = await prisma.task.create({
          data: {
            title: `Safety Violation: Pump ${Math.floor(Math.random() * 5) + 1} Leakage`,
            description: 'Severe nozzle leakage detected during periodic inspection. Immediate repair required.',
            status: 'AWAITING_COMPANY',
            type: 'ACTION',
            severity: 'CRITICAL',
            category: 'CALIBRATION',
            stationId: station.id,
            originSubmissionId: submission.id, // Link to the submission that triggered this
            createdById: (await prisma.user.findFirst({ where: { role: 'CUSTOMS_REVIEWER' } }))?.id || user!.id,
            dueDate: new Date(Date.now() + 86400000 * 10) // +10 days
          }
        });

        // Add a message from Customs
        await prisma.taskMessage.create({
          data: {
            taskId: task.id,
            userId: (await prisma.user.findFirst({ where: { role: 'CUSTOMS_REVIEWER' } }))?.id || user!.id,
            content: 'Please provide the calibration certificate after repair.'
          }
        });
      }

      // Create a Sanction for problematic stations sometimes
      if (isProblematic && rand < 0.1) {
        await prisma.task.create({
          data: {
            title: 'Operation Suspension Warning',
            description: 'Repeated non-compliance detected. Submit explanation within 5 days.',
            status: 'ESCALATED',
            type: 'SANCTION',
            severity: 'CRITICAL',
            category: 'LICENSE',
            stationId: station.id,
            createdById: (await prisma.user.findFirst({ where: { role: 'CUSTOMS_REVIEWER' } }))?.id || user!.id,
            dueDate: new Date(Date.now() + 86400000 * 5)
          }
        });
      }
    }
  }

  console.log('Seeding Completed successfully with comprehensive data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

