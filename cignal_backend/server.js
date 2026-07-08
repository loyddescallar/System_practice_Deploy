const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const loadRoutes = require('./routes/loadRoutes');
const loadRequestRoutes = require('./routes/loadRequestRoutes');
const customerRoutes = require('./routes/customerRoutes');
const troubleshootRoutes = require('./routes/troubleshootRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

app.use('/uploads/messages', express.static(path.join(__dirname, 'uploads', 'messages')));

app.use('/api/auth',         authRoutes);
app.use('/api/tickets',      ticketRoutes);
app.use('/api/technicians',  technicianRoutes);
app.use('/api/load',         loadRoutes);
app.use('/api/load-requests',loadRequestRoutes);
app.use('/api/customers',    customerRoutes);
app.use('/api/troubleshoot', troubleshootRoutes);

app.use((req, res) => { res.status(404).json({ error: 'Endpoint not found' }); });

app.listen(PORT, '0.0.0.0', () => { console.log(`Server running on port ${PORT}`); });
