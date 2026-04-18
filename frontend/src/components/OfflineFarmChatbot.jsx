import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";


const MAX_HISTORY_MESSAGES = 14;


function getFallbackReply(userName, recommendedCrop) {
  const name = userName || "Farmer";
  const crop = recommendedCrop || "the recommended crop";
  return `Unable to fetch response. Please try again. Based on your current farm data, ${name}, focus on ${crop} and ask again about soil, water, fertilizer, yield, or risk.`;
}


function ChatbotContent({ recommendedCrop, soil, weather, land, compact = false }) {
  const { user } = useAuth();
  const [userName] = useState(user?.name || "Farmer");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask about best crop, soil, water, fertilizer, yield, risk, or how this simulator works.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const farmData = useMemo(
    () => ({
      userName,
      recommendedCrop,
      soil,
      weather,
      land,
    }),
    [userName, recommendedCrop, soil, weather, land],
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (userInput) => {
    const userMessage = { role: "user", content: userInput };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const recentMessages = nextMessages.slice(-MAX_HISTORY_MESSAGES);
      const response = await api.post("/chatbot", {
        messages: recentMessages,
        farmData,
      });

      const assistantContent =
        response.data?.reply?.trim() ||
        getFallbackReply(farmData.userName, farmData.recommendedCrop);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantContent,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: getFallbackReply(farmData.userName, farmData.recommendedCrop),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const message = draft.trim();
    if (!message || isLoading) {
      return;
    }

    setDraft("");
    sendMessage(message);
  };

  return (
    <div className={`${compact ? "h-[50vh] max-h-[430px]" : "h-80"} flex flex-col`}>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-[#111827] p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                message.role === "user"
                  ? "bg-[#22c55e] text-[#0f172a]"
                  : "border border-[#22c55e]/20 bg-white/10 text-stone-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-xl border border-[#22c55e]/20 bg-white/10 px-4 py-3 text-sm text-stone-100">
              Thinking with your farm data...
            </div>
          </div>
        ) : null}
        <div ref={scrollRef} />
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !isLoading) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about best crop, soil, water, fertilizer, or risk"
          className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition placeholder:text-[#9ca3af] focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-[#22c55e] px-4 py-3 font-semibold text-[#0f172a] transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


export default function OfflineFarmChatbot({ recommendedCrop, soil, weather, land, embedded = false }) {
  if (embedded) {
    return (
      <ChatbotContent
        recommendedCrop={recommendedCrop}
        soil={soil}
        weather={weather}
        land={land}
        compact
      />
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[#1f2937] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2 text-[#22c55e]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Offline Farm Chatbot</h2>
          <p className="mt-1 text-sm text-[#9ca3af]">AI answers are generated from your current farm data and chat memory.</p>
        </div>
      </div>

      <ChatbotContent recommendedCrop={recommendedCrop} soil={soil} weather={weather} land={land} />
    </section>
  );
}
