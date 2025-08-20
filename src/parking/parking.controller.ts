import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import { CreateParkingLotDto } from './dto/create-parking-lot.dto';
import { ExpandParkingLotDto } from './dto/expand-parking-lot.dto';
import { ParkCarDto } from './dto/park-car.dto';
import { ClearSlotDto } from './dto/clear-slot.dto';

@ApiTags('parking')
@Controller()
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post('parking_lot')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize a new parking lot' })
  @ApiResponse({ status: 201, description: 'Parking lot created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createParkingLot(@Body() createParkingLotDto: CreateParkingLotDto) {
    return this.parkingService.createParkingLot(createParkingLotDto);
  }

  @Patch('parking_lot')
  @ApiOperation({ summary: 'Expand parking lot by adding more slots' })
  @ApiResponse({ status: 200, description: 'Parking lot expanded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  expandParkingLot(@Body() expandParkingLotDto: ExpandParkingLotDto) {
    return this.parkingService.expandParkingLot(expandParkingLotDto);
  }

  @Post('park')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Park a car in the parking lot' })
  @ApiResponse({ status: 201, description: 'Car parked successfully' })
  @ApiResponse({ status: 400, description: 'Parking lot full or invalid data' })
  parkCar(@Body() parkCarDto: ParkCarDto) {
    return this.parkingService.parkCar(parkCarDto);
  }

@Post('clear')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Clear a parking slot' })
@ApiResponse({ status: 200, description: 'Slot cleared successfully' })
@ApiResponse({ status: 400, description: 'Invalid slot or car not found' })
clearSlot(@Body() clearSlotDto: ClearSlotDto) {
  return this.parkingService.clearSlot(clearSlotDto);
}

  @Get('status')
  @ApiOperation({ summary: 'Get all occupied slots' })
  @ApiResponse({ status: 200, description: 'List of occupied slots' })
  getStatus() {
    return this.parkingService.getStatus();
  }

  @Get('registration_numbers/:color')
  @ApiOperation({ summary: 'Get registration numbers of all cars with a specific color' })
  @ApiParam({ name: 'color', description: 'Car color' })
  @ApiResponse({ status: 200, description: 'List of registration numbers' })
  getRegistrationNumbersByColor(@Param('color') color: string) {
    return this.parkingService.getRegistrationNumbersByColor(color);
  }

  @Get('slot_numbers/:color')
  @ApiOperation({ summary: 'Get slot numbers of all cars with a specific color' })
  @ApiParam({ name: 'color', description: 'Car color' })
  @ApiResponse({ status: 200, description: 'List of slot numbers' })
  getSlotNumbersByColor(@Param('color') color: string) {
    return this.parkingService.getSlotNumbersByColor(color);
  }

  @Get('slot_number/:registrationNumber')
  @ApiOperation({ summary: 'Get slot number by car registration number' })
  @ApiParam({ name: 'registrationNumber', description: 'Car registration number' })
  @ApiResponse({ status: 200, description: 'Slot number' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  getSlotNumberByRegistration(@Param('registrationNumber') registrationNumber: string) {
    return this.parkingService.getSlotNumberByRegistration(registrationNumber);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get parking lot statistics' })
  @ApiResponse({ status: 200, description: 'Parking lot statistics' })
  getStatistics() {
    return this.parkingService.getStatistics();
  }
}