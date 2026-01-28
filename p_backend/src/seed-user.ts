import { dataSource } from './config/typeorm.config';
import { User, PractitionerType } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await dataSource.initialize();

    const userRepository = dataSource.getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const user = userRepository.create({
        firstName: 'Admin',
        middleName: '',
        lastName: 'User',
        email: 'admin@example.com',
        phoneNumber: '1234567890',
        gender: 'other',
        practitionerType: PractitionerType.ADMIN,
        specialization: null,
        password: hashedPassword,
      });

      await userRepository.save(user);
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await dataSource.destroy();
  }
}

seed();
