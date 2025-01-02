import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Batch to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Batch to revert.
 */
export const revertBatchToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.batch.update({
    where: { id: module_lcId },
    data: { deleted_at: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
