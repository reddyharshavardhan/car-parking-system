import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParkingLotDto {
  @ApiProperty({ example: 6, description: 'Number of parking slots' })
  @IsInt()
  @IsPositive()
  no_of_slot: number;
}