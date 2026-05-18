import { PrismaClient, CertificationStatus, ValidationStatus } from '../lib/generated/prisma'
import { PrismaPg } from "@prisma/adapter-pg";
import pg from 'pg';
import 'dotenv/config'

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding...')

  // 1. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@halaltourism.com' },
    update: {},
    create: {
      id: 'user_admin_01',
      name: 'Super Admin',
      email: 'admin@halaltourism.com',
      role: 'admin',
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@warunghalal.com' },
    update: {},
    create: {
      id: 'user_owner_01',
      name: 'Ahmad Halal',
      email: 'owner@warunghalal.com',
      role: 'umkm_owner',
    },
  })

  // 2. Create Categories
  const catKuliner = await prisma.category.upsert({
    where: { slug: 'kuliner-halal' },
    update: {},
    create: {
      name: 'Kuliner Halal',
      slug: 'kuliner-halal',
      description: 'Makanan dan minuman yang terjamin kehalalannya.',
    },
  })

  const catReligi = await prisma.category.upsert({
    where: { slug: 'wisata-religi' },
    update: {},
    create: {
      name: 'Wisata Religi',
      slug: 'wisata-religi',
      description: 'Destinasi wisata berbasis keagamaan dan sejarah Islam.',
    },
  })

  // 3. Create Halal Facilities
  const facilityMosque = await prisma.halalFacility.create({
    data: {
      name: 'Masjid Jami',
      description: 'Masjid luas dengan fasilitas wudhu lengkap.',
      facilityType: 'Ibadah',
    }
  })

  const facilityHalalFood = await prisma.halalFacility.create({
    data: {
      name: 'Area Food Court Halal',
      description: 'Seluruh tenant makanan di area ini tersertifikasi halal.',
      facilityType: 'Kuliner',
    }
  })

  // 4. Create Destination
  const destination = await prisma.destination.upsert({
    where: { slug: 'masjid-raya-bandung' },
    update: {},
    create: {
      name: 'Masjid Raya Bandung',
      slug: 'masjid-raya-bandung',
      categoryId: catReligi.id,
      description: 'Masjid ikonik di pusat kota Bandung dengan alun-alun yang luas.',
      address: 'Jl. Asia Afrika, Balonggede, Kec. Regol',
      city: 'Bandung',
      province: 'Jawa Barat',
      latitude: -6.9218,
      longitude: 107.6069,
      destinationHalalFacilities: {
        create: [
          { facilityId: facilityMosque.id },
          { facilityId: facilityHalalFood.id }
        ]
      }
    },
  })

  // 5. Create UMKM
  const umkm = await prisma.umkm.upsert({
    where: { slug: 'warung-nasi-halal-berkah' },
    update: {},
    create: {
      name: 'Warung Nasi Halal Berkah',
      slug: 'warung-nasi-halal-berkah',
      ownerId: owner.id,
      categoryId: catKuliner.id,
      destinationId: destination.id,
      description: 'Menyediakan nasi rames dengan berbagai pilihan lauk pauk yang lezat dan 100% halal.',
      address: 'Samping Gerbang Utara Masjid Raya Bandung',
      phone: '081234567890',
      latitude: -6.9215,
      longitude: 107.6072,
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=800',
            caption: 'Tampak Depan Warung',
            isPrimary: true
          }
        ]
      },
      certifications: {
        create: {
          certificateNo: 'ID32110000123450122',
          issuer: 'BPJPH / MUI',
          issuedAt: new Date('2024-01-01'),
          expiredAt: new Date('2028-01-01'),
          status: CertificationStatus.VALID,
          documentUrl: 'https://example.com/halal-cert.pdf',
          validations: {
            create: {
              status: ValidationStatus.APPROVED,
              notes: 'Dokumen lengkap dan valid.',
              validatedAt: new Date(),
            }
          }
        }
      }
    },
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
