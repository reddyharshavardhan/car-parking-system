import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ParkingLot } from './entities/parking-lot.entity';
import { Car } from './entities/car.entity';
import { CreateParkingLotDto } from './dto/create-parking-lot.dto';
import { ExpandParkingLotDto } from './dto/expand-parking-lot.dto';
import { ParkCarDto } from './dto/park-car.dto';
import { ClearSlotDto } from './dto/clear-slot.dto';

@Injectable()
export class ParkingService {
  private parkingLot: ParkingLot;

  constructor() {
    this.parkingLot = new ParkingLot();
  }

  createParkingLot(createParkingLotDto: CreateParkingLotDto) {
    if (this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is already initialized');
    }

        this.parkingLot.initialize(createParkingLotDto.no_of_slot);
    
    return {
      total_slot: this.parkingLot.getTotalSlots(),
    };
  }

  expandParkingLot(expandParkingLotDto: ExpandParkingLotDto) {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    this.parkingLot.expand(expandParkingLotDto.increment_slot);
    
    return {
      total_slot: this.parkingLot.getTotalSlots(),
    };
  }

  parkCar(parkCarDto: ParkCarDto) {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    try {
      const car = new Car(parkCarDto.car_reg_no, parkCarDto.car_color);
      const slotNumber = this.parkingLot.parkCar(car);
      
      return {
        allocated_slot_number: slotNumber,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  clearSlot(clearSlotDto: ClearSlotDto) {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    try {
      let freedSlotNumber: number;
      
      if (clearSlotDto.slot_number) {
        freedSlotNumber = this.parkingLot.freeSlot(clearSlotDto.slot_number);
      } else if (clearSlotDto.car_registration_no) {
        freedSlotNumber = this.parkingLot.freeSlotByRegistration(clearSlotDto.car_registration_no);
      } else {
        throw new BadRequestException('Either slot_number or car_registration_no must be provided');
      }
      
      return {
        freed_slot_number: freedSlotNumber,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  getStatus() {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    return this.parkingLot.getOccupiedSlots();
  }

  getRegistrationNumbersByColor(color: string) {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    return this.parkingLot.getRegistrationNumbersByColor(color);
  }

  getSlotNumbersByColor(color: string) {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    return this.parkingLot.getSlotNumbersByColor(color);
  }

  getSlotNumberByRegistration(registrationNumber: string) {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    try {
      return {
        slot_number: this.parkingLot.getSlotNumberByRegistration(registrationNumber),
      };
    } catch (error: any) {
      throw new NotFoundException(error.message);
    }
  }

  // Additional feature: Get parking lot statistics
    getStatistics() {
    if (!this.parkingLot.isInitialized()) {
      throw new BadRequestException('Parking lot is not initialized');
    }

    const totalSlots = this.parkingLot.getTotalSlots();
    const availableSlots = this.parkingLot.getAvailableSlots();
    const occupiedSlots = totalSlots - availableSlots;

    return {
      total_slots: totalSlots,
      occupied_slots: occupiedSlots,
      available_slots: availableSlots,
      occupancy_rate: ((occupiedSlots / totalSlots) * 100).toFixed(2) + '%',
    };
  }
}