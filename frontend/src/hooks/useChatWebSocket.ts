import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { Message } from '../types';

interface ChatWebSocketHook {
  isConnected: boolean;
  sendMessage: (conversationId: string, content: string) => void;
  subscribeToConversation: (conversationId: string, callback: (message: Message) => void) => () => void;
}

/**
 * Hook for real-time chat messaging via WebSocket
 * Connects to /ws/chat and provides methods to send/receive messages
 */
export function useChatWebSocket(): ChatWebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // Create STOMP client with SockJS
    const socket = new SockJS('http://localhost:8080/ws/chat');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP:', str);
      },
      onConnect: () => {
        console.log('Connected to chat WebSocket');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('Disconnected from chat WebSocket');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    // Cleanup on unmount
    return () => {
      // Unsubscribe from all conversations
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();
      
      // Deactivate client
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const sendMessage = (conversationId: string, content: string) => {
    if (!clientRef.current || !isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    clientRef.current.publish({
      destination: `/app/chat/send/${conversationId}`,
      body: JSON.stringify({ content }),
    });
  };

  const subscribeToConversation = (
    conversationId: string,
    callback: (message: Message) => void
  ): (() => void) => {
    if (!clientRef.current || !isConnected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return () => {};
    }

    // Check if already subscribed
    const existingSub = subscriptionsRef.current.get(conversationId);
    if (existingSub) {
      return () => existingSub.unsubscribe();
    }

    // Subscribe to conversation topic
    const subscription = clientRef.current.subscribe(
      `/topic/conversation/${conversationId}`,
      (message: IMessage) => {
        try {
          const parsedMessage: Message = JSON.parse(message.body);
          callback(parsedMessage);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      }
    );

    subscriptionsRef.current.set(conversationId, subscription);

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(conversationId);
    };
  };

  return {
    isConnected,
    sendMessage,
    subscribeToConversation,
  };
}
