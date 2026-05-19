import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee, UserRole } from '../employees/entities/employee.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingEmployee = await this.employeesRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingEmployee) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const employee = this.employeesRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    });

    await this.employeesRepository.save(employee);

    const { password, ...result } = employee;
    return result;
  }

  async login(loginDto: LoginDto) {
    const employee = await this.employeesRepository.findOne({
      where: { email: loginDto.email },
    });

    if (
      !employee ||
      !employee.isActive ||
      !(await bcrypt.compare(loginDto.password, employee.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: employee.id,
      email: employee.email,
      role: employee.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
