import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { FileDto } from './dto/response/file.dto';
import { FileEntity } from './entity/file.entity';

@Injectable()
export class FileMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      const baseMapper = createMap(
        mapper,
        FileEntity,
        FileDto,
        forMember(
          (destination) => destination.id,
          mapFrom((source) => source.id),
        ),
      );
    };
  }
}
