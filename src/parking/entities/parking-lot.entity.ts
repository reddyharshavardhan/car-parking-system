import { ParkingSlot } from './parking-slot.entity';
import { Car } from './car.entity';

export class ParkingLot {
  private slots: Map<number, ParkingSlot>;
  private totalSlots: number;
  private registrationToSlotMap: Map<string, number>;
  private colorToSlotsMap: Map<string, Set<number>>;

  constructor() {
    this.slots = new Map();
    this.totalSlots = 0;
    this.registrationToSlotMap = new Map();
    this.colorToSlotsMap = new Map();
  }

  initialize(numberOfSlots: number): void {
    for (let i = 1; i <= numberOfSlots; i++) {
      this.slots.set(i, new ParkingSlot(i));
    }
    this.totalSlots = numberOfSlots;
  }

  expand(additionalSlots: number): void {
    const startSlot = this.totalSlots + 1;
    const endSlot = this.totalSlots + additionalSlots;
    
    for (let i = startSlot; i <= endSlot; i++) {
      this.slots.set(i, new ParkingSlot(i));
    }
    this.totalSlots += additionalSlots;
  }

  parkCar(car: Car): number {
    // Find the nearest available slot
    for (let i = 1; i <= this.totalSlots; i++) {
      const slot = this.slots.get(i);
      if (slot && !slot.isOccupied) {
        slot.park(car);
        
        // Update indices
        this.registrationToSlotMap.set(car.registrationNumber, i);
        
        if (!this.colorToSlotsMap.has(car.color)) {
          this.colorToSlotsMap.set(car.color, new Set());
        }
        this.colorToSlotsMap.get(car.color)!.add(i);
        
        return i;
      }
    }
    
    throw new Error('Parking lot is full');
  }

  freeSlot(slotNumber: number): number {
    const slot = this.slots.get(slotNumber);
    if (!slot) {
      throw new Error('Invalid slot number');
    }
    
    if (!slot.isOccupied) {
      throw new Error('Slot is already free');
    }
    
    const car = slot.car;
    if (!car) {
      throw new Error('No car found in slot');
    }
    
    // Remove from indices
    this.registrationToSlotMap.delete(car.registrationNumber);
    const colorSlots = this.colorToSlotsMap.get(car.color);
    if (colorSlots) {
      colorSlots.delete(slotNumber);
    }
    
    slot.free();
    return slotNumber;
  }

  freeSlotByRegistration(registrationNumber: string): number {
    const slotNumber = this.registrationToSlotMap.get(registrationNumber);
    if (!slotNumber) {
      throw new Error('Car with given registration number not found');
    }
    
    return this.freeSlot(slotNumber);
  }

    getOccupiedSlots(): Array<{ slot_no: number; registration_no: string; color: string }> {
    const occupiedSlots: Array<{ slot_no: number; registration_no: string; color: string }> = [];
    
    for (const [slotNumber, slot] of this.slots) {
      if (slot.isOccupied && slot.car) {
        occupiedSlots.push({
          slot_no: slotNumber,
          registration_no: slot.car.registrationNumber,
          color: slot.car.color,
        });
      }
    }
    
    return occupiedSlots.sort((a, b) => a.slot_no - b.slot_no);
  }

  getRegistrationNumbersByColor(color: string): string[] {
    const normalizedColor = color.toLowerCase();
    const slotNumbers = this.colorToSlotsMap.get(normalizedColor);
    
    if (!slotNumbers || slotNumbers.size === 0) {
      return [];
    }
    
    const registrationNumbers: string[] = [];
    for (const slotNumber of slotNumbers) {
      const slot = this.slots.get(slotNumber);
      if (slot?.isOccupied && slot.car) {
        registrationNumbers.push(slot.car.registrationNumber);
      }
    }
    
    return registrationNumbers.sort();
  }

  getSlotNumberByRegistration(registrationNumber: string): number {
    const slotNumber = this.registrationToSlotMap.get(registrationNumber);
    if (!slotNumber) {
      throw new Error('Car with given registration number not found');
    }
    return slotNumber;
  }

  getSlotNumbersByColor(color: string): string[] {
    const normalizedColor = color.toLowerCase();
    const slotNumbers = this.colorToSlotsMap.get(normalizedColor);
    
    if (!slotNumbers || slotNumbers.size === 0) {
      return [];
    }
    
    return Array.from(slotNumbers).sort((a, b) => a - b).map(num => num.toString());
  }

  getTotalSlots(): number {
    return this.totalSlots;
  }

  getAvailableSlots(): number {
    let count = 0;
    for (const slot of this.slots.values()) {
      if (!slot.isOccupied) {
        count++;
      }
    }
    return count;
  }

  isInitialized(): boolean {
    return this.totalSlots > 0;
  }
}