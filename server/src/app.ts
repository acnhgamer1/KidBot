import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';

export const app = express();
export const PORT = process.env.PORT || 5000;
export const CLIENT_DIST_PATH = path.join(__dirname, '../../client/dist');

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_DIST_PATH)); // Serve static files from client/dist

// Basic route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the KidBot AI API!' });
});

// Chat completion endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use Pollinations AI for text generation
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...conversation, { role: 'user', content: message }],
        model: 'openai',
        jsonMode: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    const aiResponse = await response.text();

    res.json({
      message: aiResponse,
      conversation: [
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse },
      ],
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Deep think mode endpoint
app.post('/api/deep-think', async (req: Request, res: Response) => {
  try {
    const { message, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First AI generates initial response
    const firstResponse = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...conversation, { role: 'user', content: message }],
        model: 'openai',
        jsonMode: false,
      }),
    });

    if (!firstResponse.ok) {
      throw new Error(`First AI response error: ${firstResponse.status}`);
    }

    const initialAnswer = await firstResponse.text();

    // Second AI reviews and improves the first response
    const reviewPrompt = `Please review and improve the following response to the user's question: "${message}"

Original response: ${initialAnswer}

Please provide an improved, more comprehensive, and accurate response:`;

    const secondResponse = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: reviewPrompt }],
        model: 'openai',
        jsonMode: false,
      }),
    });

    if (!secondResponse.ok) {
      throw new Error(`Second AI response error: ${secondResponse.status}`);
    }

    const improvedAnswer = await secondResponse.text();

    res.json({
      message: improvedAnswer,
      originalResponse: initialAnswer,
      conversation: [
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: improvedAnswer },
      ],
    });
  } catch (error) {
    console.error('Deep think error:', error);
    res.status(500).json({ error: 'Failed to generate deep think response' });
  }
});

// Image generation endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image using Pollinations AI
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;

    res.json({
      imageUrl,
      prompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Serve React app or fallback page
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(CLIENT_DIST_PATH, 'index.html');

  // Check if the built client exists
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Serve a simple fallback page when the client hasn't been built
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mentat Template JS</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>Mentat Template JS</h1>
          <p>Everything is working correctly.</p>
          <p>This route renders the built project from the <code>/dist</code> directory, but there's currently nothing there.</p>
          <p>You can ask Mentat to build the project to see the React app here, or build it yourself with <code>npm run build</code>.</p>
          <p><a href="/api">Go to API endpoint</a></p>
        </body>
      </html>
    `);
  }
});
