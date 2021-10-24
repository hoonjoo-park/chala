import mongoose from 'mongoose';

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => console.log('🥑 Mongoose Connected!'));
db.on('error', (error) => console.log('Mongoose Error ❌', error));
