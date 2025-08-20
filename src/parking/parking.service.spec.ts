import { Test, TestingModule } from '@nestjs/testing';
import { ParkingService } from './parking.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ParkingService', () => {
  let service: ParkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingService],
    }).compile();

    service = module.get<ParkingService>(ParkingService);
  });

  describe('createParkingLot', () => {
    it('should create a parking lot successfully', () => {
      const result = service.createParkingLot({ no_of_slot: 6 });
      expect(result).toEqual({ total_slot: 6 });
    });

    it('should throw error if parking lot already initialized', () => {
      service.createParkingLot({ no_of_slot: 6 });
      expect(() => service.createParkingLot({ no_of_slot: 10 })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('parkCar', () => {
    beforeEach(() => {
      service.createParkingLot({ no_of_slot: 3 });
    });

    it('should park a car successfully', () => {
      const result = service.parkCar({
        car_reg_no: 'KA-01-AB-1234',
        car_color: 'white',
      });
      expect(result).toEqual({ allocated_slot_number: 1 });
    });

    it('should allocate nearest slot', () => {
      service.parkCar({ car_reg_no: 'KA-01-AB-1234', car_color: 'white' });
      const result = service.parkCar({
        car_reg_no: 'KA-01-AB-5678',
        car_color: 'black',
      });
      expect(result).toEqual({ allocated_slot_number: 2 });
    });

    it('should throw error when parking lot is full', () => {
      service.parkCar({ car_reg_no: 'KA-01-AB-1234', car_color: 'white' });
      service.parkCar({ car_reg_no: 'KA-01-AB-5678', car_color: 'black' });
      service.parkCar({ car_reg_no: 'KA-01-AB-9999', car_color: 'red' });
      
      expect(() => 
        service.parkCar({ car_reg_no: 'KA-01-AB-0000', car_color: 'blue' })
      ).toThrow(BadRequestException);
    });
  });

  describe('clearSlot', () => {
    beforeEach(() => {
      service.createParkingLot({ no_of_slot: 3 });
      service.parkCar({ car_reg_no: 'KA-01-AB-1234', car_color: 'white' });
    });

    it('should clear slot by slot number', () => {
      const result = service.clearSlot({ slot_number : 1 });
      expect(result).toEqual({ freed_slot_number: 1 });
    });

    it('should clear slot by registration number', () => {
      const result = service.clearSlot({ car_registration_no: 'KA-01-AB-1234' });
      expect(result).toEqual({ freed_slot_number: 1 });
    });

    it('should throw error for already free slot', () => {
      service.clearSlot({ slot_number: 1 });
      expect(() => service.clearSlot({ slot_number: 1 })).toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid registration number', () => {
      expect(() => 
        service.clearSlot({ car_registration_no: 'KA-99-XX-9999' })
      ).toThrow(BadRequestException);
    });
  });

  describe('getStatus', () => {
    beforeEach(() => {
      service.createParkingLot({ no_of_slot: 5 });
    });

    it('should return empty array when no cars parked', () => {
      expect(service.getStatus()).toEqual([]);
    });

    it('should return occupied slots', () => {
      service.parkCar({ car_reg_no: 'KA-01-AB-1234', car_color: 'white' });
      service.parkCar({ car_reg_no: 'KA-01-AB-5678', car_color: 'black' });
      
      const status = service.getStatus();
      expect(status).toHaveLength(2);
      expect(status[0]).toEqual({
        slot_no: 1,
        registration_no: 'KA-01-AB-1234',
        color: 'white',
      });
    });
  });

  describe('getRegistrationNumbersByColor', () => {
    beforeEach(() => {
      service.createParkingLot({ no_of_slot: 5 });
      service.parkCar({ car_reg_no: 'KA-01-AB-1234', car_color: 'white' });
      service.parkCar({ car_reg_no: 'KA-01-AB-5678', car_color: 'black' });
      service.parkCar({ car_reg_no: 'KA-01-AB-9999', car_color: 'white' });
    });

    it('should return registration numbers for given color', () => {
      const result = service.getRegistrationNumbersByColor('white');
      expect(result).toEqual(['KA-01-AB-1234', 'KA-01-AB-9999']);
    });

    it('should return empty array for non-existent color', () => {
      const result = service.getRegistrationNumbersByColor('red');
      expect(result).toEqual([]);
    });

    it('should be case insensitive', () => {
      const result = service.getRegistrationNumbersByColor('WHITE');
      expect(result).toEqual(['KA-01-AB-1234', 'KA-01-AB-9999']);
    });
  });

  describe('expandParkingLot', () => {
    beforeEach(() => {
      service.createParkingLot({ no_of_slot: 3 });
    });

    it('should expand parking lot successfully', () => {
      const result = service.expandParkingLot({ increment_slot: 2 });
      expect(result).toEqual({ total_slot: 5 });
    });

    it('should allow parking in new slots', () => {
      service.parkCar({ car_reg_no: 'KA-01-AB-1111', car_color: 'white' });
      service.parkCar({ car_reg_no: 'KA-01-AB-2222', car_color: 'black' });
      service.parkCar({ car_reg_no: 'KA-01-AB-3333', car_color: 'red' });
      
      service.expandParkingLot({ increment_slot: 2 });
      
      const result = service.parkCar({
        car_reg_no: 'KA-01-AB-4444',
        car_color: 'blue',
      });
      expect(result).toEqual({ allocated_slot_number: 4 });
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      service.createParkingLot({ no_of_slot: 10 });
    });

    it('should return correct statistics', () => {
      service.parkCar({ car_reg_no: 'KA-01-AB-1234', car_color: 'white' });
      service.parkCar({ car_reg_no: 'KA-01-AB-5678', car_color: 'black' });
      service.parkCar({ car_reg_no: 'KA-01-AB-9999', car_color: 'red' });
      
      const stats = service.getStatistics();
      expect(stats).toEqual({
        total_slots: 10,
        occupied_slots: 3,
        available_slots: 7,
        occupancy_rate: '30.00%',
      });
    });
  });
});