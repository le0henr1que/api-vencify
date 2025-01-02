import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Supplier to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Supplier to revert.
 */
export const revertSupplierToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.supplier.update({
    where: { id: module_lcId },
    data: { deleted_at: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
