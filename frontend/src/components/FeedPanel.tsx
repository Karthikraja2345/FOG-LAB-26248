import React from 'react';
import { TraineeFeedItem } from '../types';
import { FeedStatusBadge } from './FeedStatus';
import { Radio, AlertTriangle, ShieldAlert } from 'lucide-react';

interface FeedPanelProps {
  feeds: TraineeFeedItem[];
  scenarioTime?: number;
}

export const FeedPanel: React.FC<FeedPanelProps> = ({ feeds }) => {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl flex flex-col h-full shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#F9FAFB] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#14213D] text-[#FCA311] flex items-center justify-center">
            <Radio size={15} />
          </div>
          <span className="font-serif text-sm font-bold text-[#14213D]">
            Tactical Sensor & Intelligence Feeds
          </span>
        </div>
        <span className="text-xs font-mono text-[#6B7280]">
          {feeds.length} Channels Monitored
        </span>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {feeds.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#6B7280]">
            No tactical feeds routed to this terminal role.
          </div>
        ) : (
          feeds.map((feed) => {
            const isDropped = feed.status === 'DROPPED';
            const isConflicted = feed.is_conflicted;
            const isDelayed = feed.status === 'DELAYED';

            return (
              <div
                key={feed.source_id}
                className={`p-4 rounded-lg border transition-all ${
                  isConflicted
                    ? 'border-purple-300 bg-purple-50/30'
                    : isDropped
                    ? 'border-red-200 bg-red-50/20'
                    : isDelayed
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-[#E5E5E5] bg-white hover:border-[#14213D]/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#14213D]">
                      {feed.source_name}
                    </h4>
                    <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                      {feed.source_id} • Reliability: {Math.round(feed.reliability * 100)}% ({feed.confidence_class})
                    </div>
                  </div>
                  <FeedStatusBadge
                    status={feed.status}
                    ageSeconds={feed.age_seconds}
                    isConflicted={feed.is_conflicted}
                  />
                </div>

                {isDropped ? (
                  <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <ShieldAlert size={14} className="shrink-0" />
                    <span>Telemetry link offline. Channel dropout active.</span>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {/* Content Attributes */}
                    <div className="p-2.5 rounded bg-[#F9FAFB] border border-[#E5E5E5] font-mono text-xs">
                      {Object.entries(feed.content).map(([k, v]) => (
                        <div key={k} className="flex justify-between py-0.5">
                          <span className="text-[#6B7280]">{k.replace('_', ' ')}:</span>
                          <span className="font-semibold text-[#14213D]">{String(v)}</span>
                        </div>
                      ))}
                    </div>

                    {isConflicted && (
                      <div className="p-2 rounded bg-purple-50 border border-purple-200 text-purple-700 text-xs flex items-center gap-1.5 font-medium">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span>Contradicts other sub-unit sensor reports. Verify before acting.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
