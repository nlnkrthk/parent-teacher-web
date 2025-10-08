import { AzureFunction, Context, HttpRequest } from "@azure/functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sql, getPool } = require('../../shared/db');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  try {
    const method = (req.method || 'GET').toUpperCase();
    const pool = await getPool();

    if (method === 'GET') {
      const result = await pool.request()
        .query('SELECT TOP 100 Id, Subject, Title, Description, DueDate, Author, CreatedAt FROM Assignments ORDER BY DueDate ASC, CreatedAt DESC');
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: { assignments: result.recordset } };
      return;
    }

    if (method === 'POST') {
      const { subject, title, description, dueDate, author } = req.body || {};
      if (!subject || !title || !description || !dueDate) {
        context.res = { status: 400, body: 'Missing required fields' };
        return;
      }
      await pool.request()
        .input('Subject', sql.NVarChar(100), subject)
        .input('Title', sql.NVarChar(200), title)
        .input('Description', sql.NVarChar(sql.MAX), description)
        .input('DueDate', sql.Date, new Date(dueDate))
        .input('Author', sql.NVarChar(100), author || null)
        .query('INSERT INTO Assignments (Subject, Title, Description, DueDate, Author) VALUES (@Subject, @Title, @Description, @DueDate, @Author)');
      context.res = { status: 201, body: { message: 'Assignment created' } };
      return;
    }

    context.res = { status: 405, body: 'Method not allowed' };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: 'Internal server error' };
  }
};

export default httpTrigger;


