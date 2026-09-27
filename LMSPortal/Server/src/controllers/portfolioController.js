import {
  getLearnerPortfolio,
  getPublicPortfolio,
  updatePortfolioSettings,
} from '../services/portfolioService.js';

export const getMyPortfolio = async (req, res, next) => {
  try {
    const portfolio = await getLearnerPortfolio(req.user.id || req.user._id);
    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicPortfolioHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const portfolio = await getPublicPortfolio(slug);
    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    if (err.isPrivate) {
      return res.status(403).json({
        success: false,
        isPrivate: true,
        message: err.message,
      });
    }
    next(err);
  }
};

export const updateSettingsHandler = async (req, res, next) => {
  try {
    const updated = await updatePortfolioSettings(req.user.id || req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Portfolio privacy and display settings updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
