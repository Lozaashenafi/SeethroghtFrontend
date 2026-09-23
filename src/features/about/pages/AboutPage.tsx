import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  PenLine,
  Building2,
  HeartHandshake,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Container } from '@/components/common';
import { Logo } from '@/components/ui';
import { ROUTES, APP_TAGLINE } from '@/constants';
import { tornEffect, cardShadow } from '@/constants/brand';

const appFacts = [
  {
    icon: Building2,
    title: 'What is See Through?',
    body:
      'See Through is an independent, anonymous review platform for Ethiopian companies. Employees and former employees share honest, first-hand experiences about compensation, management, work-life balance, culture, and opportunities — without fear of retaliation.',
  },
  {
    icon: ShieldCheck,
    title: 'Who is it for?',
    body:
      'Job seekers looking for truthful signals before joining a company, employees researching their own employer, and companies who want to understand how they are truly perceived. If you work at — or have worked at — a company, your voice is welcome.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified accounts, anonymous reviews',
    body:
      'You create a free account with your email and password (or sign in with Google) to verify you are a real person. But when you post a review, comment, or vote, your identity stays completely anonymous. Your name and email are never shown to anyone — only your anonymous nickname appears. We verify humans, not identities.',
  },
];

const platformResponsibilities = [
  {
    title: 'Moderation and safety',
    body:
      'We review reported content and act on harassment, hate speech, impersonation, and clearly false or defamatory statements. We can block abusive identities, remove content that violates our rules, and dismiss reports that do not hold up.',
  },
  {
    title: 'Privacy first',
    body:
      'We never publish identifying details about reviewers. Personal information posted in a review is treated as confidential and removed on request or when reported.',
  },
  {
    title: 'Fairness to companies',
    body:
      'Companies can respond to reviews and report content they believe is false, malicious, or confidential. Every company gets the benefit of the doubt: reports are reviewed rather than auto-published or auto-removed.',
  },
  {
    title: 'Transparency',
    body:
      'We do not delete negative reviews just because they are unflattering, and we do not take payment to promote or bury reviews. The rating you see is the average of everything reviewers actually wrote.',
  },
];

const userResponsibilities = [
  'Verify your email address before posting — this helps us keep reviews trustworthy.',
  'Review only companies you have genuinely worked for — no fake or paid reviews.',
  'Share facts and specific experiences, not rumour, hearsay, or personal attacks.',
  'Never post confidential, proprietary, or identifying information about colleagues.',
  'Be respectful. Disagreement is fine; harassment, hate speech, and abuse are not.',
  'Report content you believe is fake or defamatory instead of retaliating in comments.',
  'One honest review per company per person — spam and duplicate reviews are removed.',
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-8 sm:py-12 lg:py-16">
        {/* Back link */}
        <Link
          to={ROUTES.HOME}
          className="mb-10 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Hero */}
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <Logo className="mx-auto mb-6 h-20 w-20" />
          <h1 className="text-3xl sm:text-4xl font-medium tracking-normal mb-3 text-[var(--color-text)] dark:text-[var(--color-text)]">
            About See Through
          </h1>
          <p className="text-stone-500 dark:text-[var(--color-text-secondary)] text-base">
            "{APP_TAGLINE}"
          </p>
        </header>

        {/* What is See Through */}
        <section className="mb-16">
          <div className="grid gap-8">
            {appFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.title}
                  className="relative bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)]"
                  style={{ ...tornEffect, ...cardShadow }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                      <Icon size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
                    </div>
                    <div>
                      <h2 className="mb-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                        {fact.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-stone-500 dark:text-[var(--color-text-secondary)]">
                        {fact.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Our responsibilities */}
        <section className="mb-16">
          <div className="mb-8 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3 flex items-center gap-3">
            <Scale size={18} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              Our Responsibilities
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {platformResponsibilities.map((item) => (
              <div
                key={item.title}
                className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 border border-stone-200 dark:border-[var(--color-border)]"
                style={tornEffect}
              >
                <h3 className="mb-2 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-500 dark:text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Your responsibilities */}
        <section className="mb-16">
          <div className="mb-8 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)] pb-3 flex items-center gap-3">
            <HeartHandshake size={18} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              Your Responsibilities as a Reviewer
            </h2>
          </div>
          <div
            className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 sm:p-8 border border-stone-200 dark:border-[var(--color-border)]"
            style={{ ...tornEffect, ...cardShadow }}
          >
            <ul className="space-y-4">
              {userResponsibilities.map((rule) => (
                <li key={rule} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[var(--color-text)] dark:bg-[var(--color-text)]">
                    <Check size={12} className="text-white dark:text-[var(--color-bg)]" />
                  </span>
                  <span className="text-sm leading-relaxed text-stone-600 dark:text-[var(--color-text)]">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] px-8 py-10 shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
            <PenLine size={24} className="mx-auto mb-4 text-[var(--color-text)] dark:text-[var(--color-text)]" />
            <h2 className="mb-2 text-lg font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              Have something to say?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
              Create a free account, verify your email, and share your experience anonymously. Your name is never revealed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={ROUTES.REGISTER}
                className="inline-block bg-[var(--color-text)] dark:bg-[var(--color-text)] px-8 py-3 text-[10px] font-medium tracking-normal text-white dark:text-[var(--color-bg)] hover:opacity-90 transition-opacity"
              >
                Create Account
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="inline-block border-2 border-[var(--color-text)] dark:border-[var(--color-text)] px-8 py-3 text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
