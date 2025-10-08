import { AzureFunction, Context, HttpRequest } from "@azure/functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sql, getPool } = require('../../shared/db');

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  try {
    const method = (req.method || 'GET').toUpperCase();
    const pool = await getPool();

    if (method === 'GET') {
      const result = await pool.request()
        .query('SELECT TOP 100 Id, Title, Description, DateTime, Author, Role, CreatedAt FROM Events ORDER BY DateTime ASC');
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: { events: result.recordset } };
      return;
    }

    if (method === 'POST') {
      const { title, description, dateTime, author, role } = req.body || {};
      if (!title || !dateTime) {
        context.res = { status: 400, body: 'Missing required fields' };
        return;
      }
      await pool.request()
        .input('Title', sql.NVarChar(200), title)
        .input('Description', sql.NVarChar(sql.MAX), description || null)
        .input('DateTime', sql.DateTime2, new Date(dateTime))
        .input('Author', sql.NVarChar(100), author || null)
        .input('Role', sql.NVarChar(50), role || null)
        .query('INSERT INTO Events (Title, Description, DateTime, Author, Role) VALUES (@Title, @Description, @DateTime, @Author, @Role)');
      context.res = { status: 201, body: { message: 'Event created' } };
      return;
    }

    context.res = { status: 405, body: 'Method not allowed' };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: 'Internal server error' };
  }
};

export default httpTrigger;


