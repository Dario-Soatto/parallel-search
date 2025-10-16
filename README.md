# Parallel Research Assistant

An AI-powered research assistant that performs intelligent parallel web searches and synthesizes results in real-time. Built with Next.js, Claude AI, and Tavily search API.

## ✨ Features

- **🔍 Intelligent Query Decomposition** - Claude AI breaks down complex questions into 5-10 targeted search queries
- **⚡ Parallel Search Execution** - All searches run simultaneously for maximum speed
- **🧠 Adaptive Search Depth** - AI decides whether to use basic (fast) or advanced (deep) search for each query
- **📡 Real-time Streaming** - Watch search results appear as they complete
- **🎨 Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **📝 Markdown Support** - AI responses with proper formatting via Streamdown
- **🔗 Smart Link Detection** - Automatic conversion of source citations to styled link buttons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Anthropic API key (for Claude)
- Tavily API key (for web search)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd parallel-search
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
ANTHROPIC_API_KEY=your_anthropic_key_here
TAVILY_API_KEY=your_tavily_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI Provider**: Claude 4 Haiku via Anthropic API
- **Search API**: Tavily
- **AI SDK**: Vercel AI SDK v5
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Markdown**: Streamdown (AI-optimized streaming markdown)

### How It Works

1. **User Input**: User asks a complex research question
2. **Query Decomposition**: Claude analyzes the question and generates 5-10 specific search queries
3. **Adaptive Depth**: For each query, Claude chooses "basic" (fast) or "advanced" (deep) search
4. **Parallel Execution**: All searches run simultaneously via `Promise.all()`
5. **Real-time Streaming**: Each search result streams to the UI as it completes
6. **Synthesis**: Claude combines all search results into a comprehensive answer
7. **Citation**: Sources are cited with clickable links



## 🔧 Configuration

### Adjust Number of Searches

In `/src/app/api/chat/route.ts`:

```typescript
searchQueries: z.array(z.object({
  query: z.string(),
  searchDepth: z.enum(['basic', 'advanced']),
})).min(5).max(10),  // Change these numbers
```

### Adjust Search Results Per Query

In `/src/app/api/chat/route.ts`:

```typescript
const response = await tavilyClient.search({
  query: item.query,
  max_results: 3,  // Change this number
  search_depth: item.searchDepth,
});
```

### Change AI Model

In `/src/app/api/chat/route.ts`:

```typescript
model: anthropic('claude-haiku-4-5-20251001'),  // Change model here
```

## 🎨 UI Features

- **Expandable Search Results**: Click any search to see detailed findings
- **Search Depth Indicators**: Badge shows "⚡ Basic" or "🔬 Advanced"
- **Floating Input**: Chat-style input that stays at bottom
- **Dark Mode**: Automatic theme support
- **Responsive Design**: Works on mobile and desktop

## 📚 Key Dependencies

```json
{
  "ai": "^5.0.72",                    // Vercel AI SDK
  "@ai-sdk/anthropic": "^2.0.30",    // Claude integration
  "@ai-sdk/react": "^1.0.0",         // React hooks
  "tavily": "^1.0.2",                 // Search API
  "streamdown": "latest",             // Markdown rendering
  "next": "15.5.5",                   // Framework
  "shadcn/ui": "latest"               // UI components
}
```

## 🔑 API Keys

### Get Anthropic API Key
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

### Get Tavily API Key
1. Sign up at [tavily.com](https://tavily.com)
2. Get your API key
3. Add to `.env.local` as `TAVILY_API_KEY`

## 🚀 Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📖 Learn More

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Tavily Search API](https://docs.tavily.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

Contributions welcome! This project was built as a learning exercise to understand:
- Parallel async operations with `Promise.all()`
- AI tool calling and multi-step workflows
- Real-time streaming with

