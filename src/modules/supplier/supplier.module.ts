import { PrismaModule } from '../../database/prisma/prisma.module';
import { SupplierController } from './supplier.controller';
import { SupplierMapping } from './supplier.mapping';
import { SupplierRepository } from './supplier.repository';
import { SupplierService } from './supplier.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [SupplierController],
  providers: [SupplierService, SupplierMapping, SupplierRepository],
  imports: [PrismaModule],
  exports: [SupplierService, SupplierRepository],
})
export class SupplierModule {}
