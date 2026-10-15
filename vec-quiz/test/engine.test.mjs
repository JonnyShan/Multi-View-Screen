import test from 'node:test';
import assert from 'node:assert/strict';
import { createContext, startState, reduce, scoreOf, synthesize } from '../src/js/engine.js';
import { readJson } from '../tools/lib/project.mjs';

const quiz = readJson('content/quiz.json');
const langs = ['en', 'ar', 'hi'];

function play(ctx, actions, from) {
  let state = from || startState(ctx);
  const events = [];
  for (const action of actions) {
    const out = reduce(state, action, ctx);
    state = out.state;
    events.push(...out.events);
  }
  return { state, events };
}

function answerAll(pick) {
  const actions = [];
  quiz.questions.forEach((q) => {
    actions.push({ type: 'answer', answer: pick(q) });
    actions.push({ type: 'next' });
  });
  return actions;
}

test('the picker shows for two or more languages and is skipped for one', () => {
  assert.equal(startState(createContext({ quiz, langs })).screen, 'picker');
  const single = startState(createContext({ quiz, langs: ['en'] }));
  assert.equal(single.screen, 'question');
  assert.equal(single.lang, 'en');
  assert.equal(startState(createContext({ quiz, langs: ['en'], pickerMode: 'always' })).screen, 'picker');
});

test('a full correct run scores full marks and reports every step', () => {
  const ctx = createContext({ quiz, langs });
  const { state, events } = play(ctx, [{ type: 'pick', lang: 'ar' }, ...answerAll((q) => q.correct)]);
  assert.equal(state.screen, 'end');
  assert.equal(scoreOf(state), quiz.questions.length);
  assert.deepEqual(events[0], { e: 'language_select', lang: 'ar' });
  const answers = events.filter((e) => e.e === 'answer');
  assert.equal(answers.length, quiz.questions.length);
  assert.ok(answers.every((e) => e.ok === 1 && e.lang === 'ar'));
  assert.deepEqual(events[events.length - 1], { e: 'complete', lang: 'ar', score: quiz.questions.length, total: quiz.questions.length });
});

test('a full wrong run scores zero', () => {
  const ctx = createContext({ quiz, langs });
  const { state, events } = play(ctx, [{ type: 'pick', lang: 'hi' }, ...answerAll((q) => q.answers.find((a) => a !== q.correct))]);
  assert.equal(scoreOf(state), 0);
  assert.ok(events.filter((e) => e.e === 'answer').every((e) => e.ok === 0));
});

test('out of order actions are ignored', () => {
  const ctx = createContext({ quiz, langs });
  let { state, events } = play(ctx, [{ type: 'answer', answer: 'q1.a1' }, { type: 'next' }, { type: 'pick', lang: 'xx' }]);
  assert.equal(state.screen, 'picker');
  assert.equal(events.length, 0);
  ({ state, events } = play(ctx, [{ type: 'pick', lang: 'en' }, { type: 'next' }, { type: 'answer', answer: 'q2.a1' }]));
  assert.equal(state.index, 0);
  assert.equal(state.selected, null);
  ({ state, events } = play(ctx, [{ type: 'pick', lang: 'en' }, { type: 'answer', answer: 'q1.a1' }, { type: 'answer', answer: 'q1.a2' }]));
  assert.equal(state.selected, 'q1.a1');
  assert.equal(events.filter((e) => e.e === 'answer').length, 1);
});

test('replay returns to the picker, or to question 1 when configured', () => {
  const toPicker = createContext({ quiz, langs, replay: 'picker' });
  const done = play(toPicker, [{ type: 'pick', lang: 'en' }, ...answerAll((q) => q.correct)]).state;
  const replay = reduce(done, { type: 'replay' }, toPicker);
  assert.equal(replay.state.screen, 'picker');
  assert.deepEqual(replay.events, [{ e: 'replay', lang: 'en' }]);
  const toQuestion = createContext({ quiz, langs, replay: 'question' });
  const again = reduce(done, { type: 'replay' }, toQuestion).state;
  assert.equal(again.screen, 'question');
  assert.equal(again.index, 0);
  assert.equal(again.answers.length, 0);
});

test('review states can be synthesised without reporting events', () => {
  const ctx = createContext({ quiz, langs });
  const wrong = reduce(startState(ctx), { type: 'goto', screen: 'question', lang: 'ar', index: 2, answered: 'wrong' }, ctx);
  assert.equal(wrong.events.length, 0);
  assert.equal(wrong.state.index, 2);
  assert.notEqual(wrong.state.selected, quiz.questions[2].correct);
  const end = synthesize({ screen: 'end', lang: 'hi', score: 3 }, ctx);
  assert.equal(end.screen, 'end');
  assert.equal(scoreOf(end), 3);
  assert.equal(synthesize({ screen: 'question', lang: 'zz', index: 99 }, ctx).lang, 'en');
});
