import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useShoppingList, ShoppingItem } from '../../context/ShoppingListContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/ui/States';
import '../../styles/browse.css';
import './ShoppingListPage.css';

// Shopping list: ingredients grouped by recipe, ticked off as you shop
const ShoppingListPage: React.FC = () => {
  const { items, remaining, toggleItem, removeItem, removeRecipe, clearChecked, clearAll } = useShoppingList();
  const { showToast } = useToast();

  const groups = useMemo(() => {
    const byRecipe = new Map<string, { name: string; items: ShoppingItem[] }>();
    items.forEach(item => {
      const group = byRecipe.get(item.recipeId) || { name: item.recipeName, items: [] };
      group.items.push(item);
      byRecipe.set(item.recipeId, group);
    });
    return [...byRecipe.entries()];
  }, [items]);

  const copyList = async () => {
    const text = groups
      .map(([, group]) => `${group.name}\n${group.items.filter(i => !i.checked).map(i => `- ${i.text}`).join('\n')}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Shopping list copied', 'success');
    } catch {
      showToast("Couldn't copy. Try printing the list instead.", 'error');
    }
  };

  const checkedCount = items.length - remaining;

  return (
    <div className="browse">
      <div className="browse__inner shopping">
        <header className="browse__header shopping__header">
          <div>
            <h1 className="browse__title">Shopping list</h1>
            <p className="browse__lead" aria-live="polite">
              {items.length ? `${remaining} of ${items.length} left to buy` : 'Add ingredients from any recipe.'}
            </p>
          </div>
          {items.length > 0 && (
            <div className="shopping__actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={copyList}>
                <i className="bi bi-clipboard" aria-hidden="true"></i>Copy
              </button>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => window.print()}>
                <i className="bi bi-printer" aria-hidden="true"></i>Print
              </button>
            </div>
          )}
        </header>

        {items.length === 0 ? (
          <EmptyState
            icon="bi-basket"
            title="Your list is empty"
            body="On any recipe, press Add to shopping list and the ingredients land here."
            action={{ label: 'Find recipes', to: '/all-recipes', variant: 'secondary' }}
          />
        ) : (
          <>
            {groups.map(([recipeId, group]) => (
              <section key={recipeId} className="shopping__group" aria-labelledby={`shop-${recipeId}`}>
                <div className="shopping__group-header">
                  <h2 id={`shop-${recipeId}`} className="shopping__group-title">
                    <Link to={`/recipe/${recipeId}`}>{group.name}</Link>
                  </h2>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeRecipe(recipeId)}>
                    Remove recipe
                  </button>
                </div>
                <ul className="shopping__list">
                  {group.items.map(item => (
                    <li key={item.id} className={`shopping__item ${item.checked ? 'is-checked' : ''}`}>
                      <label className="shopping__label">
                        <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} />
                        <span>{item.text}</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn--icon btn--sm shopping__remove"
                        aria-label={`Remove ${item.text}`}
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="bi bi-x-lg" aria-hidden="true"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <div className="shopping__footer">
              {checkedCount > 0 && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={clearChecked}>
                  Clear {checkedCount} ticked
                </button>
              )}
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>Clear all</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingListPage;
