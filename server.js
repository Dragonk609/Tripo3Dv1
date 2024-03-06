const axios = require('axios');
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const port = 8080;

let draftCount = 0;
let refineCount = 0;

// Apply rate limiting middleware for draft model generation
const draftRateLimiter = rateLimit({
  windowMs: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  max: 200, // 200 requests per 3 hours
  message: 'Too many requests, please try again later.'
});

// Apply rate limiting middleware for refine model
const refineRateLimiter = rateLimit({
  windowMs: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  max: 50, // 50 requests per 3 hours
  message: 'Too many requests, please try again later.'
});

// Use cors middleware
app.use(cors());

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Apply rate limiting middleware to the generate-model endpoint
app.post('/generate-model/:option', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    const option = req.params.option;
    let type;
    if (option === 'text') {
      type = 'text_to_model';
    } else if (option === 'image') {
      type = 'image_to_model';
    } else {
      return res.status(400).json({ error: 'Invalid option' });
    }

    formData.append('type', type); // Include the type field

    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
    const config = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders()
      }
    };
    
    const response = await axios.post('https://api.tripo3d.ai/v2/openapi/task', formData, config);

    if (!response.data || !response.data.task_id) {
      throw new Error('Failed to generate 3D model.');
    }

    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/limits', (req, res) => {
  res.json({ draftCount, refineCount });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
