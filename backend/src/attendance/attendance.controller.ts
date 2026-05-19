import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../employees/entities/employee.entity';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/attendance.dto';
import { getErrorMessage } from '../common/utils/error.util';
import * as fs from 'fs';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('api/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('mark')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async markAttendance(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @GetUser() user: any,
    @Res() res: Response,
  ) {
    try {
      if (!user?.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
      }

      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Photo proof is required',
        });
      }

      const attendance = await this.attendanceService.create(
        user.id,
        createAttendanceDto,
        `uploads/${file.filename}`,
      );

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Attendance marked successfully',
        data: attendance,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: getErrorMessage(error),
      });
    }
  }

  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  async getMyHistory(
    @GetUser() user: any,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      let attendance;

      if (startDate && endDate) {
        attendance = await this.attendanceService.findByDateRange(
          user.id,
          new Date(startDate),
          new Date(endDate),
        );
      } else {
        attendance = await this.attendanceService.findByEmployee(user.id);
      }

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Attendance history retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: getErrorMessage(error),
      });
    }
  }

  @Get('employee/:employeeId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getEmployeeAttendance(
    @Param('employeeId') employeeId: string,
    @Res() res: Response,
  ) {
    try {
      const attendance = await this.attendanceService.findByEmployee(employeeId);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Employee attendance retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: getErrorMessage(error),
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Res() res: Response) {
    try {
      const attendance = await this.attendanceService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'All attendance records retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: getErrorMessage(error),
      });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const attendance = await this.attendanceService.findById(id);
      if (!attendance) {
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Attendance record not found',
        });
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Attendance record retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: getErrorMessage(error),
      });
    }
  }
}
