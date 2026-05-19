import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee, UserRole } from '../employees/entities/employee.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.SEED_DEMO_USERS === 'false') {
      return;
    }

    const demoUsers: Array<Partial<Employee> & { password: string }> = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '08000000001',
        role: UserRole.ADMIN,
        department: 'HR',
        position: 'Administrator',
        isActive: true,
      },
      {
        name: 'Employee User',
        email: 'emp@example.com',
        password: 'password123',
        phone: '08000000002',
        role: UserRole.EMPLOYEE,
        department: 'Engineering',
        position: 'Staff',
        isActive: true,
      },
    ];

    for (const user of demoUsers) {
      const exists = await this.employeesRepository.findOne({
        where: { email: user.email },
      });

      const forceReset = process.env.SEED_FORCE_RESET === 'true';

      if (exists && !forceReset) {
        this.logger.log(`Demo user already exists: ${user.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      if (exists && forceReset) {
        await this.employeesRepository.update(exists.id, {
          password: hashedPassword,
          name: user.name,
          role: user.role,
          phone: user.phone,
          department: user.department,
          position: user.position,
          isActive: true,
        });
        this.logger.log(`Demo user password reset: ${user.email}`);
        continue;
      }
      await this.employeesRepository.save(
        this.employeesRepository.create({
          ...user,
          password: hashedPassword,
        }),
      );

      this.logger.log(`Demo user created: ${user.email}`);
    }
  }
}
