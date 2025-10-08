import { AzureFunction, Context as AzureContext, HttpRequest } from "@azure/functions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { sql, getPool } = require('../../shared/db');

const httpTrigger: AzureFunction = async function (context: AzureContext, req: HttpRequest): Promise<void> {
    try {
        const method = (req.method || 'GET').toUpperCase();
        const pool = await getPool();

        if (method === 'GET') {
            const result = await pool.request()
                .query('SELECT TOP 50 Id, Title, Content, Author, Role, CreatedAt FROM Announcements ORDER BY CreatedAt DESC');
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { announcements: result.recordset }
            };
            return;
        }

        if (method === 'POST') {
            const { title, content, author, role } = req.body || {};
            if (!title || !content) {
                context.res = { status: 400, body: 'Missing title/content' };
                return;
            }
            await pool.request()
                .input('Title', sql.NVarChar(200), title)
                .input('Content', sql.NVarChar(sql.MAX), content)
                .input('Author', sql.NVarChar(100), author || null)
                .input('Role', sql.NVarChar(50), role || null)
                .query('INSERT INTO Announcements (Title, Content, Author, Role) VALUES (@Title, @Content, @Author, @Role)');
            context.res = { status: 201, body: { message: 'Announcement created' } };
            return;
        }

        context.res = { status: 405, body: 'Method not allowed' };
    } catch (error) {
        context.log.error('Error in announcements function:', error);
        context.res = { status: 500, body: 'Internal server error' };
    }
};

export default httpTrigger;