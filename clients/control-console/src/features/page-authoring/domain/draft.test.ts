import { it } from 'vitest';
import assert from 'node:assert/strict';
import { EditorDraft } from './draft.ts';

it('retains typing performed while a save is in flight', () => {
  const draft = new EditorDraft('original', '"rev-1"');
  assert.equal(draft.dirty, false);
  draft.edit('submitted');
  const save = draft.beginSave('intent-1');
  draft.edit('new typing');
  draft.saved(save, '"rev-2"');
  assert.equal(draft.content, 'new typing');
  assert.equal(draft.dirty, true);
  assert.equal(draft.etag, '"rev-2"');
  const nextSave = draft.beginSave('intent-2');
  draft.saved(nextSave, '"rev-3"');
  assert.equal(draft.dirty, false);
});

it('does not change content or baseline when rebasing without a conflict', () => {
  const draft = new EditorDraft('original', '"rev-1"');
  draft.edit('mine');
  draft.rebase('unrelated');
  assert.equal(draft.content, 'mine');
  assert.equal(draft.etag, '"rev-1"');
});

it('retains the original idempotency intent after a network error but changes it for new content', () => {
  const draft = new EditorDraft('original', '"rev-1"');
  draft.edit('submitted');
  assert.equal(draft.beginSave('intent-1').key, 'intent-1');
  assert.equal(draft.beginSave('intent-2').key, 'intent-1');
  draft.edit('different');
  assert.equal(draft.beginSave('intent-3').key, 'intent-3');
});

it('keeps the local draft during a conflict and requires an explicit rebase', () => {
  const draft = new EditorDraft('original', '"rev-1"');
  draft.edit('my changes');
  draft.conflicted('their changes', '"rev-2"');
  assert.equal(draft.content, 'my changes');
  assert.equal(draft.etag, '"rev-1"');
  assert.deepEqual(draft.conflict, {
    content: 'their changes',
    etag: '"rev-2"',
  });
  draft.rebase('merged changes');
  assert.equal(draft.content, 'merged changes');
  assert.equal(draft.etag, '"rev-2"');
  assert.equal(draft.dirty, true);
});
