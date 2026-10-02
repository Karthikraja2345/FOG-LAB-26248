import React, { useState } from 'react';
import { MessageItem, RoleEnum } from '../types';
import { sendTeamMessage } from '../services/api';
import { Send, Users } from 'lucide-react';

interface TeamPanelProps {
  sessionId: string;
  myRole: RoleEnum;
  myId: string;
  messages: MessageItem[];
  onMessageSent?: () => void;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  sessionId,
  myRole,
  myId,
  messages,
  onMessageSent
}) => {
  const [content, setContent] = useState<string>('');
  const [recipient, setRecipient] = useState<RoleEnum | ''>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    try {
      await sendTeamMessage(sessionId, {
        sender_id: myId,
        sender_role: myRole,
        recipient_role: recipient ? (recipient as RoleEnum) : null,
        content: content.trim()
      });
      setContent('');
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error('Failed to send team message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl flex flex-col h-full shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E5E5E5] bg-[#F9FAFB] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#14213D] text-[#FCA311] flex items-center justify-center">
            <Users size={15} />
          </div>
          <span className="font-serif text-sm font-bold text-[#14213D]">
            Sub-Unit Coordination Net
          </span>
        </div>
        <span className="text-xs font-mono font-semibold text-[#14213D] px-2 py-0.5 rounded bg-[#14213D]/5">
          {myRole.replace('_', ' ')}
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#6B7280]">
            No traffic on tactical net. Use this radio link to challenge conflicting reports and coordinate with other roles.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_role === myRole;
            return (
              <div
                key={m.message_id}
                className={`p-3 rounded-lg border text-xs ${
                  isMe
                    ? 'border-[#14213D]/20 bg-[#14213D]/5 ml-4'
                    : 'border-[#E5E5E5] bg-[#F9FAFB] mr-4'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-[11px] font-mono">
                  <span className="font-bold text-[#14213D]">
                    {m.sender_role.replace('_', ' ')}
                    {isMe ? ' (You)' : ''}
                    {m.recipient_role && ` → ${m.recipient_role.replace('_', ' ')}`}
                  </span>
                  <span className="text-[#6B7280]">T+{Math.round(m.scenario_time)}s</span>
                </div>
                <div className="text-[#14213D] leading-relaxed">{m.content}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#E5E5E5] bg-[#F9FAFB] space-y-2">
        <div className="flex gap-2">
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value as RoleEnum | '')}
            className="text-xs p-1.5 rounded border border-[#E5E5E5] bg-white text-[#14213D] focus:outline-none"
          >
            <option value="">Broadcast to All Roles</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="COORDINATION">Coordination Lead</option>
            <option value="INFORMATION">Information Lead</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type tactical message or challenge feed..."
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#14213D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#14213D]"
          />
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="px-4 py-2 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Send size={13} className="text-[#FCA311]" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};
