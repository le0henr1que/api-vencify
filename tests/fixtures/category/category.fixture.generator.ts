import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { CategoryCreateDto } from 'src/modules/category/dto/request/category.create.dto';
import { CategoryUpdateDto } from 'src/modules/category/dto/request/category.update.dto';
import { CategoryTypeMap } from 'src/modules/category/entity/category.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {CategoryTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): CategoryTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: CategoryCreateDto = {
      name: '',
      supplier_id: '',
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {CategoryTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): CategoryTypeMap[CrudType.UPDATE] => {
  const updateInput: CategoryUpdateDto = {
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
