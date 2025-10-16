'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import type { MyUIMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Expandable search result component with shadcn
function SearchResult({ data }: { 
  data: MyUIMessage['parts'][number] & { type: 'data-search-result' };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    switch (data.data.status) {
      case 'searching':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (data.data.status) {
      case 'searching':
        return <Badge variant="outline" className="ml-2">Searching...</Badge>;
      case 'complete':
        return <Badge variant="default" className="ml-2 bg-green-600">Complete</Badge>;
      case 'error':
        return <Badge variant="destructive" className="ml-2">Error</Badge>;
    }
  };

  return (
    <Card className="my-1.5 py-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors px-3 py-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {getStatusIcon()}
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {data.data.query}
                  </CardTitle>
                  {data.data.sources && (
                    <CardDescription className="text-xs mt-0.5">
                      {data.data.sources.length} sources found
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {data.data.sources && (
                  isOpen ? 
                    <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        {data.data.sources && (
          <CollapsibleContent>
            <Separator />
            <CardContent className="p-3 space-y-3">
              {data.data.sources.map((source, idx) => (
                <div key={idx} className="border-l-2 border-green-500 pl-3 py-1">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-sm text-green-700 dark:text-green-400 hover:underline flex items-center gap-1"
                  >
                    {source.title}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2 mb-2">
                    {source.content}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Relevance: {(source.score * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        )}
      </Collapsible>
    </Card>
  );
}

// Parse text and convert [Source: URL] patterns to link buttons
function parseTextWithLinks(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /\[Source:\s*(https?:\/\/[^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the link as a button
    const url = match[1];
    const domain = new URL(url).hostname.replace('www.', '');
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors mx-1"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {domain}
      </a>
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat<MyUIMessage>();

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-3xl mx-auto flex h-16 items-center px-4">
          <Search className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">Parallel Research Assistant</h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="container max-w-3xl mx-auto py-6 px-4 pb-32">
          {messages.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Welcome to Parallel Research</CardTitle>
                <CardDescription>
                  Ask a complex question and I&apos;ll break it down into multiple parallel searches,
                  providing you with comprehensive, up-to-date information.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              {messages.map(message => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    // User message - in a bubble/card
                    <div className="flex justify-end mb-4">
                      <Card className="max-w-[80%] bg-primary text-primary-foreground py-0">
                        <CardContent className="p-3">
                          {message.parts.map((part, i) => {
                            if (part.type === 'text') {
                              return <p key={i} className="text-sm">{part.text}</p>;
                            }
                            return null;
                          })}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // AI message - no bubble
                    <div className="mb-6">
                      <Badge variant="secondary" className="mb-3">AI Assistant</Badge>
                      
                      <div className="space-y-3">
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <div 
                                  key={`${message.id}-${i}`} 
                                  className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground"
                                >
                                  {parseTextWithLinks(part.text)}
                                </div>
                              );
                            
                            case 'data-search-result':
                              return (
                                <SearchResult 
                                  key={`${message.id}-${i}`}
                                  data={part}
                                />
                              );
                            
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <form 
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-10"
      >
        <div className="relative">
          <Textarea
            value={input}
            onChange={e => setInput(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput('');
                }
              }
            }}
            placeholder="Ask a research question... (Shift+Enter for new line)"
            disabled={status !== 'ready'}
            className="flex-1 min-h-[80px] max-h-[200px] resize-none pr-12 shadow-lg border-2 bg-background"
            rows={3}
          />
          <Button 
            type="submit" 
            disabled={status !== 'ready' || !input.trim()}
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
          >
            {status !== 'ready' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
