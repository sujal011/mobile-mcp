
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { useToast } from '.././hooks/use-toast';
import { getModels, sendMessage, getChatMessages } from '../lib/api';
import type { ChatMessage } from '../types/chat';
import ToolMessage from './ToolMessage';

export default function Chat({ chatId }: { chatId: number }) {
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [models, setModels] = React.useState<string[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    const loadModels = async () => {
      try {
        const modelsList = await getModels();
        setModels(modelsList);
        setSelectedModel(modelsList[0]);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load models',
          variant: 'destructive',
        });
      }
    };

    const loadMessages = async () => {
      try {
        const messagesList = await getChatMessages(chatId);
        setMessages(messagesList);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      }
    };

    loadModels();
    loadMessages();
  }, [chatId]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedModel) return;

    try {
      const response = await sendMessage(chatId, message, selectedModel);
      setMessages([...messages, ...response.messages]);
      setMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/20 backdrop-blur-sm bg-white/10">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="bg-white/20 border-white/20">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          if (msg.role === 'tool') {
            return <ToolMessage key={msg.id} message={msg} />;
          }

          return (
            <Card
              key={msg.id}
              className={`p-4 max-w-[85%] ${
                msg.role === 'human' 
                  ? 'ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : 'mr-auto bg-white/90 text-gray-800'
              } rounded-2xl shadow-lg`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </Card>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/20 backdrop-blur-sm bg-white/10">
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-white/20 border-white/20 placeholder:text-gray-400 text-gray-800 focus:bg-white/30 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim() || !selectedModel}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
