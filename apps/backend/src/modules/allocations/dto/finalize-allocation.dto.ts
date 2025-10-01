import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class AllocationItemDto {
  @IsString()
  projectId!: string;

  @IsNumber()
  hours!: number;
}

export class FinalizeAllocationDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AllocationItemDto)
  allocations!: AllocationItemDto[];
}
