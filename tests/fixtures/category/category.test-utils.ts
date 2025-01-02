import { PrismaClient, StatusEnum } from '@prisma/client';

/**
 * Reverts Category to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} module_lcId - The id of the Category to revert.
 */
export const revertCategoryToInitialState = async (
  prisma: PrismaClient,
  module_lcId: string,
) => {
  await prisma.category.update({
    where: { id: module_lcId },
    data: { deleted_at: null, status: StatusEnum.ACTIVE, version: 1 },
  });
};
