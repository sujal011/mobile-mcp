
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getChats } from '@/lib/api';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface ChatListProps {
  onChatSelect: (chatId: number) => void;
}

export function AppSidebar({ onChatSelect }: ChatListProps) {
  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats?.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    onClick={() => onChatSelect(chat.id)}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{chat.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
