import { IsOptional, IsInt, IsString, IsPositive, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClearSlotDto {
  @ApiProperty({ example: 1, description: 'Slot number to free', required: false })
  @ValidateIf((o) => !o.car_registration_no)
  @IsInt()
  @IsPositive()
  slot_number?: number;

  @ApiProperty({ example: 'KA-01-AB-2211', description: 'Car registration number', required: false })
  @ValidateIf((o) => !o.slot_number)
  @IsString()
  @IsOptional()
  car_registration_no?: string;
}