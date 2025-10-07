import { AzureFunction, Context as AzureContext, HttpRequest } from "@azure/functions";

interface AnnouncementRequest {
    title: string;
    content: string;
    priority: 'urgent' | 'normal' | 'info';
}

const httpTrigger: AzureFunction = async function (context: AzureContext, req: HttpRequest): Promise<void> {
    context.log('Announcements function processed a request.');

    try {
        switch(req.method?.toUpperCase()) {
            case 'GET':
                context.res = {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        announcements: [
                            {
                                id: 1,
                                title: "Parent Teacher Meeting",
                                content: "Annual PTM scheduled next week",
                                priority: "urgent",
                                date: new Date().toISOString()
                            }
                        ]
                    }
                };
                break;

            case 'POST':
                const bodyData = req.body || {};
                const body: AnnouncementRequest = {
                    title: bodyData.title,
                    content: bodyData.content,
                    priority: bodyData.priority
                };

                if (!body.title || !body.content || !body.priority) {
                    context.res = {
                        status: 400,
                        body: "Missing required fields"
                    };
                    return;
                }

                context.res = {
                    status: 201,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: { message: "Announcement created successfully" }
                };
                break;

            default:
                context.res = {
                    status: 405,
                    body: "Method not allowed"
                };
        }
    } catch (error) {
        context.log.error('Error in announcements function:', error);
        context.res = {
            status: 500,
            body: "Internal server error"
        };
    }
};

export default httpTrigger;