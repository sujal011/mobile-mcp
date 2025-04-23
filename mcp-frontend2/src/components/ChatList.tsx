
import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { createChat } from '../lib/api';

export default function ChatList({ onChatSelect }: { onChatSelect: (chatId: number) => void }) {
  const [newChatTitle, setNewChatTitle] = React.useState('');
  const [chats, setChats] = React.useState<Array<{ id: number; title: string }>>([]);
  const { toast } = useToast();

  const handleCreateChat = async () => {
    try {
      await createChat(newChatTitle);
      setChats([...chats, { id: chats.length + 1, title: newChatTitle }]);
      setNewChatTitle('');
      toast({
        title: 'Success',
        description: 'New chat created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex flex-col space-y-3">
        <Input
          placeholder="Enter chat title"
          value={newChatTitle}
          onChange={(e) => setNewChatTitle(e.target.value)}
          className="bg-white/20 border-white/20 placeholder:text-gray-400 text-gray-800 focus:bg-white/30 transition-colors"
        />
        <Button 
          onClick={handleCreateChat} 
          disabled={!newChatTitle}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <div className="flex flex-col space-y-3 overflow-y-auto">
        {chats.map((chat) => (
          <Card
            key={chat.id}
            className="p-4 cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 transition-all duration-200 transform hover:scale-[1.02]"
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-800 font-medium">{chat.title}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
