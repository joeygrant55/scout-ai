'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReportResponse } from '@/lib/reportApi';

export default function ReportResults() {
  const router = useRouter();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Get report data from sessionStorage
    const reportData = sessionStorage.getItem('sparq-report');
    
    if (!reportData) {
      // No report data, redirect to calculator
      router.push('/report');
      return;
    }

    try {
      const parsed = JSON.parse(reportData);
      setReport(parsed);
      
      // Trigger animations after a brief delay
      setTimeout(() => setAnimated(true), 100);
    } catch (err) {
      console.error('Failed to parse report data:', err);
      router.push('/report');
    }
  }, [router]);

  if (!report) {
    return (
      <div className="min-h-screen bg-gmtm-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gmtm-purple"></div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    const tierLower = tier.toLowerCase();
    if (tierLower.includes('pro')) return 'text-gmtm-lime';
    if (tierLower.includes('elite')) return 'text-gmtm-purple';
    if (tierLower.includes('above')) return 'text-gmtm-info';
    if (tierLower.includes('average')) return 'text-gmtm-text-secondary';
    return 'text-gmtm-text-muted';
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'bg-gmtm-lime';
    if (percentile >= 75) return 'bg-gmtm-purple';
    if (percentile >= 50) return 'bg-gmtm-info';
    return 'bg-gmtm-text-muted';
  };

  const getPercentileTextColor = (percentile: number) => {
    if (percentile >= 90) return 'text-gmtm-lime';
    if (percentile >= 75) return 'text-gmtm-purple';
    if (percentile >= 50) return 'text-gmtm-info';
    return 'text-gmtm-text-muted';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gmtm-bg via-gmtm-bg-secondary to-gmtm-purple-light">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Section 1: Score Hero */}
        <section className={`bg-white rounded-2xl shadow-card-hover p-8 md:p-12 mb-8 text-center transition-all duration-1000 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-6">
            <div className="text-7xl md:text-9xl font-black text-gmtm-sidebar mb-4 transition-all duration-1000" style={{ 
              transform: animated ? 'scale(1)' : 'scale(0.8)',
            }}>
              {report.sparq_score.toFixed(1)}
            </div>
            <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold tracking-wide ${getTierColor(report.tier)} bg-gmtm-purple-light border-2 border-current`}>
              {report.tier.toUpperCase()}
            </div>
          </div>

          {/* Tier Scale Visualization */}
          <div className="mt-8 mb-6">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              {['Beginner', 'Average', 'Above Average', 'Elite', 'Pro-Level'].map((tier, idx) => (
                <div key={tier} className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mb-2 ${
                    report.tier.toLowerCase().includes(tier.toLowerCase().replace('-', ' ')) 
                      ? 'bg-gmtm-purple scale-150' 
                      : 'bg-gmtm-border'
                  }`}></div>
                  <span className={`text-xs ${
                    report.tier.toLowerCase().includes(tier.toLowerCase().replace('-', ' '))
                      ? 'text-gmtm-purple font-bold'
                      : 'text-gmtm-text-muted'
                  }`}>
                    {tier.split(' ').map((word, i) => (
                      <div key={i} className="hidden md:block">{word}</div>
                    ))}
                    <div className="md:hidden">{tier.split(' ')[0]}</div>
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gmtm-border rounded-full max-w-2xl mx-auto -mt-2"></div>
          </div>

          {report.athlete_name && (
            <div className="text-xl md:text-2xl font-bold text-gmtm-text">
              {report.athlete_name}
              {report.grad_year && <span className="text-gmtm-text-secondary font-normal"> • Class of {report.grad_year}</span>}
            </div>
          )}
        </section>

        {/* Section 2: Metric Percentile Bars */}
        <section className={`bg-white rounded-2xl shadow-card-hover p-8 mb-8 transition-all duration-1000 delay-100 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-gmtm-text mb-6">Your Performance Breakdown</h2>
          <div className="space-y-6">
            {report.metric_percentiles.map((metric, idx) => (
              <div key={idx} className="transition-all duration-500" style={{ 
                transitionDelay: `${idx * 100}ms`,
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateX(0)' : 'translateX(-20px)',
              }}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-semibold text-gmtm-text">
                    {metric.metric_name}: <span className="text-gmtm-purple">{metric.value}{metric.unit}</span>
                  </span>
                  <span className={`text-sm font-bold ${getPercentileTextColor(metric.percentile)}`}>
                    {metric.percentile}th percentile
                  </span>
                </div>
                <div className="h-3 bg-gmtm-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPercentileColor(metric.percentile)} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: animated ? `${metric.percentile}%` : '0%',
                      transitionDelay: `${idx * 100 + 200}ms`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gmtm-text-secondary mt-1">
                  out of {metric.sample_size.toLocaleString()} athletes
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: NFL Comparison */}
        {report.nfl_comparisons && report.nfl_comparisons.length > 0 && (
          <section className={`bg-gradient-to-br from-gmtm-sidebar to-gmtm-sidebar-hover rounded-2xl shadow-card-hover p-8 mb-8 text-white transition-all duration-1000 delay-200 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-3xl mr-3">🏈</span>
              NFL Combine Comparison
            </h2>
            {report.nfl_comparisons.map((comparison, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                <h3 className="text-lg font-bold text-gmtm-lime mb-4">{comparison.metric_name}</h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {comparison.better_than && comparison.better_than.length > 0 && (
                    <div className="bg-gmtm-success/10 border border-gmtm-success/30 rounded-lg p-4">
                      <div className="text-gmtm-success font-bold mb-2 text-sm">✓ Better than:</div>
                      <ul className="text-sm space-y-1">
                        {comparison.better_than.map((player, i) => (
                          <li key={i} className="text-white/90">{player}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {comparison.similar_to && comparison.similar_to.length > 0 && (
                    <div className="bg-gmtm-lime/10 border border-gmtm-lime/30 rounded-lg p-4">
                      <div className="text-gmtm-lime font-bold mb-2 text-sm">≈ Similar to:</div>
                      <ul className="text-sm space-y-1">
                        {comparison.similar_to.map((player, i) => (
                          <li key={i} className="text-white/90">{player}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {comparison.working_towards && comparison.working_towards.length > 0 && (
                    <div className="bg-gmtm-warning/10 border border-gmtm-warning/30 rounded-lg p-4">
                      <div className="text-gmtm-warning font-bold mb-2 text-sm">↑ Working towards:</div>
                      <ul className="text-sm space-y-1">
                        {comparison.working_towards.map((player, i) => (
                          <li key={i} className="text-white/90">{player}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {comparison.pro_comparison_quote && (
                  <div className="bg-white/10 border-l-4 border-gmtm-lime rounded-lg p-4 mb-2">
                    <p className="italic text-white/90">"{comparison.pro_comparison_quote}"</p>
                  </div>
                )}

                {comparison.sparq_historical_match && (
                  <div className="bg-gmtm-purple/20 border border-gmtm-purple/40 rounded-lg p-4">
                    <div className="text-gmtm-lime text-xs font-bold mb-1">SPARQ HISTORICAL MATCH</div>
                    <p className="text-sm text-white/90">{comparison.sparq_historical_match}</p>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Section 4: AI Analysis */}
        <section className={`bg-white rounded-2xl shadow-card-hover p-8 mb-8 transition-all duration-1000 delay-300 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-gmtm-text mb-6 flex items-center">
            <span className="text-3xl mr-3">🤖</span>
            AI Performance Analysis
          </h2>
          
          {/* Recruiting Headline */}
          <div className="bg-gradient-to-r from-gmtm-lime-muted to-gmtm-purple-light border-l-4 border-gmtm-purple rounded-lg p-6 mb-6">
            <div className="text-xs font-bold text-gmtm-purple mb-2">RECRUITING HEADLINE</div>
            <p className="text-xl md:text-2xl font-bold text-gmtm-text italic">
              "{report.ai_analysis.recruiting_headline}"
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <div>
              <h3 className="font-bold text-gmtm-success mb-3 flex items-center">
                <span className="mr-2">💪</span> Strengths
              </h3>
              <ul className="space-y-2">
                {report.ai_analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <span className="text-gmtm-success mr-2 mt-0.5">✓</span>
                    <span className="text-gmtm-text">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Development Areas */}
            <div>
              <h3 className="font-bold text-gmtm-warning mb-3 flex items-center">
                <span className="mr-2">🎯</span> Development Areas
              </h3>
              <ul className="space-y-2">
                {report.ai_analysis.development_areas.map((area, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <span className="text-gmtm-warning mr-2 mt-0.5">→</span>
                    <span className="text-gmtm-text">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Training Priority */}
          <div className="bg-gmtm-sidebar text-white rounded-lg p-6">
            <div className="text-xs font-bold text-gmtm-lime mb-2">PRIORITY TRAINING FOCUS</div>
            <p className="text-lg font-semibold">{report.ai_analysis.training_priority}</p>
          </div>
        </section>

        {/* Section 5: Cross-Sport Opportunities */}
        {report.cross_sport_opportunities.length > 0 && (
          <section className={`bg-white rounded-2xl shadow-card-hover p-8 mb-8 transition-all duration-1000 delay-400 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold text-gmtm-text mb-6 flex items-center">
              <span className="text-3xl mr-3">🌟</span>
              Cross-Sport Opportunities
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {report.cross_sport_opportunities.map((sport, idx) => (
                <div 
                  key={idx} 
                  className={`border-2 rounded-lg p-5 transition-all hover:shadow-lg ${
                    sport.is_olympic 
                      ? 'border-gmtm-lime bg-gmtm-lime-muted' 
                      : 'border-gmtm-border bg-gmtm-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gmtm-text text-lg">{sport.sport}</h3>
                    {sport.is_olympic && (
                      <span className="text-2xl">🥇</span>
                    )}
                  </div>
                  <p className="text-sm text-gmtm-text-secondary mb-2">
                    {sport.athletes_matched.toLocaleString()} athletes matched
                  </p>
                  <p className="text-sm text-gmtm-text">{sport.reason}</p>
                  {sport.is_olympic && (
                    <div className="mt-3 pt-3 border-t border-gmtm-lime">
                      <p className="text-xs font-bold text-gmtm-purple">
                        ⭐ Flag Football is a 2028 Olympic Sport!
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Projections */}
        <section className={`bg-white rounded-2xl shadow-card-hover p-8 mb-8 transition-all duration-1000 delay-500 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-gmtm-text mb-6 flex items-center">
            <span className="text-3xl mr-3">📊</span>
            Recruiting Projections
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Scholarship Likelihood */}
            <div className="text-center p-6 bg-gmtm-bg-secondary rounded-lg">
              <div className="text-sm font-bold text-gmtm-text-secondary mb-2">SCHOLARSHIP LIKELIHOOD</div>
              <div className="relative w-32 h-32 mx-auto mb-3">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gmtm-border"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - report.projections.scholarship_likelihood / 100)}`}
                    className="text-gmtm-purple transition-all duration-1000"
                    style={{ transitionDelay: '600ms' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-gmtm-purple">
                    {report.projections.scholarship_likelihood}%
                  </span>
                </div>
              </div>
            </div>

            {/* Projected Level */}
            <div className="text-center p-6 bg-gmtm-bg-secondary rounded-lg flex flex-col justify-center">
              <div className="text-sm font-bold text-gmtm-text-secondary mb-2">PROJECTED LEVEL</div>
              <div className="text-5xl font-black text-gmtm-purple mb-2">
                {report.projections.projected_level}
              </div>
              <p className="text-sm text-gmtm-text-secondary">Based on current performance</p>
            </div>
          </div>

          {/* Comparable Athletes */}
          {report.projections.comparable_athletes.length > 0 && (
            <div className="bg-gmtm-bg-secondary rounded-lg p-6">
              <h3 className="font-bold text-gmtm-text mb-4">Similar Athlete Outcomes</h3>
              <div className="space-y-3">
                {report.projections.comparable_athletes.map((athlete, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-semibold text-gmtm-text">{athlete.name}</span>
                    <span className="text-sm text-gmtm-text-secondary">{athlete.outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 7: CTA - Get Verified */}
        <section className={`bg-gradient-to-br from-gmtm-sidebar via-gmtm-sidebar-hover to-gmtm-sidebar-active rounded-2xl shadow-card-hover p-8 md:p-12 mb-8 text-white transition-all duration-1000 delay-600 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 bg-gmtm-warning/20 border border-gmtm-warning rounded-full text-xs font-bold text-gmtm-warning mb-4">
              ⚠️ SELF-REPORTED METRICS
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Get Verified</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-2">
              This report is based on <strong>self-reported</strong> metrics
            </p>
            <p className="text-xl font-bold text-gmtm-lime mb-6">
              Get VERIFIED at an official SPARQ Combine
            </p>
            <p className="text-white/70 mb-8">
              Verified athletes are <span className="text-gmtm-lime font-bold">3x more visible</span> to recruiters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://gmtm.com/events"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gmtm-lime hover:bg-gmtm-lime-hover text-gmtm-sidebar font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-center"
            >
              Find a SPARQ Combine Near You →
            </a>
            <button
              onClick={() => alert('Share feature coming soon!')}
              className="bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-bold py-4 px-8 rounded-lg transition-all"
            >
              Share Your Report
            </button>
          </div>
        </section>

        {/* Section 8: Footer Stats */}
        <section className={`text-center py-8 transition-all duration-1000 delay-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-gmtm-text-secondary mb-2">
            Based on <strong className="text-gmtm-text">{report.total_athletes.toLocaleString()}</strong> athletes 
            and <strong className="text-gmtm-text">{report.total_metrics.toLocaleString()}</strong> performance metrics 
            across <strong className="text-gmtm-text">65+</strong> sports
          </p>
          <div className="mt-6">
            <div className="inline-block text-2xl font-black text-gmtm-sidebar">
              GMTM
            </div>
            <p className="text-sm text-gmtm-text-secondary mt-1">Powered by Scout AI</p>
          </div>
          
          {/* Back to Calculator */}
          <button
            onClick={() => router.push('/report')}
            className="mt-6 text-gmtm-purple hover:text-gmtm-purple-hover font-semibold underline"
          >
            ← Calculate Another SPARQ Rating
          </button>
        </section>
      </div>
    </div>
  );
}
