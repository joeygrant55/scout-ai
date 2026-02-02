const API_BASE = process.env.NEXT_PUBLIC_REPORT_API || 'http://localhost:8000';

export interface ReportRequest {
  height?: number;
  weight?: number;
  forty?: number;
  vertical?: number;
  shuttle?: number;
  powerball?: number;
  sport?: string;
  position?: string;
  name?: string;
  grad_year?: number;
}

export interface MetricPercentile {
  metric_name: string;
  value: number;
  percentile: number;
  sample_size: number;
  unit: string;
}

export interface NFLComparison {
  metric_name: string;
  better_than: string[];
  similar_to: string[];
  working_towards: string[];
  pro_comparison_quote?: string;
  sparq_historical_match?: string;
}

export interface AIAnalysis {
  strengths: string[];
  development_areas: string[];
  training_priority: string;
  recruiting_headline: string;
}

export interface CrossSportMatch {
  sport: string;
  athletes_matched: number;
  reason: string;
  is_olympic?: boolean;
}

export interface Projection {
  scholarship_likelihood: number;
  projected_level: string;
  comparable_athletes: Array<{
    name: string;
    outcome: string;
  }>;
}

export interface ReportResponse {
  sparq_score: number;
  tier: string;
  athlete_name?: string;
  grad_year?: number;
  metric_percentiles: MetricPercentile[];
  nfl_comparisons?: NFLComparison[];
  ai_analysis: AIAnalysis;
  cross_sport_opportunities: CrossSportMatch[];
  projections: Projection;
  total_athletes: number;
  total_metrics: number;
}

export async function generateReport(data: ReportRequest): Promise<ReportResponse> {
  const res = await fetch(`${API_BASE}/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to generate report');
  }
  
  return res.json();
}
