// Enforce Content-Type: application/json on POST requests.
// Without this, express.json() silently produces undefined body
// and Zod throws a confusing schema error instead of a clean 400.

export function requireJSON(req, res, next) {
  if (req.method === "POST" && !req.is("application/json")) {
    return res.status(415).json({
      error: "Content-Type must be application/json",
    });
  }
  next();
}
