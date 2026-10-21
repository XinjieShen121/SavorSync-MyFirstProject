import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '@mui/material';
import { savedStepKey } from '../utils/cookMode';
import './CookMode.css';

export interface CookIngredient {
  quantity: string;
  name: string;
  // Set when the cook swapped this ingredient (design.md 4.5)
  swappedFrom?: string;
}

interface CookModeProps {
  recipeId: string;
  title: string;
  steps: string[];
  tips: (string | undefined)[];
  ingredients: CookIngredient[];
  checked: Record<number, boolean>;
  onToggleIngredient: (index: number) => void;
  startStep: number;
  onClose: () => void;
}

interface Timer {
  total: number;
  remaining: number;
  running: boolean;
}

const DURATION = /(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(?:\d+\s*)?(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i;

const parseDuration = (text: string): number | null => {
  const match = text.match(DURATION);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('h')) return Math.round(amount * 3600);
  if (unit.startsWith('m')) return Math.round(amount * 60);
  return Math.round(amount);
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


const beep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.frequency.value = 880;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio not available; vibration and the Done chip still show
  }
  navigator.vibrate?.([200, 100, 200]);
};

const CookMode: React.FC<CookModeProps> = ({
  recipeId,
  title,
  steps,
  tips,
  ingredients,
  checked,
  onToggleIngredient,
  startStep,
  onClose,
}) => {
  const [step, setStep] = useState(Math.min(startStep, steps.length - 1));
  const [finished, setFinished] = useState(false);
  const [timers, setTimers] = useState<Record<number, Timer>>({});
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const exitRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);

  const isLast = step === steps.length - 1;

  const next = useCallback(() => {
    if (finished) return;
    if (step < steps.length - 1) setStep((s) => s + 1);
    else setFinished(true);
  }, [finished, step, steps.length]);

  const back = useCallback(() => {
    if (finished) setFinished(false);
    else setStep((s) => Math.max(0, s - 1));
  }, [finished]);

  // Remember the current step per recipe; clear it once the recipe is finished
  useEffect(() => {
    try {
      if (finished) localStorage.removeItem(savedStepKey(recipeId));
      else localStorage.setItem(savedStepKey(recipeId), String(step));
    } catch {
      // Storage unavailable (private mode); resume just won't be offered
    }
  }, [finished, recipeId, step]);

  // Keep the screen awake while cooking
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);

  useEffect(() => {
    exitRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ingredientsOpen) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON')) {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back, next, onClose, ingredientsOpen]);

  // One tick drives every running timer, so timers keep going between steps
  const anyRunning = Object.values(timers).some((t) => t.running);
  useEffect(() => {
    if (!anyRunning) return;
    const id = window.setInterval(() => {
      setTimers((prev) => {
        const nextTimers = { ...prev };
        Object.entries(prev).forEach(([key, t]) => {
          if (!t.running) return;
          const remaining = t.remaining - 1;
          if (remaining <= 0) beep();
          nextTimers[Number(key)] = { ...t, remaining: Math.max(0, remaining), running: remaining > 0 };
        });
        return nextTimers;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [anyRunning]);

  const startTimer = (index: number, total: number) =>
    setTimers((prev) => ({ ...prev, [index]: { total, remaining: total, running: true } }));
  const toggleTimer = (index: number) =>
    setTimers((prev) => ({ ...prev, [index]: { ...prev[index], running: !prev[index].running } }));
  const resetTimer = (index: number) =>
    setTimers((prev) => {
      const nextTimers = { ...prev };
      delete nextTimers[index];
      return nextTimers;
    });

  // Bold the ingredients named in the step, with their quantity; swapped ones in herb green
  const renderStep = (text: string) => {
    const keys = ingredients
      .flatMap((ing, index) => [ing.swappedFrom, ing.name].filter(Boolean).map((key) => ({ key: key as string, index })))
      .sort((a, b) => b.key.length - a.key.length);
    if (!keys.length) return text;
    const pattern = new RegExp(`\\b(${keys.map((k) => escapeRegExp(k.key)).join('|')})\\b`, 'gi');
    return text.split(pattern).map((part, i) => {
      const hit = keys.find((k) => k.key.toLowerCase() === part.toLowerCase());
      if (!hit) return part;
      const ing = ingredients[hit.index];
      const label = `${ing.quantity ? `${ing.quantity} ` : ''}${ing.name}`;
      return ing.swappedFrom ? (
        <strong key={i} className="cook-step__swap" title={`Original: ${ing.swappedFrom}`}>{label}</strong>
      ) : (
        <strong key={i}>{label}</strong>
      );
    });
  };

  const duration = parseDuration(steps[step] || '');
  const timer = timers[step];
  const otherTimers = Object.entries(timers).filter(([key, t]) => Number(key) !== step && (t.running || t.remaining === 0));
  const tip = tips[step];

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (dx < -50) next();
    else if (dx > 50) back();
  };

  return (
    <div className="cook-mode" role="dialog" aria-modal="true" aria-label={`Cook mode: ${title}`}>
      <div className="cook-mode__top">
        <button ref={exitRef} type="button" className="btn btn--icon" aria-label="Exit cook mode" onClick={onClose}>
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>
        <div className="cook-mode__title">
          <span>{title}</span>
          {otherTimers.length > 0 && (
            <span className="cook-mode__mini-timers">
              {otherTimers.map(([key, t]) => (
                <button key={key} type="button" className={`cook-mini-timer ${t.remaining === 0 ? 'is-done' : ''}`} onClick={() => { setFinished(false); setStep(Number(key)); }}>
                  <i className="bi bi-stopwatch" aria-hidden="true"></i>
                  {t.remaining === 0 ? 'Done' : formatTime(t.remaining)}
                </button>
              ))}
            </span>
          )}
        </div>
        <button type="button" className="btn btn--icon" aria-label="Ingredients" onClick={() => setIngredientsOpen(true)}>
          <i className="bi bi-list-check" aria-hidden="true"></i>
        </button>
      </div>

      {finished ? (
        <div className="cook-finish">
          <i className="bi bi-check-circle-fill cook-finish__icon" aria-hidden="true"></i>
          <h2 className="cook-finish__title">Enjoy your {title}!</h2>
          <div className="cook-finish__actions">
            <Link to={`/create-post?recipe=${recipeId}`} className="btn btn--primary btn--lg">
              <i className="bi bi-camera" aria-hidden="true"></i>Share a photo
            </Link>
            <button type="button" className="btn btn--ghost btn--lg" onClick={onClose}>
              <i className="bi bi-arrow-left" aria-hidden="true"></i>Back to recipe
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cook-mode__progress">
            <div className="cook-progress" aria-hidden="true">
              {steps.map((_, i) => (
                <span key={i} className={`cook-progress__seg ${i < step ? 'is-done' : i === step ? 'is-current' : ''}`} />
              ))}
            </div>
            <p className="cook-mode__count" aria-live="polite">Step {step + 1} of {steps.length}</p>
          </div>

          <div className="cook-mode__body" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div key={step} className="cook-step">
              <h2 className="visually-hidden">Step {step + 1} of {steps.length}</h2>
              <p className="cook-step__text" onClick={next}>{renderStep(steps[step])}</p>

              {duration && (
                <div className="cook-timer">
                  {!timer ? (
                    <button type="button" className="btn btn--secondary" onClick={() => startTimer(step, duration)}>
                      <i className="bi bi-stopwatch" aria-hidden="true"></i>Start {formatTime(duration)} timer
                    </button>
                  ) : timer.remaining === 0 ? (
                    <span className="cook-timer__chip is-done" role="status">
                      <i className="bi bi-check-lg" aria-hidden="true"></i>Done
                      <button type="button" className="btn btn--icon btn--sm" aria-label="Reset timer" onClick={() => resetTimer(step)}>
                        <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                      </button>
                    </span>
                  ) : (
                    <span className="cook-timer__chip" role="timer" aria-live="off">
                      <i className="bi bi-stopwatch" aria-hidden="true"></i>
                      <span className="cook-timer__time">{formatTime(timer.remaining)}</span>
                      <button type="button" className="btn btn--icon btn--sm" aria-label={timer.running ? 'Pause timer' : 'Resume timer'} onClick={() => toggleTimer(step)}>
                        <i className={`bi ${timer.running ? 'bi-pause-fill' : 'bi-play-fill'}`} aria-hidden="true"></i>
                      </button>
                      <button type="button" className="btn btn--icon btn--sm" aria-label="Reset timer" onClick={() => resetTimer(step)}>
                        <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                      </button>
                    </span>
                  )}
                </div>
              )}

              {tip && (
                <div className="tip-box cook-step__tip">
                  <i className="bi bi-lightbulb" aria-hidden="true"></i>
                  <p>{tip}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!finished && (
        <div className="cook-mode__controls">
          <button type="button" className="btn btn--secondary btn--lg" onClick={back} disabled={step === 0}>
            <i className="bi bi-arrow-left" aria-hidden="true"></i>Back
          </button>
          <button type="button" className="btn btn--primary btn--lg cook-mode__next" onClick={next}>
            {isLast ? 'Finish' : 'Next step'}
            <i className={`bi ${isLast ? 'bi-check-lg' : 'bi-arrow-right'}`} aria-hidden="true"></i>
          </button>
        </div>
      )}

      <Drawer
        anchor="bottom"
        open={ingredientsOpen}
        onClose={() => setIngredientsOpen(false)}
        PaperProps={{ className: 'cook-ingredients' }}
        sx={{ zIndex: 'calc(var(--z-overlay) + 1)' }}
      >
        <div className="cook-ingredients__head">
          <h2>Ingredients</h2>
          <button type="button" className="btn btn--icon" aria-label="Close ingredients" onClick={() => setIngredientsOpen(false)}>
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
        <ul className="cook-ingredients__list">
          {ingredients.map((ing, index) => (
            <li key={index} className={ing.swappedFrom ? 'is-swapped' : ''}>
              <label>
                <input type="checkbox" className="ingredient-check" checked={!!checked[index]} onChange={() => onToggleIngredient(index)} />
                <span className="cook-ingredients__qty">{ing.quantity}</span>
                <span className={checked[index] ? 'is-checked' : ''}>
                  {ing.name}
                  {ing.swappedFrom && <span className="cook-ingredients__instead"> instead of {ing.swappedFrom}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
};

export default CookMode;
