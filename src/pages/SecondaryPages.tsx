import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Star } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  useCreateReviewMutation,
  useGetBlogPostsQuery,
  useGetBusinessSettingsQuery,
  useGetOffersQuery,
  useGetReviewsQuery,
  useGetSocialPostsQuery,
} from '../store/api/endpoints.ts';
import { useAppSelector } from '../store/index.ts';

export const SocialPage: React.FC = () => {
  const { data: posts = [] } = useGetSocialPostsQuery(false);
  const { data: settings } = useGetBusinessSettingsQuery();
  const [platformFilter, setPlatformFilter] = useState<'all' | 'facebook' | 'instagram'>('all');

  const filtered = posts.filter((p) => platformFilter === 'all' || p.platform === platformFilter);

  return (
    <PublicLayout>
      <SeoHead
        title="Facebook & Instagram Updates"
        description="Official social announcements, seasonal offers, reels, and studio highlights from Healing Touch Spa & Saloon."
        image="/images/hero_sanctuary.jpg"
      />
      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">
              Social Dispatches
            </p>
            <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl">
              Facebook &amp; Instagram Feed
            </h1>
          </div>
          <div className="flex gap-3">
            <a
              href={settings?.facebookUrl || 'https://www.facebook.com/healingtouchbrj'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#183D35] px-5 py-3 text-xs font-medium tracking-wider text-[#FBF9F5] transition-colors hover:bg-[#0E2620]"
            >
              Follow on Facebook <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 inline-flex border border-[#183D35]/15 bg-[#F6F0E7]/60 p-1">
          {(['all', 'facebook', 'instagram'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatformFilter(p)}
              className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${
                platformFilter === p ? 'bg-[#183D35] text-[#FBF9F5]' : 'text-[#252525]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {filtered.map((post, idx) => (
            <CalmReveal key={post.id} delay={(idx % 3) * 0.05}>
              <article className="group flex h-full flex-col border border-[#183D35]/12 bg-[#FBF9F5]">
                <div className="overflow-hidden">
                  <LuxuryVisual
                    src={post.imageUrl}
                    alt={post.title}
                    visualKey={post.visualKey || 'hero_sanctuary'}
                    aspectClass="aspect-[4/3]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-[#858078] capitalize">
                    {post.platform} · {post.postType} · {post.publishedAt}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-medium text-[#183D35]">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#252525]/80">
                    {post.caption}
                  </p>
                  {post.externalUrl && (
                    <a
                      href={post.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#183D35] hover:underline"
                    >
                      Open Post <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </article>
            </CalmReveal>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export const OffersPage: React.FC = () => {
  const { data: offers = [] } = useGetOffersQuery(false);

  return (
    <PublicLayout>
      <SeoHead
        title="Special & Nepal Festival Offers"
        description="Dashain, Tihar, Teej, Chhath, and Nepali New Year promotions at Healing Touch Spa & Saloon."
        image="/images/package_ritual.jpg"
      />
      <section className="resort-grain border-b border-[#183D35]/10 bg-[#FAF6EF] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#A6864E]">
            Nepal Seasonal Promotions
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium text-[#183D35] sm:text-5xl">
            Festival &amp; Seasonal Offers
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col justify-between border border-[#183D35]/14 bg-[#F6F0E7]/45 p-7"
          >
            <div>
              <p className="text-xs text-[#858078]">
                {offer.festivalTag || 'Seasonal'} · {offer.applicableTo.toUpperCase()}
              </p>
              <h2 className="mt-2 font-display text-2xl font-medium text-[#183D35]">
                {offer.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#252525]/85">{offer.description}</p>
            </div>
            <div className="mt-6 border-t border-[#183D35]/10 pt-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-[#183D35]">
                  {offer.discountLabel}
                </p>
                {offer.promoCode && (
                  <p className="font-mono text-xs text-[#858078]">Code: {offer.promoCode}</p>
                )}
              </div>
              <Link
                to="/booking"
                className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-[#0E2620]"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
};

export const BlogListPage: React.FC = () => {
  const { data: posts = [] } = useGetBlogPostsQuery(false);

  return (
    <PublicLayout>
      <SeoHead
        title="Wellness & Salon Journal"
        description="Helpful guides on preparing for spa visits, hair care in Terai humidity, and beauty routines."
        image="/images/spa_aroma.jpg"
        keywords="Birgunj spa blog, Nepal skincare guide, hair care Terai humidity, massage benefits"
      />
      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Journal</p>
          <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl">
            Wellness &amp; Grooming Notes
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="border border-[#183D35]/14 bg-[#FBF9F5] p-8">
            <p className="text-xs text-[#858078]">
              {post.category} · {post.readMinutes} min read · {post.publishedAt}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium text-[#183D35]">
              <Link to={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#252525]/80">{post.excerpt}</p>
            <Link
              to={`/blog/${post.slug}`}
              className="mt-5 inline-block text-xs font-semibold text-[#183D35] underline decoration-[#C4A36A] underline-offset-4"
            >
              Read Article
            </Link>
          </article>
        ))}
      </section>
    </PublicLayout>
  );
};

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: posts = [] } = useGetBlogPostsQuery(false);
  const post = posts.find((p) => p.slug === slug);

  return (
    <PublicLayout>
      <SeoHead
        title={post ? post.title : 'Article Not Found'}
        description={post?.excerpt || 'Read wellness, spa etiquette, and beauty guidance from Healing Touch Spa & Saloon in Birgunj.'}
        type={post ? 'article' : 'website'}
        noIndex={!post}
        image={
          post?.category?.toLowerCase().includes('hair') || post?.category?.toLowerCase().includes('salon')
            ? '/images/salon_lounge.jpg'
            : post?.category?.toLowerCase().includes('couple')
            ? '/images/spa_couple.jpg'
            : '/images/spa_aroma.jpg'
        }
        canonicalPath={slug ? `/blog/${slug}` : '/blog'}
        articleMeta={
          post
            ? {
                publishedTime: post.publishedAt,
                author: post.author,
                section: post.category,
              }
            : undefined
        }
        jsonLd={
          post
            ? {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.excerpt,
                datePublished: post.publishedAt,
                articleSection: post.category,
                author: {
                  '@type': 'Person',
                  name: post.author,
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'Healing Touch Spa & Saloon',
                },
              }
            : undefined
        }
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/blog" className="text-xs font-semibold text-[#183D35] underline">
          Back to Journal
        </Link>
        {!post ? (
          <div className="mt-8 border border-[#183D35]/15 p-8">
            <h1 className="font-display text-3xl text-[#183D35]">Article not found</h1>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <p className="text-xs text-[#858078]">
              {post.category} · {post.author} · {post.publishedAt}
            </p>
            <h1 className="font-display text-4xl font-normal text-[#183D35] sm:text-5xl">
              {post.title}
            </h1>
            <div className="space-y-4 border-t border-[#183D35]/10 pt-6 text-base leading-relaxed text-[#252525]/90">
              {post.content.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        )}
      </article>
    </PublicLayout>
  );
};

export const ReviewsPage: React.FC = () => {
  const user = useAppSelector((s) => s.ui.user);
  const { data: reviews = [] } = useGetReviewsQuery(false);
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [serviceUsed, setServiceUsed] = useState('Signature Full Body Relaxation Massage');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !authorName.trim() || comment.trim().length < 5) return;
    setReviewError('');
    try {
      await createReview({
        id: `rev-${Date.now()}`,
        authorName: authorName.trim(),
        serviceUsed: serviceUsed.trim(),
        rating,
        comment: comment.trim(),
        userId: user.uid,
        published: false, // Held for admin moderation
      }).unwrap();
      setSubmitted(true);
      setComment('');
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : 'Unable to submit review. Please ensure your signed-in account has a verified email.'
      );
    }
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Guest Reviews"
        description="Read verified guest reviews and share feedback about your spa or salon visit to Healing Touch Spa & Saloon."
        image="/images/hero_sanctuary.jpg"
      />
      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Guest Feedback</p>
          <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl">
            Guest Reviews
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="border border-[#183D35]/12 bg-[#FBF9F5] p-6">
              <div className="flex gap-1 text-[#C4A36A]">
                {Array.from({ length: rev.rating }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 font-display text-lg italic leading-relaxed text-[#183D35]">
                “{rev.comment}”
              </p>
              <p className="mt-4 text-xs font-semibold text-[#183D35]">{rev.authorName}</p>
              <p className="text-xs text-[#858078]">{rev.serviceUsed}</p>
            </div>
          ))}
        </div>

        <div className="border border-[#183D35]/15 bg-[#F6F0E7]/60 p-8">
          <h2 className="font-display text-2xl font-medium text-[#183D35]">Share Your Feedback</h2>
          {!user ? (
            <div className="mt-4">
              <p className="text-sm text-[#252525]/80">
                Sign in with Google to submit a verified guest review for moderation.
              </p>
              <button
                type="button"
                onClick={() =>
                  signInWithPopup(auth, googleAuthProvider).catch((err) => {
                    setReviewError(
                      err instanceof Error ? err.message : 'Google sign-in popup was dismissed.'
                    );
                  })
                }
                className="mt-4 bg-[#183D35] px-5 py-2.5 text-xs font-semibold text-[#FBF9F5]"
              >
                Sign in with Google
              </button>
              {reviewError && <p className="mt-2 text-xs text-red-700">{reviewError}</p>}
            </div>
          ) : submitted ? (
            <p className="mt-4 text-sm text-[#183D35]">
              Thank you! Your review has been submitted for moderation by our Birgunj team.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {reviewError && (
                <p className="border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {reviewError}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="border border-[#183D35]/20 bg-white px-3 py-2 text-sm"
                />
                <input
                  value={serviceUsed}
                  onChange={(e) => setServiceUsed(e.target.value)}
                  placeholder="Service Experienced"
                  required
                  className="border border-[#183D35]/20 bg-white px-3 py-2 text-sm"
                />
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="border border-[#183D35]/20 bg-white px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Stars
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
                placeholder="Share your experience..."
                className="w-full border border-[#183D35]/20 bg-white px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#183D35] px-5 py-2.5 text-xs font-semibold text-[#FBF9F5]"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export const FaqPage: React.FC = () => {
  const { data: settings } = useGetBusinessSettingsQuery();
  const faqs = [
    {
      q: 'How early should I arrive for a spa or salon appointment?',
      a: 'We recommend arriving 10 minutes before your session so you can check in comfortably and share pressure or styling preferences.',
    },
    {
      q: 'Do you accept both men and women?',
      a: 'Yes. Our spa suites and unisex salon welcome men, women, and couples in private, respectful environments.',
    },
    {
      q: 'What is the minimum age policy?',
      a:
        settings?.agePolicyText ||
        'Guests must be 18+ for private spa suites. Guests aged 14–17 may book salon hair & nail services accompanied by a guardian.',
    },
    {
      q: 'Which payment methods are supported in Nepal?',
      a: 'You may pay in Cash at our Aadarsh Nagar reception desk, or use eSewa, Khalti, or Fonepay (online payment verification enabled).',
    },
    {
      q: 'What is your cancellation or rescheduling policy?',
      a:
        settings?.cancellationPolicyText ||
        'Rescheduling or cancellation is complimentary up to 4 hours prior to your appointment.',
    },
  ];

  return (
    <PublicLayout>
      <SeoHead
        title="Frequently Asked Questions"
        description="Answers on spa etiquette, age requirements, hygiene buffers, couples suites, and Nepal payment options."
        image="/images/hero_sanctuary.jpg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }}
      />
      <section className="mx-auto max-w-4xl px-4 py-18 sm:px-6 lg:px-8">
        <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Guest Etiquette</p>
        <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <div className="mt-10 divide-y divide-[#183D35]/15 border-y border-[#183D35]/15">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <h2 className="font-display text-2xl font-medium text-[#183D35]">{f.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#252525]/85">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export const PrivacyPolicyPage: React.FC = () => (
  <PublicLayout>
    <SeoHead
      title="Privacy Policy"
      description="Guest data privacy and appointment confidentiality policy."
    />
    <section className="mx-auto max-w-3xl px-4 py-18 sm:px-6 lg:px-8 space-y-5">
      <h1 className="font-display text-4xl font-normal text-[#183D35]">Privacy Policy</h1>
      <p className="text-sm leading-relaxed text-[#252525]/85">
        Healing Touch Spa &amp; Saloon (Aadarsh Nagar, Birgunj, Nepal) collects only the minimal contact details required to schedule, confirm, and personalize your spa or salon visit—specifically your name, phone number, optional email address, and voluntary comfort preferences.
      </p>
      <p className="text-sm leading-relaxed text-[#252525]/85">
        Your booking contact details are isolated in Firestore and accessible exclusively to you (when signed in) and authorized reception/management staff. We never sell guest records or display private contact details publicly.
      </p>
    </section>
  </PublicLayout>
);

export const TermsPage: React.FC = () => {
  const { data: settings } = useGetBusinessSettingsQuery();
  return (
    <PublicLayout>
      <SeoHead
        title="Terms & Guest Policy"
        description="Booking terms, age policy, and professional conduct standards."
      />
      <section className="mx-auto max-w-3xl px-4 py-18 sm:px-6 lg:px-8 space-y-5">
        <h1 className="font-display text-4xl font-normal text-[#183D35]">
          Terms &amp; Guest Policy
        </h1>
        <p className="text-sm leading-relaxed text-[#252525]/85">
          Healing Touch Spa &amp; Saloon operates strictly as a professional wellness spa and unisex salon. All treatments are non-medical relaxation, bodywork, hydrotherapy, and beauty services.
        </p>
        <p className="text-sm leading-relaxed text-[#252525]/85">{settings?.agePolicyText}</p>
        <p className="text-sm leading-relaxed text-[#252525]/85">
          {settings?.cancellationPolicyText}
        </p>
      </section>
    </PublicLayout>
  );
};

export const NotFoundPage: React.FC = () => (
  <PublicLayout>
    <SeoHead
      title="Page Not Found"
      description="The requested page could not be found."
      noIndex
    />
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-mono text-xs text-[#858078]">404</p>
      <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35]">Page Not Found</h1>
      <p className="mt-3 text-sm text-[#252525]/80">
        The page you are looking for may have moved. Return to our homepage or book an appointment.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/" className="bg-[#183D35] px-6 py-3 text-xs font-semibold text-[#FBF9F5]">
          Return Home
        </Link>
        <Link
          to="/booking"
          className="border border-[#183D35] px-6 py-3 text-xs font-semibold text-[#183D35]"
        >
          Book Appointment
        </Link>
      </div>
    </section>
  </PublicLayout>
);
