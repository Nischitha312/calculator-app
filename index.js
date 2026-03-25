const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ─── Calculator Logic Module ───────────────────────────────────────────────
const calculator = {
  add:      (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide:   (a, b) => {
    if (b === 0) throw new Error('Cannot divide by zero');
    return a / b;
  },
  percent:  (a, b) => (a / 100) * b,
  power:    (a, b) => Math.pow(a, b),
};

// ─── API Routes ────────────────────────────────────────────────────────────

// GET - Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /calculate - Handle all operations
app.post('/calculate', (req, res) => {
  const { num1, num2, operation } = req.body;

  const a = parseFloat(num1);
  const b = parseFloat(num2);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).json({ error: 'Please enter valid numbers.' });
  }

  try {
    const result = calculator[operation](a, b);
    const symbols = {
      add: '+', subtract: '−', multiply: '×', divide: '÷',
      percent: '% of', power: '^'
    };
    return res.json({
      num1: a,
      num2: b,
      operation,
      symbol: symbols[operation],
      result: parseFloat(result.toFixed(10))
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /history - Return recent calculations (in-memory store)
let history = [];

app.post('/calculate', (req, res) => {}); // placeholder kept for clarity

// Override with history-saving version
app.post('/calc', (req, res) => {
  const { num1, num2, operation } = req.body;
  const a = parseFloat(num1);
  const b = parseFloat(num2);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).json({ error: 'Please enter valid numbers.' });
  }

  if (!calculator[operation]) {
    return res.status(400).json({ error: 'Unknown operation.' });
  }

  try {
    const result = calculator[operation](a, b);
    const symbols = { add:'+', subtract:'−', multiply:'×', divide:'÷', percent:'% of', power:'^' };
    const entry = {
      id: Date.now(),
      expression: `${a} ${symbols[operation]} ${b} = ${parseFloat(result.toFixed(10))}`,
      result: parseFloat(result.toFixed(10)),
      timestamp: new Date().toLocaleTimeString()
    };
    history.unshift(entry);
    if (history.length > 10) history.pop(); // keep last 10
    return res.json({ ...entry, history });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/history', (req, res) => res.json(history));

app.delete('/history', (req, res) => {
  history = [];
  res.json({ message: 'History cleared.' });
});

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Calculator server running at http://localhost:${PORT}`);
});