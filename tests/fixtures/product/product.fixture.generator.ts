import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { ProductCreateDto } from 'src/modules/product/dto/request/product.create.dto';
import { ProductUpdateDto } from 'src/modules/product/dto/request/product.update.dto';
import { ProductTypeMap } from 'src/modules/product/entity/product.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {ProductTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): ProductTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: ProductCreateDto = {
      name: '',
      price: '',
      code: '',
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {ProductTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): ProductTypeMap[CrudType.UPDATE] => {
  const updateInput: ProductUpdateDto = {
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
