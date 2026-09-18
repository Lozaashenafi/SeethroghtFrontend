export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export interface PageMeta {
  title: string;
  description: string;
}

// ─── API Types ───

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  industryId: string;
  website: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  logoUrl: string | null;
  verified: boolean;
  reviewCount: number;
  averageRating: string | null;
  recommendationRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  publicId: string;
  userId: string;
  companyId: string;
  nickname: string | null;
  companyName: string | null;
  companySlug: string | null;
  title: string;
  pros: string | null;
  cons: string | null;
  overallRating: number | null;
  workLifeBalance: number | null;
  culture: number | null;
  management: number | null;
  compensation: number | null;
  opportunities: number | null;
  isCurrentEmployee: boolean | null;
  employmentStatus: string | null;
  jobTitle: string | null;
  isVerified: boolean;
  status?: 'published' | 'pending' | 'rejected';
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  updatedAt: string;
  authorEmail?: string;
  authorDisplayName?: string;
}

export interface Comment {
  publicId: string;
  reviewId: number;
  parentPublicId: string | null;
  content: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateReviewInput {
  companySlug: string;
  title: string;
  pros?: string;
  cons?: string;
  overallRating?: number;
  workLifeBalance?: number;
  culture?: number;
  management?: number;
  compensation?: number;
  opportunities?: number;
  isCurrentEmployee?: boolean;
  employmentStatus?: 'full-time' | 'part-time' | 'contract' | 'intern' | 'freelance';
  jobTitle?: string;
  tagIds?: number[];
}

/** Fields an author may change on their own review (company is fixed). */
export type UpdateReviewInput = Omit<CreateReviewInput, 'companySlug'>;

export interface CreateCommentInput {
  reviewPublicId: string;
  content: string;
  parentPublicId?: string;
}

export interface CreateReportInput {
  reviewPublicId?: string;
  commentPublicId?: string;
  reason: string;
  description?: string;
}

export interface CreateVoteInput {
  reviewPublicId: string;
  voteType: 'helpful' | 'unhelpful';
}

// ─── Admin: user management ───

/** A user account as returned by the admin-only user endpoints. */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  isBlocked: boolean;
  blockedAt: string | null;
  tempBlockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserCounts {
  reviews: number;
  comments: number;
  votes: number;
  reports: number;
}

export interface AdminUserDetail extends AdminUser {
  counts: AdminUserCounts;
}

export interface AdminUserComment {
  publicId: string;
  reviewPublicId: string | null;
  reviewTitle: string | null;
  companyName: string | null;
  content: string;
  helpfulCount: number;
  createdAt: string;
}

export interface AdminUserVote {
  reviewPublicId: string | null;
  reviewTitle: string | null;
  companyName: string | null;
  voteType: string;
  createdAt: string;
}

export interface AdminUserReport {
  publicId: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  reviewPublicId: string | null;
  reviewTitle: string | null;
  commentPublicId: string | null;
  commentContent: string | null;
}

export interface AdminUserActivity {
  user: AdminUser;
  reviews: { data: Review[]; pagination: Pagination };
  comments: { data: AdminUserComment[]; pagination: Pagination };
  votes: { data: AdminUserVote[]; pagination: Pagination };
  reports: { data: AdminUserReport[]; pagination: Pagination };
}

export interface Report {
  publicId: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string | null;
  // Context about the reported target (populated for the admin queue).
  reviewPublicId?: string | null;
  reviewTitle?: string | null;
  companyName?: string | null;
  companySlug?: string | null;
  commentPublicId?: string | null;
  commentContent?: string | null;
}
