import { UIMessage } from 'ai';

export type MyUIMessage = UIMessage<
  never,
  {
    'search-result': {
      query: string;
      status: 'searching' | 'complete' | 'error';
      searchDepth?: 'basic' | 'advanced';
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
