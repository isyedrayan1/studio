// ============================================
// FIREBASE SERVICES - INDEX
// ============================================
// Central export for all Firebase services

// Config
export { db, auth } from './config';

// Collections
export { COLLECTIONS, getCollectionPath } from './collections';

// Associate account operations
export {
  getAssociateAccounts,
  getAssociateAccountByLoginId,
  validateAssociateLogin,
  addAssociateAccount,
  updateAssociateAccount,
  deleteAssociateAccount,
  subscribeToAssociateAccounts,
} from './associate-accounts';

// Team operations
export {
  getTeams,
  getTeam,
  addTeam,
  updateTeam,
  deleteTeam,
  subscribeToTeams,
} from './teams';

// Day operations
export {
  getDays,
  getDay,
  addDay,
  updateDay,
  deleteDay,
  subscribeToDays,
} from './days';

// Group operations
export {
  getGroups,
  getGroup,
  getGroupsByDay,
  addGroup,
  updateGroup,
  deleteGroup,
  addTeamToGroup,
  removeTeamFromGroup,
  subscribeToGroups,
  subscribeToGroupsByDay,
} from './groups';

// Match operations
export {
  getMatches,
  getMatch,
  getMatchesByDay,
  addMatch,
  updateMatch,
  deleteMatch,
  setMatchLock,
  lockMatch,
  unlockMatch,
  toggleMatchLock,
  subscribeToMatches,
  subscribeToMatchesByDay,
} from './matches';

// Score operations
export {
  getScores,
  getScore,
  getScoresByMatch,
  getScoresByTeam,
  setScore,
  deleteScore,
  deleteScoresByMatch,
  subscribeToScores,
  subscribeToScoresByMatch,
  lockScore,
  unlockScore,
  toggleScoreLock,
} from './scores';

// Bracket Match operations (Day 3 Knockout)
export {
  getBracketMatches,
  getBracketMatchesByDay,
  addBracketMatch,
  updateBracketMatch,
  deleteBracketMatch,
  deleteBracketMatchesByDay,
  initializeBracket,
  setWinnerAndAdvance,
  subscribeToBracketMatches,
} from './bracket-matches';

// Announcement operations
export {
  getAnnouncements,
  getActiveAnnouncements,
  getLatestAnnouncement,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  deactivateAnnouncement,
  subscribeToAnnouncements,
  subscribeToActiveAnnouncements,
} from './announcements';

// Auth operations
export {
  signIn,
  register,
  signOut,
  getCurrentUser,
  onAuthChange,
  getUserProfile,
  setUserProfile,
  isAdmin,
  isAssociateOrHigher,
} from './auth';
