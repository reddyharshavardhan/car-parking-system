import { Car } from './car.entity';

export class ParkingSlot {
  slotNumber: number;
  isOccupied: boolean;
  car?: Car;

  constructor(slotNumber: number) {
    this.slotNumber = slotNumber;
    this.isOccupied = false;
    this.car = undefined;
  }

  park(car: Car): void {
    this.isOccupied = true;
    this.car = car;
  }

  free(): void {
    this.isOccupied = false;
    this.car = undefined;
  }
}