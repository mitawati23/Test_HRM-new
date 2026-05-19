import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee, UserRole } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    const employee = this.employeesRepository.create({
      ...createEmployeeDto,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    });

    const saved = await this.employeesRepository.save(employee);
    const { password: _pw, ...safe } = saved;
    return safe;
  }

  async findAll() {
    return this.employeesRepository.find({
      select: [
        'id',
        'name',
        'email',
        'phone',
        'department',
        'position',
        'joinDate',
        'isActive',
        'createdAt',
      ],
    });
  }

  async findById(id: string) {
    return this.employeesRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'department',
        'position',
        'joinDate',
        'isActive',
        'createdAt',
      ],
    });
  }

  async findByEmail(email: string) {
    return this.employeesRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.employeesRepository.update(id, updateEmployeeDto);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.employeesRepository.delete(id);
    return { message: 'Employee deleted successfully' };
  }
}
