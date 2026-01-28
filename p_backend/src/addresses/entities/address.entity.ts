import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';

@Entity('address')
export class Address {
  // Map to existing "id" column in shared "address" table
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  address_id: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  house_no: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'varchar', length: 50 })
  country: string;

  @Column({ type: 'varchar', length: 15 })
  zipCode: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  address_type: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  // Map to existing "entity_type" column in shared "address" table
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'entity_type' })
  entityType: string;

  @ManyToOne(() => Patient, (patient) => patient.addresses, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  patient: Patient;

  @ManyToOne(() => User, (user) => user.addresses, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
