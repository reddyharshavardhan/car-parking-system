import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExpandParkingLotDto {
  @ApiProperty({ example: 3, description: 'Number of slots to add' })
  @IsInt()
  @IsPositive()
  increment_slot: number;
}