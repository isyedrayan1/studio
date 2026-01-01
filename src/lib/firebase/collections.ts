// ============================================
// FIREBASE COLLECTIONS - TYPE DEFINITIONS
// ============================================

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  TOURNAMENTS: 'tournaments',
  TEAMS: 'teams',
  DAYS: 'days',
  GROUPS: 'groups',
  MATCHES: 'matches',
  BRACKET_MATCHES: 'bracketMatches',
  SCORES: 'scores',
  ANNOUNCEMENTS: 'announcements',
  USERS: 'users',
  SETTINGS: 'settings',
  ASSOCIATE_ACCOUNTS: 'associateAccounts',
} as const;

// Collection paths helper
export const getCollectionPath = (collection: keyof typeof COLLECTIONS) => {
  return COLLECTIONS[collection];
};
