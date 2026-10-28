import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

// Shopping list (README future plan): kept in this browser, so it works signed
// in or not. Each line remembers which recipe it came from.

export interface ShoppingItem {
  id: string;
  recipeId: string;
  recipeName: string;
  text: string;
  checked: boolean;
}

interface ShoppingListContextType {
  items: ShoppingItem[];
  remaining: number;
  hasRecipe: (recipeId: string) => boolean;
  addRecipe: (recipeId: string, recipeName: string, lines: string[]) => void;
  removeRecipe: (recipeId: string) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'savorsync.shoppingList';
const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const readStored = (): ShoppingItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.text === 'string') : [];
  } catch {
    return [];
  }
};

export const ShoppingListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ShoppingItem[]>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private mode or storage full: the list still works for this visit
    }
  }, [items]);

  // Keep tabs in sync
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const hasRecipe = useCallback((recipeId: string) => items.some(item => item.recipeId === recipeId), [items]);

  // Adding a recipe again replaces its lines (for example after changing servings)
  const addRecipe = useCallback((recipeId: string, recipeName: string, lines: string[]) => {
    const stamp = Date.now().toString(36);
    setItems(prev => [
      ...prev.filter(item => item.recipeId !== recipeId),
      ...lines.filter(Boolean).map((text, i) => ({ id: `${recipeId}-${stamp}-${i}`, recipeId, recipeName, text, checked: false })),
    ]);
  }, []);

  const removeRecipe = useCallback((recipeId: string) => setItems(prev => prev.filter(item => item.recipeId !== recipeId)), []);
  const toggleItem = useCallback((id: string) => setItems(prev => prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))), []);
  const removeItem = useCallback((id: string) => setItems(prev => prev.filter(item => item.id !== id)), []);
  const clearChecked = useCallback(() => setItems(prev => prev.filter(item => !item.checked)), []);
  const clearAll = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    remaining: items.filter(item => !item.checked).length,
    hasRecipe, addRecipe, removeRecipe, toggleItem, removeItem, clearChecked, clearAll,
  }), [items, hasRecipe, addRecipe, removeRecipe, toggleItem, removeItem, clearChecked, clearAll]);

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) throw new Error('useShoppingList must be used within a ShoppingListProvider');
  return context;
};
