export interface FeatureInfluence {
  feature: string;
  contribution: number;
  direction: 'supports_fake' | 'supports_real';
  weight_desc: string;
}

export interface PredictionResult {
  id: string;
  headline: string;
  article_excerpt: string;
  predicted_label: string;
  raw_class: 'FAKE' | 'REAL' | 'UNCERTAIN';
  confidence_score: number;
  probability_real: number;
  probability_fake: number;
  model_name: string;
  model_version: string;
  word_count: number;
  character_count: number;
  top_features: FeatureInfluence[];
  limitations_disclaimer: string;
  scientific_notes: string;
  created_at: string;
}

export interface SampleArticle {
  id: string;
  category: string;
  title: string;
  text: string;
  expected_label: string;
  source_type: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_weighted: number;
  recall_weighted: number;
  f1_weighted: number;
  confusion_matrix: number[][];
  labels: string[];
  per_class: {
    [key: string]: {
      precision: number;
      recall: number;
      f1_score: number;
      support: number;
    };
  };
}

export interface ModelInfo {
  is_trained: boolean;
  model_identity?: {
    name: string;
    version: string;
    model_architecture: string;
    baseline_architecture: string;
    trained_at: string;
    vocabulary_size: number;
    hyperparameters: Record<string, any>;
  };
  dataset_provenance?: {
    source_name: string;
    description: string;
    total_records: number;
    train_records: number;
    test_records: number;
    test_split_ratio: number;
    stratified: boolean;
    random_seed: number;
    class_distribution_overall: Record<string, number>;
    class_distribution_train: Record<string, number>;
    class_distribution_test: Record<string, number>;
    label_definitions: Record<string, string>;
  };
  evaluation_metrics?: {
    primary_model: ModelMetrics;
    baseline_model: ModelMetrics;
    metric_discussion: string;
  };
  top_predictive_features?: {
    top_fake_indicators: Array<{ feature: string; weight: number }>;
    top_real_indicators: Array<{ feature: string; weight: number }>;
  };
  scientific_limitations?: string[];
  message?: string;
}

export interface HistoryItem {
  id: string;
  headline: string;
  article_excerpt: string;
  predicted_label: string;
  raw_class: string;
  confidence_score: number;
  model_name: string;
  word_count: number;
  character_count: number;
  created_at: string;
}
