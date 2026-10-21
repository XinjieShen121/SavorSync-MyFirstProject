import React, { useState } from 'react';
import { askAboutDish, CulturalQuestionPreset } from '../services/apiCultural';
import './AskAboutDish.css';

interface AskAboutDishProps {
  recipe: {
    _id: string;
    recipe_name?: string;
    title?: string;
  };
}

interface Exchange {
  key: string;
  question: string;
  status: 'loading' | 'error' | 'done';
  answer?: string;
  source?: 'ai' | 'fallback';
  error?: string;
  retry: () => void;
}

const presets: { id: CulturalQuestionPreset; label: string }[] = [
  { id: 'story', label: "What's the story behind it?" },
  { id: 'ingredient', label: 'Why these ingredients?' },
  { id: 'home', label: 'How is it served at home?' },
  { id: 'occasion', label: 'When is it cooked?' },
];

const MAX_LENGTH = 300;

// "Ask about this dish" panel (design.md 4.4): preset questions plus free text,
// answers stacked newest first, each with its own loading and error state.
const AskAboutDish: React.FC<AskAboutDishProps> = ({ recipe }) => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState('');
  const dishName = recipe.recipe_name || recipe.title || 'this dish';

  const update = (key: string, patch: Partial<Exchange>) => {
    setExchanges(list => list.map(item => (item.key === key ? { ...item, ...patch } : item)));
  };

  const run = async (key: string, ask: { preset: CulturalQuestionPreset } | { question: string }) => {
    update(key, { status: 'loading', error: undefined });
    try {
      const result = await askAboutDish(recipe._id, ask);
      update(key, { status: 'done', answer: result.answer, source: result.source });
    } catch (err) {
      update(key, { status: 'error', error: (err as Error).message });
    }
  };

  const ask = (key: string, question: string, payload: { preset: CulturalQuestionPreset } | { question: string }) => {
    const existing = exchanges.find(item => item.key === key);
    if (existing && existing.status !== 'error') return;
    if (existing) {
      existing.retry();
      return;
    }
    const retry = () => run(key, payload);
    setExchanges(list => [{ key, question, status: 'loading', retry }, ...list]);
    run(key, payload);
  };

  const askPreset = (preset: CulturalQuestionPreset, label: string) => {
    ask(`preset:${preset}`, label, { preset });
  };

  const askOwn = (e: React.FormEvent) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question) return;
    ask(`own:${question.toLowerCase()}`, question, { question });
    setDraft('');
  };

  const askedKeys = new Set(exchanges.map(item => item.key));

  return (
    <section className="ask-dish" aria-labelledby="ask-dish-title">
      <div className="ask-dish__header">
        <i className="bi bi-stars ask-dish__icon" aria-hidden="true"></i>
        <h3 id="ask-dish-title" className="ask-dish__title">Ask about {dishName}</h3>
      </div>

      <div className="ask-dish__presets" role="group" aria-label="Suggested questions">
        {presets.map(preset => {
          const asked = askedKeys.has(`preset:${preset.id}`);
          return (
            <button
              key={preset.id}
              type="button"
              className="ask-dish__chip"
              aria-pressed={asked}
              onClick={() => askPreset(preset.id, preset.label)}
            >
              {asked && <i className="bi bi-check" aria-hidden="true"></i>}
              {preset.label}
            </button>
          );
        })}
      </div>

      <form className="ask-dish__form" onSubmit={askOwn}>
        <label htmlFor={`ask-dish-input-${recipe._id}`} className="ask-dish__label">Or ask your own question</label>
        <div className="ask-dish__row">
          <input
            id={`ask-dish-input-${recipe._id}`}
            className="ask-dish__input"
            type="text"
            maxLength={MAX_LENGTH}
            placeholder="e.g. Is there a vegetarian version in its home country?"
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />
          <button type="submit" className="ask-dish__submit" disabled={!draft.trim()}>
            Ask
          </button>
        </div>
      </form>

      <div className="ask-dish__answers" aria-live="polite">
        {exchanges.map(item => (
          <article key={item.key} className="ask-dish__answer">
            <h4 className="ask-dish__question">{item.question}</h4>

            {item.status === 'loading' && (
              <div aria-busy="true">
                <span className="ask-dish__sr">Getting an answer</span>
                <div className="ask-dish__skeleton"></div>
                <div className="ask-dish__skeleton"></div>
                <div className="ask-dish__skeleton ask-dish__skeleton--short"></div>
              </div>
            )}

            {item.status === 'error' && (
              <div className="ask-dish__error" role="status">
                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                <span>{item.error}</span>
                <button type="button" className="ask-dish__retry" onClick={item.retry}>Try again</button>
              </div>
            )}

            {item.status === 'done' && (
              <>
                {item.answer?.split(/\n\s*\n/).map((paragraph, i) => (
                  <p key={i} className="ask-dish__text">{paragraph}</p>
                ))}
                <p className="ask-dish__source">
                  {item.source === 'ai' ? 'AI-generated. Traditions vary by region and family.' : 'General background while our AI is offline.'}
                </p>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default AskAboutDish;
