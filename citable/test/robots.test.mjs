import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRobots, isAllowed, normalizeTarget, suggestRobots, visibleText } from '../src/checker.js';

const txt = `
User-agent: *
Disallow: /admin
Disallow: /cart

User-agent: GPTBot
User-agent: OAI-SearchBot
Disallow: /

User-agent: PerplexityBot
Disallow: /
Allow: /blog/
Allow: /$

Sitemap: https://ex.com/sitemap.xml
`;
const p = parseRobots(txt);

test('group sharing multiple agents', () => {
  assert.equal(isAllowed(p, 'OAI-SearchBot', '/pricing').allowed, false);
  assert.equal(isAllowed(p, 'GPTBot', '/').allowed, false);
});
test('fallback to * group', () => {
  assert.equal(isAllowed(p, 'ClaudeBot', '/pricing').allowed, true);
  assert.equal(isAllowed(p, 'ClaudeBot', '/admin/x').allowed, false);
});
test('longest match + $ anchor', () => {
  assert.equal(isAllowed(p, 'PerplexityBot', '/blog/post').allowed, true);
  assert.equal(isAllowed(p, 'PerplexityBot', '/').allowed, true);
  assert.equal(isAllowed(p, 'PerplexityBot', '/about').allowed, false);
});
test('case-insensitive token', () => {
  assert.equal(isAllowed(parseRobots('User-agent: oai-searchbot\nDisallow: /'), 'OAI-SearchBot', '/').allowed, false);
});
test('allow wins tie', () => {
  assert.equal(isAllowed(parseRobots('User-agent: *\nDisallow: /a\nAllow: /a'), 'X', '/a').allowed, true);
});
test('empty disallow allows all', () => {
  assert.equal(isAllowed(parseRobots('User-agent: *\nDisallow:'), 'GPTBot', '/').allowed, true);
});
test('wildcard', () => {
  assert.equal(isAllowed(parseRobots('User-agent: *\nDisallow: /*.pdf$'), 'X', '/a/b.pdf').allowed, false);
  assert.equal(isAllowed(parseRobots('User-agent: *\nDisallow: /*.pdf$'), 'X', '/a/b.pdf?x').allowed, true);
});
test('sitemaps', () => assert.deepEqual(p.sitemaps, ['https://ex.com/sitemap.xml']));
test('suggestion keeps star disallows', () => {
  const s = suggestRobots(p, ['OAI-SearchBot']);
  assert.match(s, /User-agent: OAI-SearchBot\nAllow: \/\nDisallow: \/admin\nDisallow: \/cart/);
});
test('url safety', () => {
  assert.equal(normalizeTarget('example.com').href, 'https://example.com/');
  for (const bad of ['localhost', 'http://127.0.0.1', 'ftp://x.com', 'http://x.com:8080', 'http://[::1]/', 'intranet'])
    assert.throws(() => normalizeTarget(bad));
});
test('visible text strips scripts', () => {
  assert.equal(visibleText('<div id=root></div><script>var a="hello world"</script>'), '');
});
