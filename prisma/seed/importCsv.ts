import fs from 'fs';
import csv from 'csv-parser';
import { logger } from './utils/logger';
import { getEntityType } from './categoryMapper';
import { processDestination } from './destinationSeeder';
import { processUmkm } from './umkmSeeder';
import { prisma } from '../../lib/prisma';
import { ensureDefaultFacilities } from './facilitySeeder';

const BATCH_SIZE = 50;

export async function importCsv(filePath: string) {
  if (!fs.existsSync(filePath)) {
    logger.error(`File not found: ${filePath}`);
    return;
  }

  logger.info(`Starting import from ${filePath}...`);
  
  // Ensure default facilities exist globally first
  await ensureDefaultFacilities();

  let totalProcessed = 0;
  let successCount = 0;
  let errorCount = 0;
  let batch: any[] = [];

  const processBatch = async (rows: any[]) => {
    try {
      await prisma.$transaction(async (tx) => {
        for (const row of rows) {
          if (!row.NAME || !row.CATEGORY) {
            logger.warn(`Skipping row missing NAME or CATEGORY: ${JSON.stringify(row)}`);
            continue;
          }

          const type = getEntityType(row.CATEGORY);
          
          if (type === 'destination') {
            await processDestination(row, tx);
          } else {
            await processUmkm(row, tx);
          }
          successCount++;
        }
      }, {
        timeout: 60000 // 60s timeout for batch
      });
    } catch (err: any) {
      // If a batch fails, we log it. In a real production app, 
      // you might want to retry row-by-row or log specific failures.
      logger.error(`Batch failed!`, err.message);
      errorCount += rows.length;
    }
    totalProcessed += rows.length;
    logger.info(`Progress: ${totalProcessed} rows processed...`);
  };

  const results: any[] = [];
  const stream = fs.createReadStream(filePath).pipe(csv());

  for await (const row of stream) {
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      await processBatch(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await processBatch(batch);
  }

  logger.success(`Import completed!`);
  logger.info(`Total: ${totalProcessed}, Success: ${successCount}, Failed: ${errorCount}`);
}
