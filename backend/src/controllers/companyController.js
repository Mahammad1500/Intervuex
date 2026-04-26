const Company = require('../models/Company');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

const normalizeSpaceCode = (raw) => {
  if (raw == null || raw === '') return null;
  return String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
};

const createCompany = async (req, res, next) => {
  try {
    const { name, spaceCode: customCode } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const normalized = normalizeSpaceCode(customCode);
    if (normalized && normalized.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'Space code must be exactly 8 letters or numbers (A–Z, 0–9), or leave blank to auto-generate.',
      });
    }
    if (normalized) {
      const taken = await Company.findOne({ spaceCode: normalized });
      if (taken) {
        return res.status(409).json({ success: false, message: 'This space code is already in use. Choose another.' });
      }
    }

    const company = await Company.create({
      name: name.trim(),
      createdBy: req.user._id,
      ...(normalized ? { spaceCode: normalized } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      data: { company },
    });
  } catch (err) { next(err); }
};

const getMyWorkspace = async (req, res, next) => {
  try {
    if (!req.user.companyId) {
      return res.json({
        success: true,
        data: {
          hasWorkspace: false,
          company: null,
          stats: null,
          message: req.user.role === 'admin'
            ? 'No company workspace is linked to your admin profile. Create a company from the admin dashboard or ask a platform admin.'
            : 'Your account is not linked to a company. Contact a platform admin.',
        },
      });
    }

    const company = await Company.findById(req.user.companyId);
    if (!company) return next(createError('Company not found.', 404));

    const activeHRCount = await User.countDocuments({
      companyId: company._id,
      role: 'hr',
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        hasWorkspace: true,
        company: {
          id: company._id,
          name: company.name,
          spaceCode: company.spaceCode,
          createdAt: company.createdAt,
        },
        stats: { activeHRCount },
      },
    });
  } catch (err) { next(err); }
};

const updateSpaceCode = async (req, res, next) => {
  try {
    const normalized = normalizeSpaceCode(req.body.spaceCode);
    if (!normalized || normalized.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'Space code must be exactly 8 letters or numbers (A–Z, 0–9).',
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) return next(createError('Company not found.', 404));

    const taken = await Company.findOne({ spaceCode: normalized, _id: { $ne: company._id } });
    if (taken) {
      return res.status(409).json({ success: false, message: 'This space code is already in use by another workspace.' });
    }

    company.spaceCode = normalized;
    await company.save();

    res.json({
      success: true,
      message: 'Space code updated. Share the new code with HRs who still need to register.',
      data: { company },
    });
  } catch (err) { next(err); }
};

const getCompanies = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ name: re }, { spaceCode: re }];
    }
    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Company.countDocuments(filter),
    ]);

    const companiesWithCounts = await Promise.all(
      companies.map(async (c) => {
        const hrCount = await User.countDocuments({ companyId: c._id, role: 'hr', isActive: true });
        return { ...c.toJSON(), hrCount };
      })
    );

    res.json({
      success: true,
      data: {
        companies: companiesWithCounts,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) { next(err); }
};

const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    if (!company) return next(createError('Company not found.', 404));

    const hrUsers = await User.find({ companyId: company._id, role: 'hr' }).select('firstName lastName email isActive createdAt');
    res.json({ success: true, data: { company, hrUsers } });
  } catch (err) { next(err); }
};

const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return next(createError('Company not found.', 404));

    await User.updateMany({ companyId: company._id }, { $set: { isActive: false } });
    await Company.findByIdAndDelete(company._id);

    res.json({ success: true, message: 'Company deleted and associated HR users deactivated.' });
  } catch (err) { next(err); }
};

module.exports = {
  createCompany,
  getMyWorkspace,
  updateSpaceCode,
  getCompanies,
  getCompany,
  deleteCompany,
};
