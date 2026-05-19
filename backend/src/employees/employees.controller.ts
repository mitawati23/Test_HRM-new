import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/employee.entity';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { getErrorMessage } from '../common/utils/error.util';

@Controller('api/employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Res() res: Response,
  ) {
    try {
      const employee = await this.employeesService.create(createEmployeeDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: getErrorMessage(error),
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Res() res: Response) {
    try {
      const employees = await this.employeesService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Employees retrieved successfully',
        data: employees,
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
      const employee = await this.employeesService.findById(id);
      if (!employee) {
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Employee not found',
        });
      }
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Employee retrieved successfully',
        data: employee,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: getErrorMessage(error),
      });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Res() res: Response,
  ) {
    try {
      const employee = await this.employeesService.update(id, updateEmployeeDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: getErrorMessage(error),
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.employeesService.delete(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: result.message,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: getErrorMessage(error),
      });
    }
  }
}
