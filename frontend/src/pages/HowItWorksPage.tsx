import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Page Header */}
      <div className="space-y-3 border-b border-[#22262d] pb-8">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#d97706]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#9da3af]">
            NLP Research & Mathematics
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#fcfaf7]">
          How VERITAS AI Works
        </h1>
        <p className="text-base font-serif text-[#a3abb8] leading-relaxed">
          An educational dissection of the supervised text classification pipeline: from vocabulary tokenization
          and sublinear TF-IDF weighting to regularized logistic regression and feature attribution.
        </p>
      </div>

      {/* Section 1: The Core Scientific Limitation */}
      <section className="p-6 rounded-md bg-[#161413] border border-[#423321] space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Epistemological Boundary: Linguistic Patterns vs Factual Reality</span>
        </div>
        <p className="text-xs font-serif text-[#d6cdbf] leading-relaxed">
          A fundamental concept for machine learning engineers is that a supervised text classifier learns to distinguish
          <em className="text-[#fcfaf7]"> stylistic, lexical, and semantic correlations</em> within a labeled training distribution.
          It does not possess real-time world knowledge, access to intelligence briefings, or deductive capability.
          When VERITAS AI classifies an article as "Fake" or "Real", it is reporting that the document's vocabulary distribution
          statistically resembles the training examples of that class.
        </p>
      </section>

      {/* Section 2: Text Preprocessing & Cleaning */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-[#1e2229] border border-[#303642] flex items-center justify-center font-mono text-xs text-[#d97706] font-bold">
            01
          </span>
          <h2 className="text-xl font-serif font-bold text-[#fcfaf7]">Text Preprocessing & Tokenization</h2>
        </div>
        <p className="text-sm font-serif text-[#a3abb8] leading-relaxed">
          Before mathematical models can process prose, unstructured news text is systematically cleaned and tokenized:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded bg-[#131518] border border-[#242730] space-y-1.5">
            <h4 className="text-[#fcfaf7] font-semibold uppercase tracking-wider text-[11px]">Unicode Normalization</h4>
            <p className="text-[#8c929d] font-serif text-xs leading-relaxed">
              Strips typographical quotes, smart dashes, and non-ASCII glyphs to ensure consistent representation across disparate publishers.
            </p>
          </div>
          <div className="p-4 rounded bg-[#131518] border border-[#242730] space-y-1.5">
            <h4 className="text-[#fcfaf7] font-semibold uppercase tracking-wider text-[11px]">Stop-Word Pruning</h4>
            <p className="text-[#8c929d] font-serif text-xs leading-relaxed">
              Filters uninformative high-frequency English particles (e.g., "the", "and", "is", "at") that dominate text without carrying class signal.
            </p>
          </div>
          <div className="p-4 rounded bg-[#131518] border border-[#242730] space-y-1.5">
            <h4 className="text-[#fcfaf7] font-semibold uppercase tracking-wider text-[11px]">N-Gram Extraction</h4>
            <p className="text-[#8c929d] font-serif text-xs leading-relaxed">
              Extracts single words (unigrams) and contiguous word pairs (bigrams), preserving contextual phrases like "breaking news" or "white house".
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: TF-IDF Vectorization */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-[#1e2229] border border-[#303642] flex items-center justify-center font-mono text-xs text-[#d97706] font-bold">
            02
          </span>
          <h2 className="text-xl font-serif font-bold text-[#fcfaf7]">Sublinear TF-IDF Feature Extraction</h2>
        </div>
        <p className="text-sm font-serif text-[#a3abb8] leading-relaxed">
          Term Frequency-Inverse Document Frequency (TF-IDF) converts text documents into high-dimensional sparse numeric vectors:
        </p>
        
        <div className="p-5 rounded bg-[#121418] border border-[#252830] space-y-3 font-mono text-xs">
          <div className="text-[#d97706] font-semibold">1. Sublinear Term Frequency:</div>
          <div className="p-3 rounded bg-[#0b0c0e] border border-[#1b1d22] text-[#fcfaf7] overflow-x-auto">
            tf_sublinear(t, d) = 1 + log(tf(t, d))  if tf &gt; 0, else 0
          </div>
          <p className="text-[#8c929d] font-serif text-xs">
            Sublinear scaling dampens the effect of words repeated twenty times versus twice, avoiding disproportionate leverage.
          </p>

          <div className="text-[#d97706] font-semibold pt-2">2. Smooth Inverse Document Frequency:</div>
          <div className="p-3 rounded bg-[#0b0c0e] border border-[#1b1d22] text-[#fcfaf7] overflow-x-auto">
            idf(t) = log((1 + N) / (1 + df(t))) + 1
          </div>
          <p className="text-[#8c929d] font-serif text-xs">
            Where N is the total number of training articles and df(t) is the count of documents containing term t.
            Rare discriminatory terms receive higher weights; ubiquitous terms receive lower weights.
          </p>

          <div className="text-[#d97706] font-semibold pt-2">3. Euclidean (L2) Normalization:</div>
          <div className="p-3 rounded bg-[#0b0c0e] border border-[#1b1d22] text-[#fcfaf7] overflow-x-auto">
            v_normalized = v / ||v||_2
          </div>
          <p className="text-[#8c929d] font-serif text-xs">
            Normalizing document vectors to unit length ensures that lengthy articles do not artificially dominate shorter ones.
          </p>
        </div>
      </section>

      {/* Section 4: Logistic Regression Classifier */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-[#1e2229] border border-[#303642] flex items-center justify-center font-mono text-xs text-[#d97706] font-bold">
            03
          </span>
          <h2 className="text-xl font-serif font-bold text-[#fcfaf7]">Regularized Logistic Regression</h2>
        </div>
        <p className="text-sm font-serif text-[#a3abb8] leading-relaxed">
          The primary classifier is an L2-regularized Logistic Regression model trained via the L-BFGS numerical optimization solver:
        </p>

        <div className="p-5 rounded bg-[#121418] border border-[#252830] space-y-3 font-mono text-xs">
          <div className="text-[#d97706] font-semibold">Linear Decision Function:</div>
          <div className="p-3 rounded bg-[#0b0c0e] border border-[#1b1d22] text-[#fcfaf7] overflow-x-auto">
            z = w_0 + ∑ (w_i · x_i)
          </div>

          <div className="text-[#d97706] font-semibold pt-2">Posterior Probability (Sigmoid):</div>
          <div className="p-3 rounded bg-[#0b0c0e] border border-[#1b1d22] text-[#fcfaf7] overflow-x-auto">
            P(y = FAKE | x) = 1 / (1 + e^(-z))
          </div>

          <p className="text-[#8c929d] font-serif text-xs leading-relaxed">
            By setting regularization hyperparameter C = 1.0, the objective balances cross-entropy minimization with weight shrinkage,
            preventing individual spurious words from dominating out-of-sample predictions.
          </p>
        </div>
      </section>

      {/* Section 5: Interpretability & Feature Attribution */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-[#1e2229] border border-[#303642] flex items-center justify-center font-mono text-xs text-[#d97706] font-bold">
            04
          </span>
          <h2 className="text-xl font-serif font-bold text-[#fcfaf7]">Interpretability & Feature Attribution</h2>
        </div>
        <p className="text-sm font-serif text-[#a3abb8] leading-relaxed">
          Unlike opaque deep neural networks, a linear model combined with sparse n-gram TF-IDF provides exact mathematical decomposition.
          For any input text, the contribution of token i is:
        </p>

        <div className="p-4 rounded bg-[#131519] border border-[#232731] font-mono text-xs text-[#fcfaf7]">
          contribution_i = weight_i × tfidf_i
        </div>

        <p className="text-xs font-serif text-[#a3abb8] leading-relaxed">
          Tokens with large positive contributions push the prediction toward "Model classified as Fake", while large negative
          contributions push the score toward "Model classified as Real". VERITAS AI presents these attributions directly
          to the user in the analysis studio.
        </p>
      </section>

      {/* Section 6: Baseline Comparison */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-[#1e2229] border border-[#303642] flex items-center justify-center font-mono text-xs text-[#d97706] font-bold">
            05
          </span>
          <h2 className="text-xl font-serif font-bold text-[#fcfaf7]">Multinomial Naive Bayes Baseline</h2>
        </div>
        <p className="text-sm font-serif text-[#a3abb8] leading-relaxed">
          To validate that Logistic Regression is learning effective discriminative boundaries, a classic Multinomial Naive Bayes
          classifier was fitted on the exact same training split. Naive Bayes applies Bayes' Theorem with the assumption that features
          are conditionally independent given the class label. Logistic Regression outperformed Naive Bayes by roughly 2% in held-out accuracy,
          demonstrating the benefit of modeling inter-feature linear dependencies.
        </p>
      </section>

      {/* Navigation CTA */}
      <div className="pt-6 border-t border-[#22262d] flex justify-between items-center">
        <Link
          to="/analyze"
          className="text-xs font-mono uppercase tracking-wider text-[#b91c1c] hover:text-red-400 font-semibold inline-flex items-center gap-1.5"
        >
          <span>Test The Pipeline In The Analysis Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/model-info"
          className="text-xs font-mono uppercase tracking-wider text-[#d97706] hover:text-amber-400 font-semibold inline-flex items-center gap-1.5"
        >
          <span>Inspect Empirical Evaluation Metrics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
