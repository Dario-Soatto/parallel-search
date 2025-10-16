import { UIMessage } from 'ai';

export type MyUIMessage = UIMessage<
  never,
  {
    'search-result': {
      query: string;
      status: 'searching' | 'complete' | 'error';
      sources?: Array<{
        title: string;
        url: string;
        content: string;
        score: number;
      }>;
      error?: string;
    };
  }
>;
