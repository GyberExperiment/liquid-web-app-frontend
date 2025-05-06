import styled from "@emotion/styled";

export const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 380px;
  height: 600px;
  background-color: #000;
  border: 1px solid #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const HeaderTitle = styled.h3`
  margin: 0 0 0 10px;
  color: #fff;
  font-size: 18px;
  flex-grow: 1;
`;

export const Body = styled.div`
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* Стилизация полосы прокрутки */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const Footer = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
`;

export const Input = styled.input`
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

export const SendButton = styled.button`
  margin-left: 10px;
  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

interface MessageContainerProps {
  sender: "user" | "ai";
}

export const MessageContainer = styled.div<MessageContainerProps>`
  display: flex;
  justify-content: ${(props: MessageContainerProps) => props.sender === "user" ? "flex-end" : "flex-start"};
  width: 100%;
`;

export const Message = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const MessageContent = styled.div`
  flex: 1;
  position: relative;
  padding-bottom: 16px;
`;

export const MessageTime = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0.7;
`;

export const AIMessage = styled(Message)`
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-top-left-radius: 4px;
`;

export const UserMessage = styled(Message)`
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-top-right-radius: 4px;
  justify-content: flex-end;
`;

export const AssistantAvatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #333;
  object-fit: cover;
`;

export const UserAvatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #666;
  object-fit: cover;
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  span {
    width: 6px;
    height: 6px;
    background-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out both;
    
    &:nth-of-type(1) {
      animation-delay: 0s;
    }
    &:nth-of-type(2) {
      animation-delay: 0.2s;
    }
    &:nth-of-type(3) {
      animation-delay: 0.4s;
    }
  }
  
  @keyframes typing {
    0%, 100% {
      transform: scale(0.6);
      opacity: 0.6;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
`;

export const SuggestionChip = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const QuickActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

export const QuickActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const ErrorContainer = styled.div`
  background-color: rgba(255, 59, 48, 0.15);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
`;

export const ErrorMessage = styled.p`
  color: #ff5b5b;
  margin: 0;
  font-size: 14px;
`;

interface VoiceButtonProps {
  active: boolean;
}

export const VoiceButton = styled.button<VoiceButtonProps>`
  margin-right: 10px;
  background-color: ${(props: VoiceButtonProps) => props.active ? 'rgba(255, 59, 48, 0.4)' : 'transparent'};
  border: 1px solid ${(props: VoiceButtonProps) => props.active ? '#ff3b30' : '#fff'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${(props: VoiceButtonProps) => props.active ? 'rgba(255, 59, 48, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

export const MarkdownContent = styled.div`
  color: #fff;
  line-height: 1.5;
  
  a {
    color: #7dd3fc;
    text-decoration: none;
    border-bottom: 1px dashed #7dd3fc;
    
    &:hover {
      border-bottom: 1px solid #7dd3fc;
    }
  }
  
  code {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 10px 0;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  ul, ol {
    padding-left: 20px;
    margin: 10px 0;
  }
  
  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    padding-left: 10px;
    margin: 10px 0;
    font-style: italic;
    color: rgba(255, 255, 255, 0.8);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    
    th, td {
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 6px 8px;
      text-align: left;
    }
    
    th {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const ToggleButton = styled.button`
  position: ${(props: any) => props.children === "✕" ? "static" : "fixed"};
  bottom: ${(props: any) => props.children === "✕" ? "auto" : "20px"};
  right: ${(props: any) => props.children === "✕" ? "auto" : "20px"};
  width: ${(props: any) => props.children === "✕" ? "24px" : "60px"};
  height: ${(props: any) => props.children === "✕" ? "24px" : "60px"};
  border-radius: 50%;
  background-color: ${(props: any) => props.children === "✕" ? "transparent" : "#000"};
  border: ${(props: any) => props.children === "✕" ? "none" : "1px solid #fff"};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10000;
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${(props: any) => props.children === "✕" ? "none" : "scale(1.1)"};
    background-color: ${(props: any) => props.children === "✕" ? "rgba(255, 255, 255, 0.1)" : "#000"};
  }
`;
