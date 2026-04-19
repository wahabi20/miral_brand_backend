const Visit = require('../models/Visit');

function detectDevice(ua = '') {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

exports.recordVisit = async (req, res) => {
  const { page, referrer = '' } = req.body;
  if (!page) return res.status(400).json({ message: 'page required' });

  const ua     = req.headers['user-agent'] || '';
  const ip     = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const device = detectDevice(ua);

  await Visit.create({ page, ip, device, referrer });
  res.json({ ok: true });
};

exports.getStats = async (req, res) => {
  const days   = Math.min(parseInt(req.query.days) || 30, 365);
  const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    total, todayVisits, weekVisits,
    visitsPerDay, topPages, deviceBreakdown, topReferrers, uniqueIps
  ] = await Promise.all([
    Visit.countDocuments(),
    Visit.countDocuments({ createdAt: { $gte: today } }),
    Visit.countDocuments({ createdAt: { $gte: weekAgo } }),

    Visit.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),

    Visit.aggregate([
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),

    Visit.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]),

    Visit.aggregate([
      { $match: { referrer: { $nin: ['', null] } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),

    Visit.distinct('ip', { createdAt: { $gte: since }, ip: { $ne: '' } })
  ]);

  res.json({
    total,
    todayVisits,
    weekVisits,
    uniqueVisitors: uniqueIps.length,
    visitsPerDay,
    topPages,
    deviceBreakdown,
    topReferrers,
  });
};
