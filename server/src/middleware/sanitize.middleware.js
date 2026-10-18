/**
 * Express 5 compatible NoSQL injection sanitizer.
 * Express 5 makes req.query a read-only getter, so traditional mongo-sanitize
 * libraries crash. This middleware recursively sanitizes req.body and req.params,
 * stripping keys that begin with '$' or contain '.'.
 */
function stripNoSqlOperators(target) {
  if (!target || typeof target !== "object") return;

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      if (typeof target[i] === "object" && target[i] !== null) {
        stripNoSqlOperators(target[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(target)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete target[key];
    } else if (typeof target[key] === "object" && target[key] !== null) {
      stripNoSqlOperators(target[key]);
    }
  }
}

export const sanitizeNoSql = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    stripNoSqlOperators(req.body);
  }
  if (req.params && typeof req.params === "object") {
    stripNoSqlOperators(req.params);
  }
  next();
};
