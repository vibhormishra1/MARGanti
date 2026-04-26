// REQ-M2-09: Validate request body. Return 400 with field-level errors.
// Using safeParse (not parse) — parse() throws an exception that bypasses
// our 400 handler and hits the global 500 handler instead.
// req.validated holds the parsed data so controllers never touch req.body.

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    // Attach parsed+typed data — controllers use req.validated, never req.body
    req.validated = result.data;
    next();
  };
}
