
import React from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import type { ChatMessage } from '@/types/chat';

interface ToolMessageProps {
  message: ChatMessage;
}

const ToolMessage = ({ message }: ToolMessageProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <Card className="mr-auto w-[85%] bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-md border-gray-700/30 text-gray-200">
        <CollapsibleTrigger className="flex items-center w-full p-3 hover:bg-gray-800/20 rounded-t-lg transition-colors">
          <Settings className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium">Tool Execution</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-3 pt-0">
          <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-900/30 p-2 rounded-md overflow-x-auto">
            {message.content}
          </pre>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ToolMessage;
