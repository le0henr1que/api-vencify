import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Product to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Product to revert.
 */
export const revertProductToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.product.update({
    where: { id: module_lcId },
    data: { deleted_at: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
