const app = require('express')();

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API Root is working' });
});

app.get('/articles', (req, res) => {
    res.status(200).json([
        { id: 1, title: 'Test Article from Vercel', status: 'debug' }
    ]);
});

// Catch-all for other routes
app.all('*', (req, res) => {
    res.status(200).json({
        path: req.path,
        query: req.query,
        message: 'Endpoint reachable but not implemented in debug mode'
    });
});

module.exports = app;
