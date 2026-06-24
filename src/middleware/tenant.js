'use strict';

/**
 * 🏢 SaaS Tenant Middleware
 * - يربط كل request بـ organizationId
 * - يمنع تسريب البيانات بين الشركات
 */

const attachTenant = (req, res, next) => {
  try {
    // لازم يكون المستخدم مسجل دخول
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - no user found',
      });
    }

    // نجيب الـ organizationId من المستخدم
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        success: false,
        message: 'No organization assigned to this user',
      });
    }

    // نخزنها في request عشان كل الكنترولرز يستخدمونها
    req.tenantId = organizationId;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Tenant middleware error',
    });
  }
};

module.exports = attachTenant;