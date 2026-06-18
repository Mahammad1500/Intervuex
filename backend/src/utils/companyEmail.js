/** Parse comma/newline-separated domain list into normalized hostnames */
const normalizeEmailDomains = (input) => {
  if (input == null || input === '') return [];
  const raw = Array.isArray(input) ? input : String(input).split(/[\s,;]+/);
  const domains = raw
    .map((d) => String(d).trim().toLowerCase().replace(/^@+/, ''))
    .filter((d) => d.length > 0);
  return [...new Set(domains)];
};

const getEmailDomain = (email) => {
  const parts = String(email || '').trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[1]) return null;
  return parts[1];
};

/** Empty allowed list = any email domain is OK */
const emailMatchesCompanyDomains = (email, allowedEmailDomains) => {
  const domains = normalizeEmailDomains(allowedEmailDomains);
  if (domains.length === 0) return { ok: true };
  const host = getEmailDomain(email);
  if (!host) return { ok: false, message: 'Valid email is required.' };
  if (domains.includes(host)) return { ok: true };
  return {
    ok: false,
    message: `Email must use one of these domains: ${domains.join(', ')}`,
  };
};

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  normalizeEmailDomains,
  getEmailDomain,
  emailMatchesCompanyDomains,
  escapeRegex,
};
