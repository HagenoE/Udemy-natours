import express from 'express';
import path from 'path';

import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pkg from 'express-mongo-sanitize';
import cors from 'cors';

import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import tourRouter from './routes/tourRoute.js';
import userRouter from './routes/userRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controller/errorController.js';
import { __dirname } from './helpers/dirName.js'
import viewRouter from './routes/viewRoute.js';
import bookingRouter from './routes/bookingRouter.js'
import { webHookCheckout } from './controller/bookingController.js';

const app = express();
const mongoSanitize = pkg;

app.enable('trust proxy');


app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'))
app.set('views', 'views')
app.use(express.static(path.join(__dirname, 'public')));

// Middleware

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// app.use(cors({
//     origin: '*',
//     credentials: true,
// }));

app.use(cors())
app.options('*', cors())

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})

// app.use(helmet());
app.use(helmet({ contentSecurityPolicy: false }));
helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            scriptSrc: [
                "'self'",
                'https:',
                'http:',
                'blob:',
                'https://*.mapbox.com',
                'https://js.stripe.com',
                'https://m.stripe.network',
                'https://*.cloudflare.com',
            ],
            frameSrc: ["'self'", 'https://js.stripe.com'],
            objectSrc: ["'none'"],
            styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
            workerSrc: [
                "'self'",
                'data:',
                'blob:',
                'https://*.tiles.mapbox.com',
                'https://api.mapbox.com',
                'https://events.mapbox.com',
                'https://m.stripe.network',
            ],
            childSrc: ["'self'", 'blob:'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            formAction: ["'self'"],
            connectSrc: [
                "'self'",
                "'unsafe-inline'",
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://127.0.0.1:*/',

            ],
            upgradeInsecureRequests: [],
        },
    },
})

app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
const limiter = rateLimit({
    max: 5,
    windowMs: 1000 * 60 * 10,
    message: 'Trop de tentative de cette adresse. Veillez reesayer plus tard',
});

app.use('/api', limiter);

app.post('/webhook', express.raw({ type: 'application/json' }), webHookCheckout)

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' https://cdnjs.cloudflare.com https://js.stripe.com"
    );
    next();
});


// Route

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't not find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
