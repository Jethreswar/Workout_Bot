const mongoose = require('mongoose');

const uri = 'mongodb+srv://jethreswar_98:jetRACEwAr7*98@mernapp.jxskwpb.mongodb.net/?retryWrites=true&w=majority&appName=MERNapp';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection error:', err);
        if (err.cause) console.error('Cause:', err.cause);
    });