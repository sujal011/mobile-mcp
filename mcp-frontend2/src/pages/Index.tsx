
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatList from '@/components/ChatList';
import Chat from '@/components/Chat';
import Settings from '@/components/Settings';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  const [selectedChatId, setSelectedChatId] = React.useState<number | null>(null);
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10">
        <AppSidebar onChatSelect={setSelectedChatId} />
        <div className="flex-1">
          <header className="flex justify-between items-center p-4 backdrop-blur-sm bg-white/10 border-b border-white/20">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Chat App
              </h1>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowSettings(!showSettings)}
              className="hover:bg-white/20 transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-indigo-500" />
            </Button>
          </header>

          <main className="flex-1 bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm">
            {showSettings ? (
              <Settings />
            ) : selectedChatId ? (
              <Chat chatId={selectedChatId} />
            ) : (
              <ChatList onChatSelect={setSelectedChatId} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Index;
