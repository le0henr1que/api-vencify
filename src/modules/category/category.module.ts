import { PrismaModule } from '../../database/prisma/prisma.module';
import { CategoryController } from './category.controller';
import { CategoryMapping } from './category.mapping';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapping, CategoryRepository],
  imports: [PrismaModule],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
