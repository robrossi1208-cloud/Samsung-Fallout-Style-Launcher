export interface AppIcon {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'social' | 'tools' | 'media' | 'system';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
