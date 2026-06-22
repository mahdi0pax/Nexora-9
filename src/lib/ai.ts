/**
 * Nexora AI Service Client
 * Centralized frontend client for all AI-powered edge functions.
 */

import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function callAI<T>(endpoint: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`AI ${endpoint} failed:`, res.status);
      return null;
    }

    const data = await res.json();
    if (data.error || data.fallback) {
      console.warn(`AI ${endpoint} returned fallback:`, data.error);
      return null;
    }

    return data as T;
  } catch (err) {
    console.error(`AI ${endpoint} error:`, err);
    return null;
  }
}

// ── Oracle ────────────────────────────────────────────────────────────────

export interface OracleResult {
  recommendation: string;
  priorityCategory: string;
  priorityReason: string;
  expectedImpact: string;
  confidence: number;
  tips: string[];
}

export async function fetchOracle(walletAddress: string): Promise<OracleResult | null> {
  return callAI<OracleResult>('oracle', { walletAddress });
}

// ── Mentor ────────────────────────────────────────────────────────────────

export interface MentorResult {
  overallAssessment: string;
  strengths: Array<{ category: string; description: string; score: number }>;
  weaknesses: Array<{ category: string; description: string; score: number }>;
  learningPath: Array<{ step: number; action: string; reason: string }>;
  practiceTips: string[];
  motivation: string;
}

export async function fetchMentor(walletAddress: string): Promise<MentorResult | null> {
  return callAI<MentorResult>('mentor', { walletAddress });
}

// ── Weekly Report ─────────────────────────────────────────────────────────

export interface WeeklyReportResult {
  headline: string;
  summary: string;
  highlights: Array<{ label: string; value: string; context: string }>;
  trends: { direction: string; description: string };
  categoryBreakdown: Array<{ category: string; played: number; accuracy: number; trend: string }>;
  goalsForNextWeek: Array<{ goal: string; reason: string }>;
  shareableText: string;
}

export async function fetchWeeklyReport(walletAddress: string): Promise<WeeklyReportResult | null> {
  return callAI<WeeklyReportResult>('weekly-report', { walletAddress });
}

// ── Lore ──────────────────────────────────────────────────────────────────

export interface LoreResult {
  chapterTitle: string;
  story: string;
  achievementsFramed: Array<{ title: string; description: string }>;
  nextChapterTeaser: string;
  loreRank: string;
}

export async function fetchLore(walletAddress: string): Promise<LoreResult | null> {
  return callAI<LoreResult>('lore', { walletAddress });
}

// ── Question Generation (already used by store) ───────────────────────────

export async function generateQuestions(categoryId: string, level: number, count = 5) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-question`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId, level, count }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.questions as Array<{
      text: string;
      options: string[];
      correct: number;
      explanation: string;
      difficulty: string;
    }>;
  } catch {
    return null;
  }
}
