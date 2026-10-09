// Local preview only. Production is static files on GitHub Pages (see public/).
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`Preview at http://localhost:${PORT}`));
