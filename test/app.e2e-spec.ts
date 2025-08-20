import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Parking System E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Parking Lot Workflow', () => {
    it('should complete a full parking workflow', async () => {
      // Initialize parking lot
      await request(app.getHttpServer())
        .post('/parking_lot')
        .send({ no_of_slot: 6 })
        .expect(201)
        .expect({ total_slot: 6 });

      // Park first car
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-HH-1234',
          car_color: 'white',
        })
        .expect(201)
        .expect({ allocated_slot_number: 1 });

      // Park second car
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-HH-9999',
          car_color: 'white',
        })
        .expect(201)
        .expect({ allocated_slot_number: 2 });

      // Get registration numbers by color
      const regResponse = await request(app.getHttpServer())
        .get('/registration_numbers/white')
        .expect(200);
      expect(regResponse.body).toEqual(['KA-01-HH-1234', 'KA-01-HH-9999']);

      // Clear a slot
      await request(app.getHttpServer())
        .post('/clear')
        .send({ slot_number: 1 })
        .expect(200)
        .expect({ freed_slot_number: 1 });

      // Park another car in freed slot
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-BB-0001',
          car_color: 'black',
        })
        .expect(201)
        .expect({ allocated_slot_number: 1 });

            // Get status
      const statusResponse = await request(app.getHttpServer())
        .get('/status')
        .expect(200);
      
      expect(statusResponse.body).toHaveLength(2);
      expect(statusResponse.body).toContainEqual({
        slot_no: 1,
        registration_no: 'KA-01-BB-0001',
        color: 'black',
      });

      // Expand parking lot
      await request(app.getHttpServer())
        .patch('/parking_lot')
        .send({ increment_slot: 3 })
        .expect(200)
        .expect({ total_slot: 9 });

      // Get statistics
      const statsResponse = await request(app.getHttpServer())
        .get('/statistics')
        .expect(200);
      
      expect(statsResponse.body).toMatchObject({
        total_slots: 9,
        occupied_slots: 2,
        available_slots: 7,
      });
    });

    it('should handle error cases', async () => {
      // Try to park without initializing
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-HH-1234',
          car_color: 'white',
        })
        .expect(400);

      // Initialize parking lot
      await request(app.getHttpServer())
        .post('/parking_lot')
        .send({ no_of_slot: 2 })
        .expect(201);

      // Fill parking lot
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-HH-1234',
          car_color: 'white',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-HH-5678',
          car_color: 'black',
        })
        .expect(201);

      // Try to park when full
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'KA-01-HH-9999',
          car_color: 'red',
        })
        .expect(400);

      // Try to clear already free slot
      await request(app.getHttpServer())
        .post('/clear')
        .send({ slot_number: 1 })
        .expect(200);

      await request(app.getHttpServer())
        .post('/clear')
        .send({ slot_number: 1 })
        .expect(400);

      // Try invalid registration format
      await request(app.getHttpServer())
        .post('/park')
        .send({
          car_reg_no: 'INVALID',
          car_color: 'white',
        })
        .expect(400);
    });
  });
});