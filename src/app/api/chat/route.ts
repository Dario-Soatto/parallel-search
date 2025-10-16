import { createAnthropic } from '@ai-sdk/anthropic';
import { 
  streamText, 
  convertToModelMessages, 
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs
} from 'ai';
import { z } from 'zod';
import { TavilyClient } from 'tavily';
import type { MyUIMessage } from '@/lib/types';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const stream = createUIMessageStream<MyUIMessage>({
    execute: async ({ writer }) => {
      const tavilyClient = new TavilyClient({ 
        apiKey: process.env.TAVILY_API_KEY 
      });

      const result = streamText({
        model: anthropic('claude-haiku-4-5-20251001'),
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        system: `You are a research assistant that helps users find information.
        
When a user asks a complex question:
1. Break it down into 5-10 specific search queries
2. For each query, decide whether to use 'basic' or 'advanced' search depth:
   - Use 'basic' for simple factual queries, news, or general information (faster, 2-3 seconds)
   - Use 'advanced' for complex research requiring deeper analysis (slower, 5-10 seconds)
3. I will search the web for each query in parallel and stream the results to you
4. Once you receive all search results, synthesize them into a comprehensive answer
5. Use the actual content from the search results
6. Cite specific sources with their URLs`,
        tools: {
          decompose_query: {
            description: 'Break down a complex question into multiple parallel search queries',
            inputSchema: z.object({
              originalQuestion: z.string(),
              searchQueries: z.array(z.object({
                query: z.string().describe('The search query'),
                searchDepth: z.enum(['basic', 'advanced']).describe('Search depth: basic for simple queries, advanced for complex research'),
              })).min(5).max(10),
            }),
            execute: async ({ originalQuestion, searchQueries }) => {
              console.log('🔍 Starting parallel searches for:', searchQueries);

              // Start all searches immediately (don't await yet)
              const searchPromises = searchQueries.map(async (item: { query: string; searchDepth: 'basic' | 'advanced' }, index: number) => {
                const searchId = `search-${crypto.randomUUID()}`;
                
                // When starting search:
                writer.write({
                  type: 'data-search-result',
                  id: searchId,
                  data: { query: item.query, status: 'searching', searchDepth: item.searchDepth },
                });

                try {
                  console.log(`  → Searching "${item.query}" with ${item.searchDepth} depth`);
                  const response = await tavilyClient.search({
                    query: item.query,
                    max_results: 3,
                    search_depth: item.searchDepth, // Use Claude's chosen depth!
                  });

                  const sources = response.results.map(r => ({
                    title: r.title,
                    url: r.url,
                    content: r.content,
                    score: Number(r.score),  // Parse string to number
                  }));

                  // When complete:
                  writer.write({
                    type: 'data-search-result',
                    id: searchId,
                    data: { query: item.query, status: 'complete', searchDepth: item.searchDepth, sources },
                  });

                  return { query: item.query, sources };
                } catch (error) {
                  // Stream: Search error
                  writer.write({
                    type: 'data-search-result',
                    id: searchId,
                    data: { 
                      query: item.query, 
                      status: 'error', 
                      error: error instanceof Error ? error.message : 'Unknown error' 
                    },
                  });
                  return { query: item.query, sources: [] };
                }
              });

              // Wait for all to complete
              const results = await Promise.all(searchPromises);
              console.log('✅ All searches completed');

              return {
                originalQuestion,
                searchCount: searchQueries.length,
                results,
              };
            },
          },
        },
      });

      // Merge the Claude stream into our custom stream
      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
