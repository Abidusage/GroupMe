import React from "react";
import { IonItem, IonLabel, IonText, IonAvatar } from "@ionic/react";

interface Props {
  isOwn: boolean;
  sender: string;
  avatar?: string;
  content: string;
  timestamp: string;
  onReply?: () => void;
}

const IonMessageBubble: React.FC<Props> = ({ isOwn, sender, avatar, content, timestamp, onReply }) => {
  return (
    <IonItem lines="none" style={{ justifyContent: isOwn ? "flex-end" : "flex-start", padding: "0 10px" }}>
      {!isOwn && avatar && (
        <IonAvatar slot="start" style={{ marginRight: "8px" }}>
          <img src={avatar} alt={sender} />
        </IonAvatar>
      )}

      <div
        className={`bubble ${isOwn ? "own" : "other"}`}
        onClick={onReply}
        style={{
          maxWidth: "75%",
          borderRadius: "18px",
          padding: "8px 12px",
          background: isOwn ? "#0088FF" : "#FFFFFF",
          color: isOwn ? "#fff" : "#000",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.3s",
        }}
      >
        {!isOwn && <IonLabel style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "2px" }}>{sender}</IonLabel>}
        <IonText style={{ fontSize: "14px", wordWrap: "break-word" }}>{content}</IonText>
        <IonText style={{ fontSize: "10px", opacity: 0.5, alignSelf: "flex-end" }}>
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </IonText>
      </div>
    </IonItem>
  );
};

export default IonMessageBubble;
