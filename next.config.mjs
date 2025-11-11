import { NotifierValidator } from './src/notifiers/NotifierValidator.js';

const notifierCheck = NotifierValidator.validateConfiguration();
console.log(notifierCheck.info);
if (!notifierCheck.result) {
    process.exit(1);
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
