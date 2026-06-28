import User from '../models/User.js';

export async function updatePreferences(req, res, next) {
  try {
    const { genres = [], languages = [] } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: { genres, languages } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function getWatchHistory(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .select('watchHistory')
      .populate('watchHistory.movie');

    res.json({ watchHistory: user.watchHistory });
  } catch (error) {
    next(error);
  }
}

