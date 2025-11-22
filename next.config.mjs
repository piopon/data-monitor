import { NotifierValidator } from "./src/notifiers/core/NotifierValidator.js";

const notifierCheck = NotifierValidator.validateConfiguration();
console.log(notifierCheck.info);
if (!notifierCheck.result) {
  process.exit(1);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
