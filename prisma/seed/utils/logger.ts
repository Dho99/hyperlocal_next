export const logger = {
  info: (message: string) => console.log(`[\x1b[34mINFO\x1b[0m] ${message}`),
  success: (message: string) => console.log(`[\x1b[32mSUCCESS\x1b[0m] ${message}`),
  warn: (message: string) => console.warn(`[\x1b[33mWARN\x1b[0m] ${message}`),
  error: (message: string, error?: any) => {
    console.error(`[\x1b[31mERROR\x1b[0m] ${message}`);
    if (error) console.error(error);
  },
};
