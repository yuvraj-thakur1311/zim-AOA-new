import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { Address } from '../addresses/entities/address.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      // Check if email already exists
      const existingPatient = await this.patientRepository.findOne({
        where: { email: createPatientDto.email },
      });

      if (existingPatient) {
        throw new ConflictException(
          `Patient with email ${createPatientDto.email} already exists`,
        );
      }

      // Extract address data
      const { address, ...patientData } = createPatientDto;

      // Create and save patient first
      const patient = this.patientRepository.create({
        ...patientData,
        dob: new Date(createPatientDto.dob),
      });

      const savedPatient = await this.patientRepository.save(patient);

      // Create and save address with patient reference
      const addressEntity = this.addressRepository.create({
        ...address,
        userId: savedPatient.id,
        entityType: 'patient',
        street: address.street || null,
        house_no: address.house_no || null,
        address_type: address.address_type || null,
      });

      await this.addressRepository.save(addressEntity);

      // Return patient with address relation loaded
      return await this.patientRepository.findOne({
        where: { id: savedPatient.id },
        relations: ['addresses'],
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create patient. Please try again.',
      );
    }
  }

  async findAll(): Promise<Patient[]> {
    try {
      return await this.patientRepository.find({
        relations: ['addresses'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      // Temporary log to surface the real DB error in the terminal
      // when "Failed to fetch patients" is returned.
      // eslint-disable-next-line no-console
      console.error('Error fetching patients:', error);
      throw new InternalServerErrorException(
        'Failed to fetch patients. Please try again.',
      );
    }
  }

  async findOne(id: string): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id },
        relations: ['addresses'],
      });

      if (!patient) {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }

      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch patient. Please try again.',
      );
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    try {
      const patient = await this.findOne(id);

      // If email is being updated, check for conflicts
      if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
        const existingPatient = await this.patientRepository.findOne({
          where: { email: updatePatientDto.email },
        });

        if (existingPatient) {
          throw new ConflictException(
            `Patient with email ${updatePatientDto.email} already exists`,
          );
        }
      }

      // Convert date string to Date object if dob is being updated
      const updateData: any = { ...updatePatientDto };
      if (updateData.dob) {
        updateData.dob = new Date(updateData.dob);
      }

      Object.assign(patient, updateData);
      return await this.patientRepository.save(patient);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update patient. Please try again.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const patient = await this.findOne(id);
      await this.patientRepository.remove(patient);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete patient. Please try again.',
      );
    }
  }
}
