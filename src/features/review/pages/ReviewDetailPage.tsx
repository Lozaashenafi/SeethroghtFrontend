import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Send,
  Flag,
} from 'lucide-react';
import { Container } from '@/components/common';
import { BrandStarRating, TornSkeleton } from '@/components/ui';
import { useReview, useComments, useCreateComment, useVoteOnReview, useCreateReport } from '@/hooks';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import { tornEffect, cardShadow } from '@/constants/brand';
import { Modal } from '@/components/ui';

function ReportModal({ reviewPublicId, onClose }: { reviewPublicId: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    try {
      await createReport.mutateAsync({
        reviewPublicId,
        reason,
        description: description.trim() || undefined,
      });
      toast.success('Report submitted. Our team will review it.');
      onClose();
    } catch {
      toast.error('Failed to submit report');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Report this Review" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
          Why are you reporting this review? Your report is anonymous.
        </p>
        <div className="space-y-2">
          <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:text-[var(--color-text)]"
            >
              <option value="">Select a reason...</option>
              <option value="spam">Spam or advertising</option>
              <option value="harassment">Harassment or hate speech</option>
              <option value="fake">Fake or misleading review</option>
              <option value="confidential">Confidential information</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            Additional details
          </label>
          <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
              className="w-full px-4 py-3 text-sm outline-none bg-transparent resize-none dark:placeholder-[var(--color-text-secondary)]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || createReport.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flag size={14} />
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function SubRating({ label, rating }: { label: string; rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-stone-200 dark:border-[var(--color-border)] last:border-0">
      <span className="text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">{label}</span>
      <BrandStarRating rating={rating} size={10} />
    </div>
  );
}

export function ReviewDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const { data: review, isLoading, error } = useReview(publicId);
  const { data: commentsData, isLoading: commentsLoading } = useComments(publicId);
  const [commentText, setCommentText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const createComment = useCreateComment();
  const vote = useVoteOnReview();

  const handleSubmitComment = async () => {
    if (!publicId || !commentText.trim()) return;
    try {
      await createComment.mutateAsync({
        reviewPublicId: publicId,
        content: commentText.trim(),
      });
      setCommentText('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!publicId) return;
    try {
      await vote.mutateAsync({ reviewPublicId: publicId, voteType });
      toast.success('Vote recorded');
    } catch {
      toast.error('Failed to record vote');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)]">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="md" className="relative z-10 py-16">
          <TornSkeleton count={1} height="h-96" />
        </Container>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)]">
        <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <Container size="sm" className="relative z-10 py-24 text-center">
          <p className=" text-stone-500 dark:text-[var(--color-text-secondary)] text-sm tracking-normal">
            Review not found.
          </p>
          <Link to="/review" className="mt-6 inline-block">
            <span className="inline-flex items-center gap-2 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} /> Back to Reviews
            </span>
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        <Link
          to="/review"
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Reviews
        </Link>

        {/* Review Card */}
        <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)] mb-8" style={{ ...tornEffect, ...cardShadow }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex gap-4">
              <div className="h-14 w-14 flex items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] text-xl font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                {review.companyName?.charAt(0) || 'R'}
              </div>
              <div>
                <h1 className="text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
                  {review.title}
                </h1>
                <p className="text-xs text-stone-500 dark:text-[var(--color-text-secondary)] mt-1.5 ">
                  {review.nickname ?? 'Anonymous Employee'} {review.jobTitle ? `// ${review.jobTitle}` : ''}
                </p>
              </div>
            </div>
            {review.isVerified && (
              <span className="shrink-0 px-2 py-0.5 border border-[var(--color-text)] dark:border-[var(--color-text)] text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                Verified
              </span>
            )}
          </div>

          {/* Overall Rating */}
          <div className="flex items-center gap-3 mb-6">
            <BrandStarRating rating={review.overallRating} size={16} />
            <span className="font-medium text-lg text-[var(--color-text)] dark:text-[var(--color-text)]">
              {review.overallRating ? `${review.overallRating}/5` : 'N/A'}
            </span>
          </div>

          {/* Sub Ratings */}
          <div className="mb-6 p-4 border border-stone-200 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]">
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-2">
              Break Down
            </p>
            <SubRating label="Work/Life Balance" rating={review.workLifeBalance} />
            <SubRating label="Culture" rating={review.culture} />
            <SubRating label="Management" rating={review.management} />
            <SubRating label="Compensation" rating={review.compensation} />
            <SubRating label="Opportunities" rating={review.opportunities} />
          </div>

          {/* Pros & Cons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-200 dark:bg-[var(--color-border)] border border-stone-200 dark:border-[var(--color-border)] mb-6">
            {review.pros && (
              <div className="bg-[var(--color-paper)] dark:bg-[var(--color-surface)] p-5">
                <span className="text-[10px] font-medium tracking-normal text-emerald-700 dark:text-emerald-400 block mb-2 underline decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">
                  The Good
                </span>
                <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] leading-relaxed">{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div className="bg-[var(--color-paper)] dark:bg-[var(--color-surface)] p-5">
                <span className="text-[10px] font-medium tracking-normal text-orange-700 dark:text-orange-400 block mb-2 underline decoration-orange-200 dark:decoration-orange-900 underline-offset-4">
                  The Bad
                </span>
                <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] leading-relaxed">{review.cons}</p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-stone-200 dark:border-[var(--color-border)]">
            <span className="text-[11px] text-stone-500 dark:text-[var(--color-text-secondary)] ">{formatDate(review.createdAt)}</span>
            <span className="px-2 py-0.5 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] text-[10px] font-medium ">
              {review.employmentStatus}
            </span>
            {review.isCurrentEmployee && (
              <span className="px-2 py-0.5 border border-[var(--color-text)] dark:border-[var(--color-text)] text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                Current Employee
              </span>
            )}
          </div>

          {/* Vote + Report */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-xs text-stone-500 dark:text-[var(--color-text-secondary)]">Was this helpful?</span>
              <button
                onClick={() => handleVote('helpful')}
                disabled={vote.isPending}
                className="flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 disabled:opacity-50 transition-colors"
              >
                <ThumbsUp size={14} /> {review.helpfulCount}
              </button>
              <button
                onClick={() => handleVote('unhelpful')}
                disabled={vote.isPending}
                className="flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-orange-700 dark:hover:text-orange-400 disabled:opacity-50 transition-colors"
              >
                <ThumbsDown size={14} /> {review.unhelpfulCount}
              </button>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
            >
              <Flag size={14} /> Report
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3">
            <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              Comments
            </h2>
            <span className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)] ">
              {commentsData?.comments.length ?? 0} replies
            </span>
          </div>

          {/* Comment Form */}
          <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 border border-stone-200 dark:border-[var(--color-border)] mb-6" style={tornEffect}>
            <div className="flex gap-3">
              <div className="flex-1 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
              </div>
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || createComment.isPending}
                className="px-6 py-3 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={14} />
                Post
              </button>
            </div>
          </div>

          {/* Comments List */}
          {commentsLoading ? (
            <TornSkeleton count={2} height="h-20" />
          ) : commentsData?.comments.length === 0 ? (
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)] text-center" style={{ ...tornEffect, ...cardShadow }}>
              <p className=" text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
                No comments yet. Be the first to share your thoughts.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {commentsData?.comments.map((comment) => (
                <div key={comment.publicId} className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 border border-stone-200 dark:border-[var(--color-border)]" style={tornEffect}>
                  <p className="text-sm text-stone-600 dark:text-[var(--color-text-secondary)] leading-relaxed">{comment.content}</p>
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)] ">
                    <span>Anonymous</span>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>

      {showReportModal && publicId && (
        <ReportModal
          reviewPublicId={publicId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
