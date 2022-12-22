

module.exports = function(error, req, res, next) {
  if (error.status) {
    res.status(error.status);
    error.status = undefined;
  }

  if (error instanceof Error) {
    logger.info('Error', { error });
    error = { message: error.message };
  }

  if (typeof error === 'string') {
    error = { message: error };
  }

  if (!res.statusCode || res.statusCode < 400) {
    res.status(500);
  }

  return res.json({ error }).end();
};
