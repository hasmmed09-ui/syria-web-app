import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Send } from "lucide-react";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [req, u] = await Promise.all([
          base44.entities.ServiceRequest.get(id),
          base44.auth.me(),
        ]);
        setRequest(req);
        setUser(u);
        const msgs = await base44.entities.ChatMessage.filter(
          { request_id: id },
          "created_date"
        );
        setMessages(msgs);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data.request_id !== id) return;
      if (event.type === "create") {
        setMessages((prev) => [...prev, event.data]);
      } else if (event.type === "update") {
        setMessages((prev) => prev.map((m) => (m.id === event.data.id ? event.data : m)));
      } else if (event.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      }
    });
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user || !request) return;
    setSending(true);
    try {
      const senderRole = request.customer_id === user.id ? "customer" : "provider";
      await base44.entities.ChatMessage.create({
        request_id: id,
        sender_id: user.id,
        sender_name: user.full_name || "مستخدم",
        sender_role: senderRole,
        text: text.trim(),
      });
      setText("");
    } catch {}
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">الطلب غير موجود</p>
      </div>
    );
  }

  const otherName =
    request.customer_id === user?.id ? request.provider_name : request.customer_name;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <div className="app-container w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-card sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-base">{otherName || "المحادثة"}</h1>
            <p className="text-xs text-muted-foreground">{request.title}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-8">
              لا توجد رسائل بعد. ابدأ المحادثة!
            </p>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine ? "bg-primary text-primary-foreground" : "bg-card border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.sender_name}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-card p-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="اكتب رسالة..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}