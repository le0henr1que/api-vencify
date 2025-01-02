import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { BatchCreateDto } from 'src/modules/batch/dto/request/batch.create.dto';
import { BatchUpdateDto } from 'src/modules/batch/dto/request/batch.update.dto';
import { BatchTypeMap } from 'src/modules/batch/entity/batch.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {BatchTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): BatchTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: BatchCreateDto = {
      product_id: '',
      batchCode: '',
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {BatchTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): BatchTypeMap[CrudType.UPDATE] => {
  const updateInput: BatchUpdateDto = {
    version: 1,
  };

  return updateInput;
};

/**
 * Generates a partial entity and removes specified fields.
 *
 * @param {string[]} removeFields - An array of field names to remove from the entity.
 * @returns The generated partial entity.
 */
export const generatePartialEntity = (removeFields: string[] = []) => {
  const entity = generateCreateInput();
  removeFields.forEach((field) => {
    delete entity[field];
  });

  return entity;
};
