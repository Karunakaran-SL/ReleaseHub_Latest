// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder and TextDecoder which are not available in JSDOM
global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
process.env.SESSION_SECRET = 'a-super-secret-key-that-is-long-enough-for-hs256';
