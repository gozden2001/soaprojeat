const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');

const sequelize = require('./models/index').sequelize;
const { register } = require('./utils/metrics');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.get('/test', (req, res) => {
	res.send('Hello World!');
});

app.get('/api/health', (req, res) => {
	res.status(200).json({ status: 'OK', service: 'AuthenticationService' });
});

app.use('/api/user', userRoute);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

sequelize.authenticate()
  .then(() => {
    console.log(`Connection to the ${process.env.DB_NAME} database has been established successfully!`);
  })
  .catch(err => {
    console.error('Unable to connect to the database!', err);
  });

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
