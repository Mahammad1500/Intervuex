const {
  normalizeEmailDomains,
  getEmailDomain,
  emailMatchesCompanyDomains,
} = require('../utils/companyEmail');

describe('companyEmail utilities', () => {
  describe('normalizeEmailDomains', () => {
    it('parses comma-separated domains and removes @ prefix', () => {
      expect(normalizeEmailDomains('acme.com, @beta.io')).toEqual(['acme.com', 'beta.io']);
    });

    it('returns empty array for blank input', () => {
      expect(normalizeEmailDomains('')).toEqual([]);
      expect(normalizeEmailDomains(null)).toEqual([]);
    });

    it('deduplicates domains', () => {
      expect(normalizeEmailDomains('acme.com, acme.com')).toEqual(['acme.com']);
    });
  });

  describe('getEmailDomain', () => {
    it('extracts domain from valid email', () => {
      expect(getEmailDomain('User@Acme.COM')).toBe('acme.com');
    });

    it('returns null for invalid email', () => {
      expect(getEmailDomain('not-an-email')).toBeNull();
    });
  });

  describe('emailMatchesCompanyDomains', () => {
    it('allows any domain when list is empty', () => {
      expect(emailMatchesCompanyDomains('a@any.com', []).ok).toBe(true);
    });

    it('allows matching domain', () => {
      const result = emailMatchesCompanyDomains('hr@acme.com', ['acme.com']);
      expect(result.ok).toBe(true);
    });

    it('rejects non-matching domain with message', () => {
      const result = emailMatchesCompanyDomains('hr@gmail.com', ['acme.com']);
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/acme\.com/);
    });
  });
});
