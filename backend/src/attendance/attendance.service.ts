import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(
    employeeId: string,
    createAttendanceDto: CreateAttendanceDto,
    photoPath: string,
  ) {
    const attendance = this.attendanceRepository.create({
      employeeId,
      checkInTime: new Date(createAttendanceDto.checkInTime),
      notes: createAttendanceDto.notes,
      photoPath,
      latitude: createAttendanceDto.latitude
        ? parseFloat(createAttendanceDto.latitude)
        : null,
      longitude: createAttendanceDto.longitude
        ? parseFloat(createAttendanceDto.longitude)
        : null,
      locationLabel: createAttendanceDto.locationLabel || null,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findByEmployee(employeeId: string) {
    return this.attendanceRepository.find({
      where: { employeeId },
      relations: ['employee'],
      order: { checkInTime: 'DESC' },
    });
  }

  async findAll() {
    return this.attendanceRepository.find({
      relations: ['employee'],
      order: { checkInTime: 'DESC' },
    });
  }

  async findById(id: string) {
    return this.attendanceRepository.findOne({
      where: { id },
      relations: ['employee'],
    });
  }

  async findByDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.employeeId = :employeeId', { employeeId })
      .andWhere('DATE(attendance.checkInTime) BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('attendance.checkInTime', 'DESC')
      .getMany();
  }
}
