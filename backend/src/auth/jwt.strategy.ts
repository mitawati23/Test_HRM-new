import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { getJwtSecret } from '../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    const employee = await this.employeesRepository.findOne({
      where: { id: payload.sub },
    });

    if (!employee) {
      return null;
    }

    if (!employee.isActive) {
      return null;
    }

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    };
  }
}
