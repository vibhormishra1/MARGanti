"use client";

import React, { useEffect, useState, useRef } from "react";
import { Message, MessageProps } from "@marg/domain";
import { useRealTime } from "../context/RealTimeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInterfaceProps {
  channelId: string; // e.g., 'incident-123-chat'
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ channelId }) => {
  const { gateway, isConnected } = useRealTime();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Subscribe to channel
  useEffect(() => {
    const unsubscribe = gateway.subscribe(channelId, (event) => {
      if (event.type === "CHAT_MESSAGE") {
        setMessages((prev) => [...prev, event.data]);
      }
    });

    return () => unsubscribe();
  }, [gateway, channelId]);

  // Auto-scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // We simulate current user as ID 'user-1'
    const newMessage: MessageProps = {
      id: crypto.randomUUID(),
      senderId: "user-1",
      senderName: "Commander Sarah",
      content: inputText,
      type: "TEXT",
      timestamp: new Date(),
      readBy: ["user-1"],
    };

    // Publish optimistically to the gateway
    await gateway.publish(channelId, {
      type: "CHAT_MESSAGE",
      data: newMessage,
    });

    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span>💬</span> Live Operations Chat
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-xs text-slate-400">{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">No messages yet. Start the conversation.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === 'user-1' ? 'items-end' : 'items-start'}`}>
              <div className="text-[10px] text-slate-500 mb-1 ml-1">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}</div>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                msg.senderId === 'user-1' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <Input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message..."
          className="bg-slate-950 border-slate-800 text-white"
        />
        <Button type="submit" disabled={!inputText.trim()} className="bg-blue-600 hover:bg-blue-500">
          Send
        </Button>
      </form>
    </div>
  );
};
