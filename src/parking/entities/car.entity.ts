export class Car {
  registrationNumber: string;
  color: string;

  constructor(registrationNumber: string, color: string) {
    this.registrationNumber = registrationNumber;
    this.color = color.toLowerCase();
  }
}