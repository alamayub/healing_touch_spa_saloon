import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { LuxuryVisual } from '../components/ui/LuxuryVisual.tsx';
import { CalmReveal } from '../components/ui/MotionPrimitives.tsx';
import { useGetStaffQuery } from '../store/api/endpoints.ts';
import { useAppDispatch } from '../store/index.ts';
import { setBookingDraft } from '../store/slices/uiSlice.ts';

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: staff = [], isLoading } = useGetStaffQuery(false);
  const [division, setDivision] = useState<'all' | 'spa' | 'salon'>('all');

  const filtered = staff.filter(
    (m) => division === 'all' || m.division === division || m.division === 'both'
  );

  const handleBookWithStaff = (memberId: string, memberDivision: string) => {
    dispatch(
      setBookingDraft({
        category: memberDivision === 'salon' ? 'salon' : 'spa',
        staffId: memberId,
      })
    );
    navigate('/booking');
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Therapists & Salon Professionals"
        description="Meet our certified spa therapists, hair stylists, and bridal makeup artists at Healing Touch Spa & Saloon."
        image="/images/team_therapist.jpg"
      />

      <section className="resort-grain border-b border-[#183D35]/10 bg-[#F6F0E7] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.22em] text-[#858078]">Our Specialists</p>
          <h1 className="mt-2 font-display text-4xl font-normal text-[#183D35] sm:text-5xl lg:text-6xl">
            Meet Our Therapists &amp; Stylists
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#252525]/82 sm:text-base">
            Select a preferred therapist or salon specialist when booking your session, or let our reception pair you with the earliest open specialist.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 inline-flex border border-[#183D35]/15 bg-[#F6F0E7]/60 p-1">
          {(['all', 'spa', 'salon'] as const).map((div) => (
            <button
              key={div}
              type="button"
              onClick={() => setDivision(div)}
              className={`px-4 py-2 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                division === div ? 'bg-[#183D35] text-[#FBF9F5]' : 'text-[#252525]'
              }`}
            >
              {div === 'all' ? 'All Professionals' : `${div} Team`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 animate-pulse border border-[#183D35]/10 bg-[#F6F0E7]/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((member, idx) => (
              <CalmReveal key={member.id} delay={(idx % 4) * 0.05}>
                <article className="group flex h-full flex-col border border-[#183D35]/12 bg-[#FBF9F5] p-6 transition-colors hover:border-[#183D35]/30">
                  <div className="mb-5 overflow-hidden">
                    <LuxuryVisual
                      src={
                        member.avatarUrl ||
                        (member.division === 'salon'
                          ? member.designation.toLowerCase().includes('bridal')
                            ? '/images/team_mua.jpg'
                            : '/images/team_stylist.jpg'
                          : member.name.toLowerCase().includes('anita')
                          ? '/images/spa_reflexology.jpg'
                          : '/images/team_therapist.jpg')
                      }
                      alt={member.name}
                      visualKey="team_portrait"
                      aspectClass="aspect-[4/3]"
                      objectPosition="top"
                    />
                  </div>
                  <p className="text-xs text-[#858078] capitalize">
                    {member.division} · {member.experienceYears} years experience
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-medium text-[#183D35]">
                    {member.name}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-[#252525]/78">
                    {member.designation}
                  </p>
                  {member.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-[#252525]/80">{member.bio}</p>
                  )}

                  <div className="mt-5 space-y-1.5 border-t border-[#183D35]/10 pt-4 text-xs text-[#858078]">
                    <p>
                      <strong className="text-[#183D35]">Focus:</strong>{' '}
                      {member.specializations.join(', ')}
                    </p>
                    <p>
                      <strong className="text-[#183D35]">Languages:</strong>{' '}
                      {member.languages.join(', ')}
                    </p>
                    <p className="tabular-nums">
                      <strong className="text-[#183D35]">Hours:</strong> {member.shiftStart} –{' '}
                      {member.shiftEnd}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookWithStaff(member.id, member.division)}
                    className="mt-auto pt-6 w-full"
                  >
                    <span className="block w-full bg-[#183D35] px-4 py-2.5 text-center text-xs font-medium tracking-wide text-[#FBF9F5] transition-colors hover:bg-[#0E2620]">
                      Book with Specialist
                    </span>
                  </button>
                </article>
              </CalmReveal>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};
