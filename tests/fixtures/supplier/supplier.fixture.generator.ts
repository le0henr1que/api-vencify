import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { SupplierCreateDto } from 'src/modules/supplier/dto/request/supplier.create.dto';
import { SupplierUpdateDto } from 'src/modules/supplier/dto/request/supplier.update.dto';
import { SupplierTypeMap } from 'src/modules/supplier/entity/supplier.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {SupplierTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): SupplierTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: SupplierCreateDto = {
      name: '',
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {SupplierTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): SupplierTypeMap[CrudType.UPDATE] => {
  const updateInput: SupplierUpdateDto = {
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
