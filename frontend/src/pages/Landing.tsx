import React, { useState } from 'react';
import { SessionResponse } from '../types';
import { createSession } from '../services/api';
import {
  Radio,
  SlidersHorizontal,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';

interface LandingProps {
  onSessionLaunched: (session: SessionResponse, targetView: string) => void;
  currentSession?: SessionResponse | null;
}

export const Landing: React.FC<LandingProps> = ({ onSessionLaunched }) => {
  const [activeScenarioTab, setActiveScenarioTab] = useState<'b' | 'a' | 'c'>('b');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const handleQuickDemo = async (scenarioId: string, role: string = 'instructor') => {
    setIsLaunching(true);
    try {
      const sess = await createSession(scenarioId, 424242);
      onSessionLaunched(sess, role);
    } catch (err) {
      console.error('Failed to quick start demo:', err);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="w-full bg-[#F4F5F7] min-h-screen text-[#14213D]">
      {/* Top Institutional Crest Banner */}
      <section className="bg-white border-b border-[#E5E5E5] pt-12 pb-14 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14213D]/5 border border-[#14213D]/15 text-xs font-semibold uppercase tracking-wider text-[#14213D] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FCA311]"></span>
            <span>Ministry of Defence (MoD) • Defence Services Staff College (DSSC)</span>
            <span className="text-[#9CA3AF]">•</span>
            <span className="font-mono text-[#FCA311]">PS-26248</span>
          </div>

          {/* Main Title with Alice Serif Font */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-[#14213D] tracking-tight mb-6">
            Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments
          </h1>

          {/* Executive Subtitle */}
          <p className="text-base sm:text-lg text-[#4B5563] max-w-3xl leading-relaxed mb-8">
            An evidence-backed simulation architecture designed to separate ground truth from trainee perception. Train operational sub-units to make coordinated decisions under RF occlusion, sensor contradiction, and telemetry staleness—with hindsight-safe after-action auditing.
          </p>

          {/* Action CTAs with High-End Styling */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleQuickDemo('conflicting-picture', 'instructor')}
              disabled={isLaunching}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#14213D] text-white font-medium text-sm hover:bg-[#0B132B] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <SlidersHorizontal size={17} className="text-[#FCA311]" />
              <span>Launch Instructor Control Room</span>
              <ArrowRight size={16} className="text-white/70" />
            </button>

            <button
              onClick={() => handleQuickDemo('conflicting-picture', 'trainee')}
              disabled={isLaunching}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#FCA311] text-[#000000] font-semibold text-sm hover:bg-[#E08C05] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Radio size={17} className="text-[#14213D]" />
              <span>Enter Trainee Sub-Unit Station</span>
            </button>

            <button
              onClick={() => handleQuickDemo('conflicting-picture', 'aar')}
              disabled={isLaunching}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-white border border-[#E5E5E5] text-[#14213D] font-medium text-sm hover:bg-[#F9FAFB] transition-all shadow-sm"
            >
              <Activity size={17} className="text-[#14213D]" />
              <span>Audit After-Action Review (AAR)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metric Divider Ribbon (Institutional Style) */}
      <section className="border-b border-[#E5E5E5] bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E5E5E5]">
          <div className="p-6">
            <div className="text-xs uppercase font-semibold text-[#6B7280] tracking-wider mb-1">Fault Simulation</div>
            <div className="font-serif text-2xl font-bold text-[#14213D]">7 Transforms</div>
            <p className="text-xs text-[#4B5563] mt-1">Delay, Dropout, Contradiction, Staleness, Partial, Intermittent, Recovery</p>
          </div>

          <div className="p-6">
            <div className="text-xs uppercase font-semibold text-[#6B7280] tracking-wider mb-1">AAR Methodology</div>
            <div className="font-serif text-2xl font-bold text-[#14213D]">Hindsight-Safe</div>
            <p className="text-xs text-[#4B5563] mt-1">Evaluates decisions strictly against information available at submission</p>
          </div>

          <div className="p-6">
            <div className="text-xs uppercase font-semibold text-[#6B7280] tracking-wider mb-1">Verification Engine</div>
            <div className="font-serif text-2xl font-bold text-[#14213D]">100% Deterministic</div>
            <p className="text-xs text-[#4B5563] mt-1">Tick-based discrete clock with counterfactual branch delta score</p>
          </div>

          <div className="p-6">
            <div className="text-xs uppercase font-semibold text-[#6B7280] tracking-wider mb-1">Network Security</div>
            <div className="font-serif text-2xl font-bold text-[#14213D]">Role Isolation</div>
            <p className="text-xs text-[#4B5563] mt-1">Server-side WebSocket masking prevents trainee information leaks</p>
          </div>
        </div>
      </section>

      {/* Interactive Scenario Carousel / Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase font-semibold text-[#FCA311] tracking-wider mb-1">Operational Scenarios</div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#14213D]">Exercise Scenario Catalog</h2>
            <p className="text-sm text-[#4B5563] mt-1">Pre-configured tactical problem spaces mapped to DSSC instructional doctrine.</p>
          </div>

          {/* Carousel Tabs */}
          <div className="inline-flex p-1 bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
            <button
              onClick={() => setActiveScenarioTab('b')}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeScenarioTab === 'b'
                  ? 'bg-[#14213D] text-white shadow-sm'
                  : 'text-[#4B5563] hover:text-[#14213D]'
              }`}
            >
              Scenario B (Primary Demo)
            </button>
            <button
              onClick={() => setActiveScenarioTab('a')}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeScenarioTab === 'a'
                  ? 'bg-[#14213D] text-white shadow-sm'
                  : 'text-[#4B5563] hover:text-[#14213D]'
              }`}
            >
              Scenario A (Silent Window)
            </button>
            <button
              onClick={() => setActiveScenarioTab('c')}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeScenarioTab === 'c'
                  ? 'bg-[#14213D] text-white shadow-sm'
                  : 'text-[#4B5563] hover:text-[#14213D]'
              }`}
            >
              Scenario C (Multi-Domain)
            </button>
          </div>
        </div>

        {/* Selected Scenario Display Panel */}
        {activeScenarioTab === 'b' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded bg-[#FCA311]/15 text-[#B45309] border border-[#FCA311]/30 text-xs font-semibold">
                    RECOMMENDED JUDGE DEMO
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                    ID: conflicting-picture
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono flex items-center gap-1">
                    <Clock size={12} /> 360s Duration
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#14213D] mb-3">
                  Scenario B: Conflicting Picture in Grid Sector 7
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
                  Forward tactical optical UAV reports an aggressive hostile armored push along Axis Alpha, while ground-based HUMINT signals a diversionary decoy with primary armor maneuvering through Axis Bravo. Radar telemetry experiences selective delay, forcing sub-unit commanders to deconflict sensor ambiguity before committing mobile artillery.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5]">
                    <div className="text-[11px] font-semibold text-[#6B7280] uppercase">Sub-Unit Roles</div>
                    <div className="text-xs font-medium text-[#14213D] mt-1">Team Lead, Coordination, Information</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5]">
                    <div className="text-[11px] font-semibold text-[#6B7280] uppercase">Sensor Inputs</div>
                    <div className="text-xs font-medium text-[#14213D] mt-1">Optical UAV, Ground Radar, OP Echo HUMINT</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5]">
                    <div className="text-[11px] font-semibold text-[#6B7280] uppercase">Degradation Profile</div>
                    <div className="text-xs font-medium text-[#14213D] mt-1">Contradiction, Jittered Delay, Channel Dropout</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuickDemo('conflicting-picture', 'instructor')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] transition-all"
                  >
                    <span>Launch as Instructor</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => handleQuickDemo('conflicting-picture', 'trainee')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#14213D] text-xs font-semibold hover:bg-[#F9FAFB] transition-all"
                  >
                    <Radio size={14} className="text-[#FCA311]" />
                    <span>Join as Trainee</span>
                  </button>
                </div>
              </div>

              {/* Learning Objectives Sidebar */}
              <div className="lg:w-80 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg p-5">
                <div className="text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FCA311]" />
                  Learning Objectives
                </div>
                <ul className="space-y-2.5 text-xs text-[#4B5563]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Cross-examine contradictory optical vs HUMINT battle reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Avoid committing heavy assets based on unverified unilateral feeds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Maintain synchronized sub-unit situational awareness across roles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeScenarioTab === 'a' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                    ID: silent-window
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono flex items-center gap-1">
                    <Clock size={12} /> 300s Duration
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#14213D] mb-3">
                  Scenario A: Silent Window & Comm-Loss Protocol
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
                  Sub-unit operating in mountainous terrain experiences sudden electronic spectrum occlusion, resulting in feed dropout and latency spikes during a planned logistics corridor escort. Trainees must execute contingency silence protocols without uncoordinated panicking.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuickDemo('silent-window', 'instructor')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] transition-all"
                  >
                    <span>Launch as Instructor</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => handleQuickDemo('silent-window', 'trainee')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#14213D] text-xs font-semibold hover:bg-[#F9FAFB] transition-all"
                  >
                    <Radio size={14} className="text-[#FCA311]" />
                    <span>Join as Trainee</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeScenarioTab === 'c' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                    ID: multi-domain-disruption
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono flex items-center gap-1">
                    <Clock size={12} /> 420s Duration
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#14213D] mb-3">
                  Scenario C: Multi-Domain Disruption (Land/Air/Cyber/EW)
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed mb-6">
                  High-tempo inter-service operation involving forward air coordination, ground forces telemetry, and EW spectrum receivers. Blue-force land tracking freezes with high staleness while EW packet corruptions force rapid backup voice deconfliction.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuickDemo('multi-domain-disruption', 'instructor')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] transition-all"
                  >
                    <span>Launch as Instructor</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => handleQuickDemo('multi-domain-disruption', 'trainee')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#14213D] text-xs font-semibold hover:bg-[#F9FAFB] transition-all"
                  >
                    <Radio size={14} className="text-[#FCA311]" />
                    <span>Join as Trainee</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3-Pillar Institutional Architecture */}
      <section className="bg-white border-t border-[#E5E5E5] py-14 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase font-semibold text-[#FCA311] tracking-wider mb-2">Core Technology</div>
            <h2 className="font-serif text-3xl font-bold text-[#14213D]">
              Evidence-Backed Architecture for Degraded Environments
            </h2>
            <p className="text-sm text-[#4B5563] mt-2">
              Engineered specifically to solve the DSSC requirement: separating what really happened from what commanders perceived.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#F9FAFB] border border-[#E5E5E5] hover:border-[#14213D]/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#14213D] text-[#FCA311] flex items-center justify-center mb-4">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14213D] mb-2">
                01. Degradation Engine
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Applies 7 mathematical transforms including deterministic latency jitter, stochastic packet dropouts, synthetic contradictions, and telemetry staleness aging across individual communication channels.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F9FAFB] border border-[#E5E5E5] hover:border-[#14213D]/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#14213D] text-[#FCA311] flex items-center justify-center mb-4">
                <Radio size={20} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14213D] mb-2">
                02. Role Asymmetry Isolation
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Server-side WebSocket masking ensures each sub-unit role only receives its authorized and degraded perspective. No trainee can peek at true ground reality in the browser DOM.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F9FAFB] border border-[#E5E5E5] hover:border-[#14213D]/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#14213D] text-[#FCA311] flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14213D] mb-2">
                03. Hindsight-Safe AAR
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Every decision records an immutable snapshot of what feeds were delivered, stale, or conflicting at that exact millisecond, preventing instructors from penalizing commanders for unknown ground truth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Disclaimer Banner */}
      <footer className="border-t border-[#E5E5E5] bg-[#EFEFEF] py-8 px-6 text-center text-xs text-[#6B7280]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-left">
            <Lock size={15} className="text-[#14213D] shrink-0" />
            <span>
              <strong>DSSC Evaluation Platform:</strong> Non-operational simulation trainer. Uses abstract tactical symbology with zero weapons kinetic targeting and zero classified data.
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#4B5563]">
            PS-26248 • DSSC WELLINGTON
          </div>
        </div>
      </footer>
    </div>
  );
};
