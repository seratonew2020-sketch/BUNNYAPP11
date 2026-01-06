import { LiteralClient } from '@literalai/client';

const apiKey = import.meta.env.VITE_LITERAL_API_KEY;

if (!apiKey) {
  console.warn('VITE_LITERAL_API_KEY is missing in environment variables.');
}

export const literalClient = new LiteralClient({
  apiKey: apiKey,
});
