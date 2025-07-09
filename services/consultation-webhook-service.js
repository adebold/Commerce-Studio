import express from 'express';
import bodyParser from 'body-parser';
import ConsultationDialogflowService from './google/consultation-dialogflow-service.js';

const app = express();
app.use(bodyParser.json());

const dialogflowService = new ConsultationDialogflowService();
dialogflowService.initialize();

app.post('/webhook', async (req, res) => {
    try {
        const { sessionInfo, queryInput } = req.body;

        if (!sessionInfo || !sessionInfo.session || !queryInput || !queryInput.text) {
            console.error('Invalid webhook request body:', req.body);
            return res.status(400).json({ error: 'Invalid request format. Missing sessionInfo or queryInput.' });
        }

        const sessionId = sessionInfo.session.split('/').pop();
        const queryText = queryInput.text.text;

        console.log(`Received message for session ${sessionId}: "${queryText}"`);

        const dialogflowResponse = await dialogflowService.detectIntent(sessionId, queryText);
        
        console.log('Received response from Dialogflow:', JSON.stringify(dialogflowResponse, null, 2));

        // The response from detectIntent is already in the format Dialogflow expects for a webhook response.
        // We can pass it through directly.
        res.json(dialogflowResponse);

    } catch (error) {
        console.error('Error in /webhook:', error);
        res.status(500).json({
            fulfillmentResponse: {
                messages: [{
                    text: {
                        text: ['An internal error occurred. Please try again later.'],
                    },
                }],
            },
        });
    }
});

const port = process.env.CONSULTATION_PORT || 3002;
app.listen(port, () => {
    console.log(`Consultation webhook service listening on port ${port}`);
});