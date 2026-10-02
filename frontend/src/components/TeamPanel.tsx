import React, { useState } from 'react';
import { MessageItem, RoleEnum } from '../types';
import { sendTeamMessage } from '../services/api';

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
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
          SUB-UNIT COORDINATION NET
        </span>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-cyan)'
          }}
        >
          ROLE: {myRole.replace('_', ' ')}
        </span>
      </div>

      {/* Message list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: '20px' }}>
            No traffic on tactical net. Use this channel to challenge conflicting reports and coordinate actions.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_role === myRole;
            return (
              <div
                key={m.message_id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: isMe ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isMe ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: '4px',
                  padding: '8px 10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color:
                        m.sender_role === 'TEAM_LEAD'
                          ? 'var(--accent-cyan)'
                          : m.sender_role === 'COORDINATION'
                          ? 'var(--accent-green)'
                          : 'var(--accent-amber)'
                    }}
                  >
                    {m.sender_role.replace('_', ' ')}
                    {m.recipient_role && ` → ${m.recipient_role.replace('_', ' ')}`}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    T+{m.scenario_time}s
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#fff', wordBreak: 'break-word' }}>
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '10px',
          background: 'var(--bg-panel)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value as any)}
          style={{ width: '110px', fontSize: '11px', padding: '4px' }}
        >
          <option value="">NET (ALL)</option>
          <option value="TEAM_LEAD">LEAD</option>
          <option value="COORDINATION">COORD</option>
          <option value="INFORMATION">INFO/SIG</option>
        </select>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Transmit report, query delay, or issue order..."
          style={{ flex: 1, fontSize: '12px' }}
        />

        <button
          type="submit"
          disabled={isSending || !content.trim()}
          style={{
            background: 'var(--accent-blue)',
            color: '#fff',
            border: 'none',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '4px'
          }}
        >
          TRANSMIT
        </button>
      </form>
    </div>
  );
};
