
import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMcpConfig, updateMcpConfig } from '@/lib/api';
import type { McpConfig } from '@/types/chat';

export default function Settings() {
  const [config, setConfig] = React.useState<McpConfig>();
  const [configText, setConfigText] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const { configFile } = await getMcpConfig();
        setConfig(configFile);
        setConfigText(JSON.stringify(configFile, null, 2));
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load MCP config',
          variant: 'destructive',
        });
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      const parsedConfig = JSON.parse(configText);
      await updateMcpConfig(parsedConfig);
      toast({
        title: 'Success',
        description: 'Config updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update config',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4 m-4">
      <h2 className="text-2xl font-bold mb-4">MCP Configuration</h2>
      <textarea
        value={configText}
        onChange={(e) => setConfigText(e.target.value)}
        className="w-full h-[400px] font-mono text-sm bg-slate-900 text-slate-50 p-4 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
        spellCheck="false"
      />
      <Button onClick={handleSave} className="mt-4">
        Save Configuration
      </Button>
    </Card>
  );
}
