import { PrismaModule } from '../../database/prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductMapping } from './product.mapping';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductMapping, ProductRepository],
  imports: [PrismaModule],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
