const jwt = require('jsonwebtoken');
const { driver } = require('../config/neo4j');

const JWT_SECRET = process.env.JWT_SECRET || 'korra_secret_key_default';

const getUserStatus = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       RETURN u.isBanned AS isBanned, u.isDeactivated AS isDeactivated`,
      { userId }
    );
    if (result.records.length === 0) return null;
    return {
      isBanned: result.records[0].get('isBanned') === true,
      isDeactivated: result.records[0].get('isDeactivated') === true,
    };
  } finally {
    await session.close();
  }
};

const verifyDecodedUserIsActive = async (decoded) => {
  const status = await getUserStatus(decoded.userId);
  if (!status) return { ok: false, statusCode: 401, message: 'Unauthorized' };
  if (status.isBanned) return { ok: false, statusCode: 403, message: 'Account is banned' };
  if (status.isDeactivated) return { ok: false, statusCode: 403, message: 'Account is deactivated' };
  return { ok: true };
};

const readBearerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

const verifyToken = async (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const active = await verifyDecodedUserIsActive(decoded);
    if (!active.ok) return res.status(active.statusCode).json({ error: active.message });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const verifyTokenOptional = async (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const active = await verifyDecodedUserIsActive(decoded);
    if (active.ok) req.user = decoded;
  } catch (_) {
    // Optional auth never blocks public requests.
  }
  next();
};

const verifyAdmin = async (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const active = await verifyDecodedUserIsActive(decoded);
    if (!active.ok) return res.status(active.statusCode).json({ error: active.message });
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  verifyToken,
  verifyTokenOptional,
  verifyAdmin,
};
