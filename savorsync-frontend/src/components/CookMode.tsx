import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '@mui/material';
import { ingredientTerms, ingredientsInStep, savedStepKey } from '../utils/cookMode';
import { photoForIngredient } from '../data/ingredientPhotos';
import type { ImageCredit } from './PhotoCredit';
import './CookMode.css';

export interface CookIngredient {
  quantity: string;
  name: string;
  // Set when the cook swapped this ingredient (design.md 4.5)
  swappedFrom?: string;
  // Shorter word the swap replaces in the steps, e.g. "pork" for "pork belly"
  swapKey?: string;
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
  // The finished dish, shown the whole time (design.md 4.6)
  heroImage?: string;
  heroCredit?: ImageCredit;
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
  heroImage,
  heroCredit,
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

  // Timers stop when cook mode closes, so check first instead of losing a running one to a stray Esc
  const leave = useCallback(() => {
    const running = Object.values(timers).some((t) => t.running);
    if (running && !window.confirm('A timer is still running. Leave cook mode and stop it?')) return;
    onClose();
  }, [timers, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ingredientsOpen) return;
      if (e.key === 'Escape') leave();
      else if (e.key === 'ArrowRight' || (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON')) {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back, next, leave, ingredientsOpen]);

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

  // Bold the ingredients named in the step. A swapped one shows its new name (with quantity) in herb green,
  // so the steps follow the swap; the others keep the step's own words.
  const renderStep = (text: string) => {
    const keys = ingredients
      .flatMap((ing, index) => (ing.swappedFrom
        ? [ing.swappedFrom, ing.swapKey, ing.name].filter(Boolean)
        : [ing.name, ...ingredientTerms(ing.name)]
      ).map((key) => ({ key: key as string, index })))
      .sort((a, b) => b.key.length - a.key.length);
    if (!keys.length) return text;
    const pattern = new RegExp(`\\b(${keys.map((k) => `${escapeRegExp(k.key)}(?:e?s)?`).join('|')})\\b`, 'gi');
    return text.split(pattern).map((part, i) => {
      const hit = keys.find((k) => new RegExp(`^${escapeRegExp(k.key)}(?:e?s)?$`, 'i').test(part));
      if (!hit) return part;
      const ing = ingredients[hit.index];
      if (!ing.swappedFrom) return <strong key={i}>{part}</strong>;
      const label = `${ing.quantity ? `${ing.quantity} ` : ''}${ing.name}`;
      return <strong key={i} className="cook-step__swap" title={`Original: ${ing.swappedFrom}`}>{label}</strong>;
    });
  };

  const duration = parseDuration(steps[step] || '');
  const timer = timers[step];
  const otherTimers = Object.entries(timers).filter(([key, t]) => Number(key) !== step && (t.running || t.remaining === 0));
  const tip = tips[step];
  const uses = ingredientsInStep(steps[step] || '', ingredients.map((ing) => ing.swappedFrom ? `${ing.name}, ${ing.swappedFrom}` : ing.name));
  const readyCount = ingredients.filter((_, index) => checked[index]).length;
  const progress = finished ? 100 : Math.round((step / steps.length) * 100);

  // Credits for every photo on screen right now: the dish, then this step's ingredients
  const credits = [
    ...(heroImage && heroCredit?.source_url ? [{ author: heroCredit.author || 'Unknown author', license: heroCredit.license || '', source: heroCredit.source_url }] : []),
    ...uses.map((index) => photoForIngredient(ingredients[index].name)).filter(Boolean)
      .map((photo) => ({ author: photo!.author, license: photo!.license, source: photo!.source })),
  ].filter((credit, i, all) => all.findIndex((c) => c.author === credit.author && c.license === credit.license) === i);

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (dx < -50) next();
    else if (dx > 50) back();
  };

  const thumb = (name: string, className: string) => {
    const photo = photoForIngredient(name);
    return photo
      ? <img src={photo.src} alt="" className={className} loading="lazy" />
      : <span className={`${className} cook-thumb--none`} aria-hidden="true">{name.charAt(0)}</span>;
  };

  const ingredientList = (variant: 'side' | 'sheet') => (
    <ul className={`cook-ingredients__list cook-ingredients__list--${variant}`}>
      {ingredients.map((ing, index) => (
        <li key={index} className={`${ing.swappedFrom ? 'is-swapped' : ''} ${uses.includes(index) ? 'is-now' : ''}`}>
          <label>
            {thumb(ing.name, 'cook-thumb')}
            <span className={`cook-ingredients__name ${checked[index] ? 'is-checked' : ''}`}>
              {ing.quantity && <strong>{ing.quantity} </strong>}
              {ing.name}
              {ing.swappedFrom && <span className="cook-ingredients__instead"> instead of {ing.swappedFrom}</span>}
            </span>
            <input type="checkbox" className="ingredient-check" checked={!!checked[index]} onChange={() => onToggleIngredient(index)} />
          </label>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="cook-mode" role="dialog" aria-modal="true" aria-label={`Cook mode: ${title}`}>
      <div className="cook-mode__top">
        <button ref={exitRef} type="button" className="btn btn--ghost cook-mode__exit" onClick={leave}>
          <i className="bi bi-x-lg" aria-hidden="true"></i>Exit
        </button>
        <div className="cook-mode__title">
          <span>{title}</span>
          {otherTimers.length > 0 && (
            <span className="cook-mode__mini-timers">
              {otherTimers.map(([key, t]) => (
                <button key={key} type="button" className={`cook-mini-timer ${t.remaining === 0 ? 'is-done' : ''}`} onClick={() => { setFinished(false); setStep(Number(key)); }}>
                  <i className="bi bi-stopwatch" aria-hidden="true"></i>
                  Step {Number(key) + 1} · {t.remaining === 0 ? 'Done' : formatTime(t.remaining)}
                </button>
              ))}
            </span>
          )}
        </div>
        <button type="button" className="btn btn--secondary btn--sm cook-mode__ingredients-btn" onClick={() => setIngredientsOpen(true)}>
          Ingredients
        </button>
      </div>
      <div className="cook-line" role="progressbar" aria-label="Cooking progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {finished ? (
        <div className="cook-finish">
          {heroImage
            ? <img src={heroImage} alt="" className="cook-finish__photo" />
            : <i className="bi bi-check-circle-fill cook-finish__icon" aria-hidden="true"></i>}
          <h2 className="cook-finish__title">Enjoy your {title}!</h2>
          <div className="cook-finish__actions">
            <Link to={`/create-post?recipe=${recipeId}`} className="btn btn--primary btn--lg">
              <i className="bi bi-camera" aria-hidden="true"></i>Share a photo
            </Link>
            <button type="button" className="btn btn--ghost btn--lg" onClick={leave}>
              <i className="bi bi-arrow-left" aria-hidden="true"></i>Back to recipe
            </button>
          </div>
        </div>
      ) : (
        <div className={`cook-mode__layout ${heroImage ? 'has-photo' : ''}`}>
          <aside className="cook-side" aria-label="Ingredients">
            {heroImage && (
              <figure className="cook-side__dish">
                <img src={heroImage} alt="" />
                <figcaption>What you're making</figcaption>
              </figure>
            )}
            <p className="cook-kicker cook-kicker--muted">All ingredients · {readyCount} of {ingredients.length} ready</p>
            {ingredientList('side')}
          </aside>

          <div className="cook-main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {heroImage && (
              <div className="cook-banner" aria-hidden="true">
                <img src={heroImage} alt="" />
                <span className="cook-banner__step"><span>{step + 1}</span>Step {step + 1} of {steps.length}</span>
              </div>
            )}
            <div className="cook-mode__body">
              <div key={step} className="cook-step">
                <div className="cook-step__head">
                  <span className="cook-step__number" aria-hidden="true">{step + 1}</span>
                  <h2 className="cook-kicker" aria-live="polite">Step {step + 1} of {steps.length}</h2>
                </div>
                <p className="cook-step__text" onClick={next}>{renderStep(steps[step])}</p>

                {uses.length > 0 && (
                  <section className="cook-uses" aria-label="For this step">
                    <p className="cook-kicker">For this step</p>
                    <ul className="cook-uses__list">
                      {uses.map((index) => (
                        <li key={index} className={ingredients[index].swappedFrom ? 'is-swapped' : ''}>
                          {thumb(ingredients[index].name, 'cook-uses__photo')}
                          <span className="cook-uses__name">
                            {ingredients[index].quantity && <strong>{ingredients[index].quantity} </strong>}
                            {ingredients[index].name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

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

            <div className="cook-mode__controls">
              <button type="button" className="btn btn--secondary btn--lg cook-mode__back" onClick={back} disabled={step === 0}>
                <i className="bi bi-arrow-left" aria-hidden="true"></i>Back
              </button>
              {!isLast && (
                <p className="cook-mode__upnext">
                  <span className="cook-kicker cook-kicker--muted">Up next · Step {step + 2}</span>
                  <span className="cook-mode__upnext-text">{steps[step + 1]}</span>
                </p>
              )}
              <button type="button" className="btn btn--primary btn--lg cook-mode__next" onClick={next}>
                {isLast ? 'Finish' : 'Next step'}
                <i className={`bi ${isLast ? 'bi-check-lg' : 'bi-arrow-right'}`} aria-hidden="true"></i>
              </button>
            </div>
            {credits.length > 0 && (
              <p className="cook-credits">
                Photos via Wikimedia Commons:{' '}
                {credits.map((credit, i) => (
                  <React.Fragment key={credit.source}>
                    {i > 0 && ', '}
                    <a href={credit.source} target="_blank" rel="noopener noreferrer">{credit.author}</a>
                    {credit.license && ` (${credit.license})`}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
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
        {ingredientList('sheet')}
      </Drawer>
    </div>
  );
};

export default CookMode;
