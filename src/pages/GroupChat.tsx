import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonFooter, IonInput, IonButton, IonItem, IonLabel,
  IonAvatar, IonCard, IonCardContent
} from "@ionic/react";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { createGesture } from "@ionic/react";
import api from "../api/axiosConfig";
import "../theme/chat.css";


interface Message {
  id: number;
  sender: { id: number; username: string; avatar?: string };
  content: string;
  timestamp: string;
  replyTo?: Message;        
  repliedBy?: Message[];    
}

interface RouteParams { id: string; }

interface MessageItemProps {
  msg: Message;
  setReplyTo: (msg: Message) => void;
}


const MessageItem: React.FC<MessageItemProps> = ({ msg, setReplyTo }) => {
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!msgRef.current) return;
    const gesture = createGesture({
      el: msgRef.current,
      threshold: 15,
      gestureName: "swipe-right",
      onMove: ev => { if (ev.deltaX > 50) setReplyTo(msg); }
    });
    gesture.enable();
  }, [msgRef.current]);

  return (
    <IonItem lines="none">
      
      {!msg.sender.avatar
        ? <IonAvatar slot="start">{msg.sender.username[0]}</IonAvatar>
        : <IonAvatar slot="start"><img src={msg.sender.avatar} alt={msg.sender.username} /></IonAvatar>
      }

      <div
        ref={msgRef}
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
        onContextMenu={e => { e.preventDefault(); setReplyTo(msg); }}
      >
       
        <IonLabel style={{ fontWeight: "bold", fontSize: "12px" }}>{msg.sender.username}</IonLabel>

      
        {msg.replyTo && (
          <IonCard style={{ margin: "4px 0", background: "#f0f0f0" }}>
            <IonCardContent style={{ fontSize: "12px", color: "#555" }}>
              {msg.replyTo.sender.username}: {msg.replyTo.content.length > 50 ? msg.replyTo.content.slice(0,50)+"..." : msg.replyTo.content}
            </IonCardContent>
          </IonCard>
        )}

       
        <IonLabel style={{ fontSize: "14px", wordBreak: "break-word" }}>{msg.content}</IonLabel>

       
        <IonLabel style={{ fontSize: "10px", color: "#666", alignSelf: "flex-end" }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </IonLabel>

       
        {msg.repliedBy && msg.repliedBy.map(reply => (
          <IonCard key={reply.id} style={{ margin: "4px 0", background: "#e8f4ff" }}>
            <IonCardContent style={{ fontSize: "12px", color: "#000" }}>
              {reply.sender.username} ↩: {reply.content.length > 50 ? reply.content.slice(0,50)+"..." : reply.content}
            </IonCardContent>
          </IonCard>
        ))}
      </div>
    </IonItem>
  );
};


const GroupChat: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupName, setGroupName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(false);

  const currentUserId = Number(localStorage.getItem("userId"));
  const contentRef = useRef<HTMLIonContentElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);


  const handleUserInteraction = () => {
    if (!audioAllowed) setAudioAllowed(true);
  };

  const fetchGroupName = async () => {
    try {
      const res = await api.get(`/groups/${id}/`);
      setGroupName(res.data.name);
    } catch {
      setGroupName(`Groupe #${id}`);
    }
  };


  const fetchMessages = async () => {
    try {
      const res = await api.get(`/groups/${id}/messages/`);
      const serverMessages: Message[] = res.data;

      setMessages(prevMessages => {
        const combined: Message[] = [];

        serverMessages.forEach(serverMsg => {
          const localMsg = prevMessages.find(m => m.id === serverMsg.id);

          if (localMsg) {
            const mergedReplies = [
              ...(serverMsg.repliedBy || []),
              ...(localMsg.repliedBy || []).filter(r => !serverMsg.repliedBy?.some(s => s.id === r.id))
            ];
            combined.push({ ...serverMsg, repliedBy: mergedReplies });
          } else {
            combined.push(serverMsg);
          }
        });

        combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (audioAllowed && serverMessages.length > prevMessages.length) {
          audioRef.current?.play().catch(() => {});
        }

        return combined;
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupName();
    fetchMessages();
    const interval = setInterval(() => {
      if (!isTyping) fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [id, isTyping, audioAllowed]);


  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage: Message = {
      id: Date.now(),
      sender: { id: currentUserId, username: "Moi" },
      content: newMessage,
      timestamp: new Date().toISOString(),
      replyTo: replyTo || undefined
    };

  
    if (replyTo) {
      setMessages(prev => prev.map(m => m.id === replyTo.id
        ? { ...m, repliedBy: [...(m.repliedBy || []), tempMessage] }
        : m
      ));
    }

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    setReplyTo(null);

    try {
      const res = await api.post(`/groups/${id}/messages/`, {
        content: tempMessage.content,
        group: id,
        replyTo: tempMessage.replyTo?.id
      });

      setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? res.data : msg));

    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  return (
    <IonPage onClick={handleUserInteraction}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{groupName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" ref={contentRef}>
        {messages.map(msg => (
          <MessageItem key={msg.id} msg={msg} setReplyTo={setReplyTo} />
        ))}
      </IonContent>

      <IonFooter>
        {replyTo && (
          <IonItem className="reply-banner">
            <IonLabel style={{ fontSize: "12px" }}>
              ↩ Répondre à {replyTo.sender.username}: {replyTo.content.length > 30 ? replyTo.content.slice(0,30)+"..." : replyTo.content}
            </IonLabel>
            <IonButton fill="clear" onClick={() => setReplyTo(null)}>Annuler</IonButton>
          </IonItem>
        )}

        <IonItem lines="none" style={{ display: "flex", padding: "8px", background: "#F0F0F0" }}>
          <IonInput
            value={newMessage}
            placeholder="Écrire un message..."
            onIonFocus={() => setIsTyping(true)}
            onIonBlur={() => setIsTyping(false)}
            onIonChange={(e) => setNewMessage(e.detail.value!)}
            style={{ flex: 1, background: "#fff", borderRadius: "24px", paddingLeft: "14px", color: "#000" }}
          />
          <IonButton onClick={sendMessage} color="primary" style={{ marginLeft: "8px", borderRadius: "24px" }}>
            Envoyer
          </IonButton>
        </IonItem>
      </IonFooter>

      <audio ref={audioRef} src="/assets/notification.mp3" preload="auto" />
    </IonPage>
  );
};

export default GroupChat;
