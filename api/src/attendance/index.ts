import { AzureFunction, Context, HttpRequest } from "@azure/functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sql, getPool } = require('../../shared/db');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  try {
    const method = (req.method || 'GET').toUpperCase();
    const pool = await getPool();

    if (method === 'GET') {
      const { studentId } = req.query as { studentId?: string };
      if (!studentId) {
        context.res = { status: 400, body: 'studentId is required' };
        return;
      }
      const result = await pool.request()
        .input('StudentId', sql.NVarChar(64), studentId)
        .query('SELECT Id, StudentId, Day, Present, MarkedAt FROM AttendanceRecords WHERE StudentId=@StudentId ORDER BY Day DESC');
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: { records: result.recordset } };
      return;
    }

    if (method === 'POST') {
      const { studentId, day, present } = req.body || {};
      if (!studentId || !day || typeof present !== 'boolean') {
        context.res = { status: 400, body: 'Missing studentId/day/present' };
        return;
      }
      await pool.request()
        .input('StudentId', sql.NVarChar(64), studentId)
        .input('Day', sql.Date, new Date(day))
        .input('Present', sql.Bit, !!present)
        .query(`MERGE AttendanceRecords AS target
                USING (SELECT @StudentId AS StudentId, @Day AS Day) AS src
                ON (target.StudentId = src.StudentId AND target.Day = src.Day)
                WHEN MATCHED THEN UPDATE SET Present = @Present, MarkedAt = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN INSERT (StudentId, Day, Present) VALUES (@StudentId, @Day, @Present);`);
      context.res = { status: 200, body: { message: 'Attendance marked' } };
      return;
    }

    context.res = { status: 405, body: 'Method not allowed' };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: 'Internal server error' };
  }
};

export default httpTrigger;


