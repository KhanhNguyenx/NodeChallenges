import { Request, Response } from "express";
import pool from "../../config/database";
import ExcelJS from 'exceljs';
import { Employee } from '../types/employee';
import { RowError } from '../types/excelRowError';
import fs from 'fs/promises';

// [POST] /api/employees/import
export const importEmployees = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Check for file
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng tải lên file Excel!' });
    }

    const filePath: string = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet: ExcelJS.Worksheet | undefined = workbook.getWorksheet(1);

    // Check if worksheet exists
    if (!worksheet) {
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Không tìm thấy worksheet trong file Excel!' });
    }

    // Array to store formatted data and errors
    const formattedData: Employee[] = [];
    const rowErrors: RowError[] = [];

    // Read and validate data from Excel (columns: FullName, Department, Salary)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const errors: string[] = [];
      const fullName = row.getCell(1).value;
      const department = row.getCell(2).value;
      const salary = row.getCell(3).value;

      // Validate full_name (must be a non-empty string)
      let full_name: string = '';
      if (typeof fullName === 'string' && fullName.trim() !== '') {
        full_name = fullName.trim();
      } else {
        errors.push('FullName must be a non-empty string');
      }

      // Validate department (string or null)
      let departmentValue: string = '';
      if (typeof department === 'string' && department.trim() !== '') {
        departmentValue = department.trim();
      } else {
        errors.push('Department must be a non-empty string');
      }

      // Validate salary (must be a valid non-negative number)
      let salaryValue: number = 0;
      if (typeof salary === 'number' && !isNaN(salary) && salary >= 0) {
        salaryValue = salary;
      } else if (typeof salary === 'string') {
        const parsedSalary = parseFloat(salary);
        if (!isNaN(parsedSalary) && parsedSalary >= 0) {
          salaryValue = parsedSalary;
        } else {
          errors.push('Salary must be a valid non-negative number');
        }
      } else {
        errors.push('Salary must be a valid number');
      }

      // If no errors, add to formattedData
      if (errors.length === 0) {
        formattedData.push({
          full_name,
          department: departmentValue,
          salary: salaryValue,
        });
      } else {
        rowErrors.push({ rowNumber, errors });
      }
    });

    // If there are errors, return them and stop processing
    if (rowErrors.length > 0) {
      await fs.unlink(filePath);
      return res.status(400).json({
        error: 'Invalid data in Excel file',
        details: rowErrors,
      });
    }

    // Save to PostgreSQL
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const data of formattedData) {
        await client.query(
          `INSERT INTO employees (full_name, department, salary)
           VALUES ($1, $2, $3)`,
          [data.full_name, data.department, data.salary],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Delete temporary file
    await fs.unlink(filePath);

    return res.json({
      message: 'Dữ liệu đã được lưu vào bảng employees thành công!',
      data: formattedData,
    });
  } catch (e) {
    console.error(e);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => { });
    }
    return res.status(500).json({ error: 'Failed to import employees' });
  }
};
// [GET] /api/employees/exportEmployees?page=1&limit=10&search=""&minSalary=&maxSalary=
export const exportEmployees = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { page = '1', limit = '10', search = '', minSalary, maxSalary } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Define columns to select (full_name, department, salary)
    let query = `SELECT full_name, department, salary FROM employees WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM employees WHERE 1=1`;

    const values: any[] = [];
    let index = 1;

    // Search by full_name or department
    if (search) {
      const keyword = (search as string).replace(/\s+/g, '-');
      query += ` AND (full_name ILIKE $${index} OR department ILIKE $${index})`;
      countQuery += ` AND (full_name ILIKE $${index} OR department ILIKE $${index})`;
      values.push(`%${keyword}%`);
      index++;
    }

    // Filter by salary range
    if (minSalary) {
      query += ` AND salary >= $${index}`;
      countQuery += ` AND salary >= $${index}`;
      values.push(parseFloat(minSalary as string));
      index++;
    }
    if (maxSalary) {
      query += ` AND salary <= $${index}`;
      countQuery += ` AND salary <= $${index}`;
      values.push(parseFloat(maxSalary as string));
      index++;
    }

    // Sort by full_name and apply pagination
    query += ` ORDER BY full_name ASC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limitNum, offset);

    // Query database
    const result = await pool.query(query, values);

    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Define columns to match input format
    worksheet.columns = [
      { header: 'FullName', key: 'full_name', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Salary', key: 'salary', width: 15 },
    ];

    // Add data
    worksheet.addRows(result.rows);

    // Format header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F81BD' },
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');

    return res.send(buffer);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to export employees' });
  }
};