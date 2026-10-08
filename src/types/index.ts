// Platform seçimi — VITE_API_PLATFORM ile kontrol edilecek
export type Platform = 'whatsapp' | 'max';

// Tek bir mesajın yapısı
export interface Message {
  id: string;              // Benzersiz mesaj kimliği (idMessage'den veya timestamp'ten)
  chatId: string;          // Hangi sohbete ait (örn. 905551234567@c.us)
  text: string;            // Mesaj metni
  timestamp: number;       // Unix ms
  isOutgoing: boolean;     // true → bizden gitti, false → bize geldi
}

// Bir sohbetin meta bilgisi
export interface Chat {
  chatId: string;          // 905551234567@c.us formatında
  phoneNumber: string;     // Sadece rakamlar: 905551234567
  lastMessage?: string;    // Önizleme için son mesaj metni
  lastMessageTime?: number;// Önizleme için sıralama
}

// GREEN-API'ye gönderilen mesaj isteği
export interface SendMessageRequest {
  chatId: string;
  message: string;
}

// GREEN-API'den dönen mesaj gönderme cevabı
export interface SendMessageResponse {
  idMessage: string;
}

// GREEN-API'den gelen bildirim zarfı
export interface Notification {
  receiptId: number;
  body: {
    typeWebhook: string;
    timestamp: number;
    idMessage: string;
    senderData: {
      chatId: string;
      sender: string;
      senderName?: string;
    };
    messageData: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
    };
  };
}

// API hataları için
export interface GreenApiError {
  code: number;
  message: string;
}