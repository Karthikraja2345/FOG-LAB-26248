import React, { useState, useEffect } from 'react';
import { DecisionContextCard, SessionResponse } from '../types';
import { DecisionContextCardView } from '../components/DecisionContextCard';
import { FileText, Shield, RefreshCw } from 'lucide-react';

interface DecisionReviewProps {
  session: SessionResponse;
}

export const DecisionReview: React.FC<DecisionReviewProps> = ({ session }) => {
  const [decisions, setDecisions] = useState<DecisionContextCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/sessions/${session.session_id}/decisions`)
      .then((res) => res.json())
      .then((data) => {
        setDecisions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [session.session_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-[#6B7280]">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin text-[#FCA311]" />
          <span>Retrieving immutable decision ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 pb-6 border-b border-[#E5E5E5]">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FCA311] uppercase tracking-wider mb-2">
          <Shield size={14} />
          DSSC Hindsight-Safe Audit Standard
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#14213D]">
          Command Decision Ledger & Context Cards
        </h2>
        <p className="text-sm text-[#4B5563] mt-1">
          Every decision records an exact snapshot of what feeds were knowable at the moment of commitment, eliminating outcome bias during evaluation.
        </p>
      </div>

      {decisions.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center text-[#6B7280] shadow-sm">
          <FileText size={32} className="text-[#14213D]/20 mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-[#14213D] mb-1">
            No Decisions Recorded in This Session Yet
          </h3>
          <p className="text-xs text-[#4B5563] max-w-md mx-auto">
            Decisions submitted by the Trainee Station will automatically be locked and auditable here.
          </p>
        </div>
      ) : (
        decisions.map((card) => <DecisionContextCardView key={card.decision_id} card={card} />)
      )}
    </div>
  );
};
