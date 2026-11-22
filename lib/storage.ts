"use client";
import type { WishList } from "./types";

const KEY = "wunschwerk:listen";

export function loadLists(): WishList[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishList[]) : [];
  } catch {
    return [];
  }
}

export function saveLists(lists: WishList[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lists));
  } catch {
    /* Speicher voll oder blockiert */
  }
}

export function getList(id: string): WishList | undefined {
  return loadLists().find((l) => l.id === id);
}

export function upsertList(list: WishList) {
  const lists = loadLists();
  const i = lists.findIndex((l) => l.id === list.id);
  if (i >= 0) lists[i] = list;
  else lists.unshift(list);
  saveLists(lists);
}

export function deleteList(id: string) {
  saveLists(loadLists().filter((l) => l.id !== id));
}
