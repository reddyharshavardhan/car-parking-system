import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParkCarDto {
  @ApiProperty({ example: 'KA-01-AB-2211', description: 'Car registration number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/, {
    message: 'Invalid registration number format. Expected format: XX-00-XX-0000',
  })
  car_reg_no: string;

  @ApiProperty({ example: 'white', description: 'Car color' })
  @IsString()
  @IsNotEmpty()
  car_color: string;
}