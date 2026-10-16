import type { PredictionResult, ModelInfo, SampleArticle, HistoryItem } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        if (Array.isArray(errData.detail)) {
          errMsg = errData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          errMsg = errData.detail;
        }
      } else if (errData.message) {
        errMsg = errData.message;
      }
    } catch {
      // Use fallback status text
      errMsg = res.statusText || errMsg;
    }
    throw new ApiError(errMsg, res.status);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; model_loaded: boolean; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async analyzeNews(headline: string, articleText: string): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: headline.trim(),
        article_text: articleText.trim(),
      }),
    });
    return handleResponse<PredictionResult>(res);
  },

  async getModelInfo(): Promise<ModelInfo> {
    const res = await fetch(`${API_BASE}/model-info`);
    return handleResponse<ModelInfo>(res);
  },

  async getSampleArticles(): Promise<SampleArticle[]> {
    const res = await fetch(`${API_BASE}/samples`);
    return handleResponse<SampleArticle[]>(res);
  },

  async getHistory(limit: number = 50): Promise<{ total: number; items: HistoryItem[] }> {
    const res = await fetch(`${API_BASE}/history?limit=${limit}`);
    return handleResponse<{ total: number; items: HistoryItem[] }>(res);
  },

  async getHistoryItem(id: string): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/history/${id}`);
    return handleResponse<PredictionResult>(res);
  },

  async deleteHistoryItem(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async clearAllHistory(): Promise<{ message: string; deleted_count: number }> {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
