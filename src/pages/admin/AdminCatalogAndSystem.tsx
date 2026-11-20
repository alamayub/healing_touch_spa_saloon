import React, { useEffect, useState } from 'react';
import {
  useGetAdminUsersQuery,
  useGetAuditLogsQuery,
  useGetBlogPostsQuery,
  useGetBusinessSettingsQuery,
  useGetCategoriesQuery,
  useGetContactMessagesQuery,
  useGetGalleryQuery,
  useGetOffersQuery,
  useGetPackagesQuery,
  useGetReviewsQuery,
  useGetRoomsQuery,
  useGetSalonServicesQuery,
  useGetSocialPostsQuery,
  useGetSpaServicesQuery,
  useGetStaffQuery,
  useModerateReviewMutation,
  useRemoveAdminUserMutation,
  useRemoveBlogPostMutation,
  useRemoveCategoryMutation,
  useRemoveContactMessageMutation,
  useRemoveGalleryItemMutation,
  useRemoveOfferMutation,
  useRemovePackageMutation,
  useRemoveReviewMutation,
  useRemoveRoomMutation,
  useRemoveSalonServiceMutation,
  useRemoveSocialPostMutation,
  useRemoveSpaServiceMutation,
  useRemoveStaffMutation,
  useSaveAdminUserMutation,
  useSaveBlogPostMutation,
  useSaveCategoryMutation,
  useSaveGalleryItemMutation,
  useSaveOfferMutation,
  useSavePackageMutation,
  useSaveRoomMutation,
  useSaveSalonServiceMutation,
  useSaveSocialPostMutation,
  useSaveSpaServiceMutation,
  useSaveStaffMutation,
  useSeedCatalogMutation,
  useUpdateBusinessSettingsMutation,
  useUpdateContactMessageStatusMutation,
} from '../../store/api/endpoints.ts';
import {
  BusinessSettings,
  ContactMessage,
  RoomType,
  SalonService,
  SpaRoom,
  SpaService,
  StaffDivision,
  UserRole,
} from '../../types/domain.ts';
import { formatNpr } from '../../utils/nepal.ts';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AdminSpaServicesSection: React.FC = () => {
  const { data: services = [] } = useGetSpaServicesQuery(true);
  const { data: categories = [] } = useGetCategoriesQuery(true);
  const [saveSpa, { isLoading: saving }] = useSaveSpaServiceMutation();
  const [removeSpa] = useRemoveSpaServiceMutation();

  const spaCats = categories.filter((c) => c.division === 'spa');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameNe, setNameNe] = useState('');
  const [category, setCategory] = useState('Full Body Massage');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [priceNpr, setPriceNpr] = useState(3200);
  const [couplePriceNpr, setCouplePriceNpr] = useState(6000);
  const [supportsCouple, setSupportsCouple] = useState(true);
  const [roomTypeRequired, setRoomTypeRequired] = useState<RoomType | 'any'>('single_suite');
  const [description, setDescription] = useState('');
  const [involves, setInvolves] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [published, setPublished] = useState(true);
  const [notice, setNotice] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setNameNe('');
    setCategory('Full Body Massage');
    setDurationMinutes(60);
    setBufferMinutes(15);
    setPriceNpr(3200);
    setCouplePriceNpr(6000);
    setSupportsCouple(true);
    setRoomTypeRequired('single_suite');
    setDescription('');
    setInvolves('');
    setImageUrl('');
    setFeatured(true);
    setPublished(true);
  };

  const startEdit = (s: SpaService) => {
    setEditingId(s.id);
    setName(s.name);
    setNameNe(s.nameNe || '');
    setCategory(s.category);
    setDurationMinutes(s.durationMinutes);
    setBufferMinutes(s.bufferMinutes);
    setPriceNpr(s.priceNpr);
    setCouplePriceNpr(s.couplePriceNpr ?? Math.round(s.priceNpr * 1.85));
    setSupportsCouple(s.supportsCouple);
    setRoomTypeRequired(s.roomTypeRequired || 'single_suite');
    setDescription(s.description);
    setInvolves(s.involves || '');
    setImageUrl(s.imageUrl || '');
    setFeatured(s.featured);
    setPublished(s.published);
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const item: SpaService = {
      id: editingId || `spa-${Date.now()}`,
      name: name.trim(),
      nameNe: nameNe.trim() || undefined,
      category,
      description: description.trim() || 'Restorative spa treatment.',
      involves: involves.trim() || undefined,
      durationMinutes,
      bufferMinutes,
      priceNpr,
      couplePriceNpr: supportsCouple ? couplePriceNpr : undefined,
      supportsCouple,
      roomTypeRequired,
      imageUrl: imageUrl.trim() || undefined,
      visualKey: 'spa_massage',
      featured,
      published,
      verifiedByBusiness: true,
    };
    await saveSpa(item);
    setNotice(editingId ? `Updated spa service "${item.name}".` : `Created spa service "${item.name}".`);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            {editingId ? 'Edit Spa Treatment' : 'Add New Spa Treatment'}
          </h3>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Treatment Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={nameNe}
            onChange={(e) => setNameNe(e.target.value)}
            placeholder="Nepali Name (Optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          >
            {spaCats.length > 0 ? (
              spaCats.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))
            ) : (
              <option value="Full Body Massage">Full Body Massage</option>
            )}
          </select>
          <div>
            <label className="block text-[10px] text-[#858078]">Single Price (NPR)</label>
            <input
              type="number"
              min={0}
              value={priceNpr}
              onChange={(e) => setPriceNpr(Number(e.target.value))}
              className="mt-0.5 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#858078]">Couple Price (NPR)</label>
            <input
              type="number"
              min={0}
              disabled={!supportsCouple}
              value={couplePriceNpr}
              onChange={(e) => setCouplePriceNpr(Number(e.target.value))}
              className="mt-0.5 w-full border border-[#183D35]/20 px-3 py-2 text-xs disabled:opacity-40"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#858078]">Required Suite Type</label>
            <select
              value={roomTypeRequired}
              onChange={(e) => setRoomTypeRequired(e.target.value as RoomType | 'any')}
              className="mt-0.5 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
            >
              <option value="single_suite">Single Suite</option>
              <option value="couple_suite">Couple Suite</option>
              <option value="hydro_suite">Hydrotherapy / Steam / Jacuzzi</option>
              <option value="reflexology_lounge">Reflexology Lounge</option>
              <option value="any">Any Spa Room</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[#858078]">Duration (min)</label>
            <input
              type="number"
              min={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="mt-0.5 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#858078]">Cleaning Buffer (min)</label>
            <input
              type="number"
              min={0}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="mt-0.5 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#858078]">Image URL (Optional)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cloudinary / HTTPS URL"
              className="mt-0.5 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Clear non-medical treatment description"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-3"
          />
          <input
            value={involves}
            onChange={(e) => setInvolves(e.target.value)}
            placeholder="What the session involves (optional step-by-step details)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-3"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={supportsCouple}
                onChange={(e) => setSupportsCouple(e.target.checked)}
              />
              Supports Couples
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Featured on Homepage
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Published
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#183D35] px-5 py-2 text-xs font-semibold text-[#FBF9F5]"
          >
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Spa Service'}
          </button>
        </div>
        {notice && <p className="text-xs font-medium text-[#183D35]">{notice}</p>}
      </form>

      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {services.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
            <div>
              <p className="font-medium text-[#183D35]">
                {s.name}{' '}
                {s.supportsCouple && (
                  <span className="ml-1 text-[10px] text-[#858078]">
                    (Couple: {formatNpr(s.couplePriceNpr || s.priceNpr * 2)})
                  </span>
                )}
              </p>
              <p className="text-[#858078]">
                {s.category} · {s.durationMinutes}m (+{s.bufferMinutes}m buffer) ·{' '}
                {formatNpr(s.priceNpr)} · Room: {s.roomTypeRequired || 'any'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => startEdit(s)}
                className="border border-[#183D35]/25 px-3 py-1 text-[#183D35] hover:bg-[#F6F0E7]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => saveSpa({ ...s, published: !s.published })}
                className="border border-[#183D35]/20 px-3 py-1"
              >
                {s.published ? 'Published' : 'Draft'}
              </button>
              <button
                type="button"
                onClick={() => removeSpa(s.id)}
                className="text-red-700 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminSalonServicesSection: React.FC = () => {
  const { data: services = [] } = useGetSalonServicesQuery(true);
  const { data: categories = [] } = useGetCategoriesQuery(true);
  const [saveSalon, { isLoading: saving }] = useSaveSalonServiceMutation();
  const [removeSalon] = useRemoveSalonServiceMutation();

  const salonCats = categories.filter((c) => c.division === 'salon');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameNe, setNameNe] = useState('');
  const [category, setCategory] = useState("Women's Haircut");
  const [audience, setAudience] = useState<'unisex' | 'women' | 'men'>('unisex');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [priceNpr, setPriceNpr] = useState(1200);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(true);
  const [published, setPublished] = useState(true);
  const [notice, setNotice] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setNameNe('');
    setCategory("Women's Haircut");
    setAudience('unisex');
    setDurationMinutes(45);
    setBufferMinutes(10);
    setPriceNpr(1200);
    setDescription('');
    setImageUrl('');
    setFeatured(true);
    setPublished(true);
  };

  const startEdit = (s: SalonService) => {
    setEditingId(s.id);
    setName(s.name);
    setNameNe(s.nameNe || '');
    setCategory(s.category);
    setAudience(s.audience);
    setDurationMinutes(s.durationMinutes);
    setBufferMinutes(s.bufferMinutes);
    setPriceNpr(s.priceNpr);
    setDescription(s.description);
    setImageUrl(s.imageUrl || '');
    setFeatured(s.featured);
    setPublished(s.published);
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const item: SalonService = {
      id: editingId || `salon-${Date.now()}`,
      name: name.trim(),
      nameNe: nameNe.trim() || undefined,
      category,
      audience,
      description: description.trim() || 'Professional unisex salon care.',
      durationMinutes,
      bufferMinutes,
      priceNpr,
      imageUrl: imageUrl.trim() || undefined,
      visualKey: 'salon_lounge',
      featured,
      published,
      verifiedByBusiness: true,
    };
    await saveSalon(item);
    setNotice(editingId ? `Updated salon service "${item.name}".` : `Created salon service "${item.name}".`);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            {editingId ? 'Edit Salon Service' : 'Add New Salon Service'}
          </h3>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Salon Service Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={nameNe}
            onChange={(e) => setNameNe(e.target.value)}
            placeholder="Nepali Name (Optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          >
            {salonCats.length > 0 ? (
              salonCats.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))
            ) : (
              <option value="Women's Haircut">Women&apos;s Haircut</option>
            )}
          </select>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          >
            <option value="unisex">Unisex</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>
          <input
            type="number"
            min={0}
            value={priceNpr}
            onChange={(e) => setPriceNpr(Number(e.target.value))}
            placeholder="Price NPR"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            type="number"
            min={10}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            placeholder="Duration (min)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            type="number"
            min={0}
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(Number(e.target.value))}
            placeholder="Prep Buffer (min)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Service description"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-3"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Featured
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Published
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#183D35] px-5 py-2 text-xs font-semibold text-[#FBF9F5]"
          >
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Salon Service'}
          </button>
        </div>
        {notice && <p className="text-xs font-medium text-[#183D35]">{notice}</p>}
      </form>

      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {services.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
            <div>
              <p className="font-medium text-[#183D35]">{s.name}</p>
              <p className="text-[#858078] capitalize">
                {s.audience} · {s.category} · {s.durationMinutes}m · {formatNpr(s.priceNpr)}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => startEdit(s)}
                className="border border-[#183D35]/25 px-3 py-1 text-[#183D35] hover:bg-[#F6F0E7]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => saveSalon({ ...s, published: !s.published })}
                className="border border-[#183D35]/20 px-3 py-1"
              >
                {s.published ? 'Published' : 'Draft'}
              </button>
              <button
                type="button"
                onClick={() => removeSalon(s.id)}
                className="text-red-700 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminCategoriesSection: React.FC = () => {
  const { data: categories = [] } = useGetCategoriesQuery(true);
  const [saveCat] = useSaveCategoryMutation();
  const [removeCat] = useRemoveCategoryMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nameNe, setNameNe] = useState('');
  const [division, setDivision] = useState<'spa' | 'salon'>('spa');
  const [sortOrder, setSortOrder] = useState(1);

  const reset = () => {
    setEditingId(null);
    setName('');
    setNameNe('');
    setDivision('spa');
    setSortOrder(categories.length + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveCat({
      id: editingId || `cat-${Date.now()}`,
      name: name.trim(),
      nameNe: nameNe.trim() || undefined,
      division,
      sortOrder,
      active: true,
    });
    reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 border border-[#183D35]/12 bg-white p-5 sm:grid-cols-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name *"
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
          required
        />
        <input
          value={nameNe}
          onChange={(e) => setNameNe(e.target.value)}
          placeholder="Nepali Label"
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
        />
        <select
          value={division}
          onChange={(e) => setDivision(e.target.value as 'spa' | 'salon')}
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
        >
          <option value="spa">Spa</option>
          <option value="salon">Salon</option>
        </select>
        <input
          type="number"
          min={1}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          placeholder="Sort Order"
          className="border border-[#183D35]/20 px-3 py-2 text-xs"
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]">
            {editingId ? 'Save' : 'Add Category'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="border border-[#183D35]/20 px-3 py-2 text-xs">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="grid grid-cols-1 gap-2 border border-[#183D35]/12 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 border border-[#183D35]/10 p-3 text-xs">
            <div>
              <strong className="text-[#183D35]">{c.name}</strong>{' '}
              <span className="uppercase text-[10px] text-[#858078]">({c.division})</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingId(c.id);
                  setName(c.name);
                  setNameNe(c.nameNe || '');
                  setDivision(c.division);
                  setSortOrder(c.sortOrder);
                }}
                className="text-[#183D35] underline"
              >
                Edit
              </button>
              <button type="button" onClick={() => removeCat(c.id)} className="text-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminPackagesSection: React.FC = () => {
  const { data: packages = [] } = useGetPackagesQuery(true);
  const [savePkg, { isLoading: saving }] = useSavePackageMutation();
  const [removePkg] = useRemovePackageMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Custom Package');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(5500);
  const [regularPrice, setRegularPrice] = useState<number>(6400);
  const [duration, setDuration] = useState(120);
  const [servicesText, setServicesText] = useState('Full Body Massage, Steam Bath');
  const [supportsCouple, setSupportsCouple] = useState(false);
  const [published, setPublished] = useState(true);

  const reset = () => {
    setEditingId(null);
    setName('');
    setCategory('Custom Package');
    setDescription('');
    setPrice(5500);
    setRegularPrice(6400);
    setDuration(120);
    setServicesText('Full Body Massage, Steam Bath');
    setSupportsCouple(false);
    setPublished(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await savePkg({
      id: editingId || `pkg-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim() || 'Curated multi-service ritual package.',
      includedServiceIds: [],
      includedServiceNames: servicesText.split(',').map((s) => s.trim()).filter(Boolean),
      totalDurationMinutes: duration,
      packagePriceNpr: price,
      regularPriceNpr: regularPrice > price ? regularPrice : undefined,
      savingsVerified: regularPrice > price,
      supportsCouple,
      published,
      featured: true,
    });
    reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            {editingId ? 'Edit Package' : 'Create Spa & Salon Package'}
          </h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Package Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. Couple Experience)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            value={servicesText}
            onChange={(e) => setServicesText(e.target.value)}
            placeholder="Included Services (comma separated)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
          />
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Package Price NPR"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            type="number"
            min={0}
            value={regularPrice}
            onChange={(e) => setRegularPrice(Number(e.target.value))}
            placeholder="Regular Price NPR"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            type="number"
            min={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            placeholder="Minutes"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Package description"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={supportsCouple}
                onChange={(e) => setSupportsCouple(e.target.checked)}
              />
              Couples Package
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Published
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#183D35] px-5 py-2 text-xs font-medium text-[#FBF9F5]"
          >
            {editingId ? 'Save Changes' : 'Create Package'}
          </button>
        </div>
      </form>
      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {packages.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
            <div>
              <p className="font-medium text-[#183D35]">
                {p.name} ({p.category})
              </p>
              <p className="text-[#858078]">
                {p.includedServiceNames.join(' + ')} · {p.totalDurationMinutes}m ·{' '}
                {formatNpr(p.packagePriceNpr)}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditingId(p.id);
                  setName(p.name);
                  setCategory(p.category);
                  setDescription(p.description);
                  setPrice(p.packagePriceNpr);
                  setRegularPrice(p.regularPriceNpr || p.packagePriceNpr);
                  setDuration(p.totalDurationMinutes);
                  setServicesText(p.includedServiceNames.join(', '));
                  setSupportsCouple(p.supportsCouple);
                  setPublished(p.published);
                }}
                className="border border-[#183D35]/25 px-3 py-1 text-[#183D35] hover:bg-[#F6F0E7]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => savePkg({ ...p, published: !p.published })}
                className="border border-[#183D35]/20 px-3 py-1"
              >
                {p.published ? 'Published' : 'Draft'}
              </button>
              <button type="button" onClick={() => removePkg(p.id)} className="text-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminStaffSection: React.FC<{ divisionFilter?: 'spa' | 'salon' }> = ({
  divisionFilter,
}) => {
  const { data: staff = [] } = useGetStaffQuery(true);
  const [saveStaff, { isLoading: saving }] = useSaveStaffMutation();
  const [removeStaff] = useRemoveStaffMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [division, setDivision] = useState<StaffDivision>(divisionFilter || 'spa');
  const [experienceYears, setExperienceYears] = useState(3);
  const [bio, setBio] = useState('');
  const [specializationsText, setSpecializationsText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [languagesText, setLanguagesText] = useState('Nepali, English, Hindi');
  const [workingDays, setWorkingDays] = useState<string[]>(WEEKDAYS);
  const [shiftStart, setShiftStart] = useState('09:30');
  const [shiftEnd, setShiftEnd] = useState('20:00');
  const [breakStart, setBreakStart] = useState('13:30');
  const [breakEnd, setBreakEnd] = useState('14:15');
  const [availableForBooking, setAvailableForBooking] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');

  const filtered = staff.filter(
    (m) => !divisionFilter || m.division === divisionFilter || m.division === 'both'
  );

  const reset = () => {
    setEditingId(null);
    setName('');
    setDesignation('');
    setDivision(divisionFilter || 'spa');
    setExperienceYears(3);
    setBio('');
    setSpecializationsText('');
    setSkillsText('');
    setLanguagesText('Nepali, English, Hindi');
    setWorkingDays(WEEKDAYS);
    setShiftStart('09:30');
    setShiftEnd('20:00');
    setBreakStart('13:30');
    setBreakEnd('14:15');
    setAvailableForBooking(true);
    setAvatarUrl('');
  };

  const toggleDay = (d: string) => {
    setWorkingDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveStaff({
      id: editingId || `staff-${Date.now()}`,
      name: name.trim(),
      designation: designation.trim() || (divisionFilter === 'salon' ? 'Senior Stylist' : 'Spa Therapist'),
      division,
      experienceYears,
      bio: bio.trim() || undefined,
      specializations: specializationsText.split(',').map((s) => s.trim()).filter(Boolean),
      skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      languages: languagesText.split(',').map((s) => s.trim()).filter(Boolean),
      workingDays: workingDays.length > 0 ? workingDays : WEEKDAYS,
      shiftStart,
      shiftEnd,
      breakStart: breakStart || undefined,
      breakEnd: breakEnd || undefined,
      availableForBooking,
      verified: true,
      avatarUrl: avatarUrl.trim() || undefined,
    });
    reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            {editingId
              ? 'Edit Specialist Profile'
              : divisionFilter === 'spa'
              ? 'Add Spa Therapist'
              : divisionFilter === 'salon'
              ? 'Add Salon Professional'
              : 'Add Team Member'}
          </h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Designation"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value as StaffDivision)}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          >
            <option value="spa">Spa Therapist</option>
            <option value="salon">Salon Professional</option>
            <option value="both">Both Spa &amp; Salon</option>
            <option value="management">Management</option>
          </select>
          <input
            type="number"
            min={0}
            max={40}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            placeholder="Years Experience"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            value={specializationsText}
            onChange={(e) => setSpecializationsText(e.target.value)}
            placeholder="Specializations (comma separated)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
          />
          <input
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Skills (comma separated)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
          />
          <input
            value={languagesText}
            onChange={(e) => setLanguagesText(e.target.value)}
            placeholder="Languages"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
          />
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Profile Photo URL (optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-2"
          />
          <div className="grid grid-cols-4 gap-2 sm:col-span-4">
            <div>
              <label className="block text-[10px] text-[#858078]">Shift Start</label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full border border-[#183D35]/20 px-2 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#858078]">Shift End</label>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="w-full border border-[#183D35]/20 px-2 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#858078]">Break Start</label>
              <input
                type="time"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
                className="w-full border border-[#183D35]/20 px-2 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#858078]">Break End</label>
              <input
                type="time"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full border border-[#183D35]/20 px-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <input
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short professional bio"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-4"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#858078]">Working Days:</span>
            {WEEKDAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`border px-2 py-1 text-[11px] ${
                  workingDays.includes(d)
                    ? 'border-[#183D35] bg-[#183D35] text-white'
                    : 'border-[#183D35]/20 text-[#858078]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={availableForBooking}
                onChange={(e) => setAvailableForBooking(e.target.checked)}
              />
              Accepting Bookings
            </label>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#183D35] px-5 py-2 text-xs font-medium text-[#FBF9F5]"
            >
              {editingId ? 'Save Changes' : 'Add Team Member'}
            </button>
          </div>
        </div>
      </form>

      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {filtered.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
            <div>
              <p className="font-medium text-[#183D35]">
                {m.name} · <span className="text-[#858078]">{m.experienceYears} yrs exp</span>
              </p>
              <p className="text-[#858078] capitalize">
                {m.designation} · {m.division} · {m.shiftStart}–{m.shiftEnd} · Days:{' '}
                {m.workingDays.join(', ')}
              </p>
              {m.specializations.length > 0 && (
                <p className="mt-0.5 text-[11px] text-[#252525]/75">
                  {m.specializations.join(' · ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditingId(m.id);
                  setName(m.name);
                  setDesignation(m.designation);
                  setDivision(m.division);
                  setExperienceYears(m.experienceYears);
                  setBio(m.bio || '');
                  setSpecializationsText(m.specializations.join(', '));
                  setSkillsText(m.skills.join(', '));
                  setLanguagesText(m.languages.join(', '));
                  setWorkingDays(m.workingDays);
                  setShiftStart(m.shiftStart);
                  setShiftEnd(m.shiftEnd);
                  setBreakStart(m.breakStart || '');
                  setBreakEnd(m.breakEnd || '');
                  setAvailableForBooking(m.availableForBooking);
                  setAvatarUrl(m.avatarUrl || '');
                }}
                className="border border-[#183D35]/25 px-3 py-1 text-[#183D35] hover:bg-[#F6F0E7]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => saveStaff({ ...m, availableForBooking: !m.availableForBooking })}
                className="border border-[#183D35]/20 px-3 py-1"
              >
                {m.availableForBooking ? 'Active' : 'Paused'}
              </button>
              <button type="button" onClick={() => removeStaff(m.id)} className="text-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminRoomsCrudSection: React.FC = () => {
  const { data: rooms = [] } = useGetRoomsQuery(true);
  const [saveRoom, { isLoading: saving }] = useSaveRoomMutation();
  const [removeRoom] = useRemoveRoomMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState<SpaRoom['roomType']>('single_suite');
  const [capacity, setCapacity] = useState(1);
  const [supportsCouple, setSupportsCouple] = useState(false);
  const [facilitiesText, setFacilitiesText] = useState('Heated Linen Bed, Rain Shower, Ambient Sound');
  const [status, setStatus] = useState<SpaRoom['status']>('available');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setEditingId(null);
    setName('');
    setRoomType('single_suite');
    setCapacity(1);
    setSupportsCouple(false);
    setFacilitiesText('Heated Linen Bed, Rain Shower, Ambient Sound');
    setStatus('available');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveRoom({
      id: editingId || `room-${Date.now()}`,
      name: name.trim(),
      roomType,
      capacity,
      supportsCouple: supportsCouple || roomType === 'couple_suite' || capacity >= 2,
      facilities: facilitiesText.split(',').map((f) => f.trim()).filter(Boolean),
      status,
      verified: true,
      notes: notes.trim() || undefined,
    });
    reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            {editingId ? 'Edit Suite / Facility' : 'Add Treatment Room or Facility'}
          </h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Suite / Facility Name *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <select
            value={roomType}
            onChange={(e) => {
              const next = e.target.value as SpaRoom['roomType'];
              setRoomType(next);
              if (next === 'couple_suite' || next === 'hydro_suite') {
                setSupportsCouple(true);
                setCapacity((c) => Math.max(2, c));
              }
            }}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          >
            <option value="single_suite">Single Suite</option>
            <option value="couple_suite">Couple Suite</option>
            <option value="hydro_suite">Hydrotherapy / Steam / Jacuzzi</option>
            <option value="reflexology_lounge">Reflexology Lounge</option>
            <option value="salon_studio">Salon Studio</option>
            <option value="bridal_suite">Bridal Suite</option>
          </select>
          <input
            type="number"
            min={1}
            max={8}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            placeholder="Capacity"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SpaRoom['status'])}
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          >
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            value={facilitiesText}
            onChange={(e) => setFacilitiesText(e.target.value)}
            placeholder="Facilities & Equipment (comma separated, e.g. Jacuzzi Tub, Steam Cabin)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs sm:col-span-3"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Suite notes (optional)"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={supportsCouple}
              onChange={(e) => setSupportsCouple(e.target.checked)}
            />
            Supports Couples Booking (Capacity ≥ 2)
          </label>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#183D35] px-5 py-2 text-xs font-medium text-[#FBF9F5]"
          >
            {editingId ? 'Save Changes' : 'Add Room & Facilities'}
          </button>
        </div>
      </form>

      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {rooms.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
            <div>
              <p className="font-medium text-[#183D35]">{r.name}</p>
              <p className="text-[#858078]">
                {r.roomType} · Capacity: {r.capacity} · {r.supportsCouple ? 'Couple Ready' : 'Single/Studio'} · Status: <strong>{r.status}</strong>
              </p>
              <p className="mt-0.5 text-[11px] text-[#252525]/80">
                Facilities: {r.facilities.join(' · ') || 'Standard'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditingId(r.id);
                  setName(r.name);
                  setRoomType(r.roomType);
                  setCapacity(r.capacity);
                  setSupportsCouple(r.supportsCouple);
                  setFacilitiesText(r.facilities.join(', '));
                  setStatus(r.status);
                  setNotes(r.notes || '');
                }}
                className="border border-[#183D35]/25 px-3 py-1 text-[#183D35] hover:bg-[#F6F0E7]"
              >
                Edit
              </button>
              <button type="button" onClick={() => removeRoom(r.id)} className="text-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminContentManagementSection: React.FC<{
  mode: 'gallery' | 'social' | 'offers' | 'blog' | 'reviews';
}> = ({ mode }) => {
  const { data: gallery = [] } = useGetGalleryQuery(true);
  const { data: social = [] } = useGetSocialPostsQuery(true);
  const { data: offers = [] } = useGetOffersQuery(true);
  const { data: blogs = [] } = useGetBlogPostsQuery(true);
  const { data: reviews = [] } = useGetReviewsQuery(true);

  const [saveGallery] = useSaveGalleryItemMutation();
  const [removeGallery] = useRemoveGalleryItemMutation();
  const [saveSocial] = useSaveSocialPostMutation();
  const [removeSocial] = useRemoveSocialPostMutation();
  const [saveOffer] = useSaveOfferMutation();
  const [removeOffer] = useRemoveOfferMutation();
  const [saveBlog] = useSaveBlogPostMutation();
  const [removeBlog] = useRemoveBlogPostMutation();
  const [moderateReview] = useModerateReviewMutation();
  const [removeReview] = useRemoveReviewMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [url, setUrl] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [extra, setExtra] = useState('');

  const reset = () => {
    setEditingId(null);
    setTitle('');
    setSub('');
    setUrl('');
    setPromoCode('');
    setExtra('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (mode === 'gallery') {
      const existing = editingId ? gallery.find((g) => g.id === editingId) : undefined;
      await saveGallery({
        ...existing,
        id: editingId || `gal-${Date.now()}`,
        title: title.trim(),
        category: sub.trim() || existing?.category || 'Spa interiors',
        mediaType: existing?.mediaType || 'image',
        imageUrl: url.trim() || undefined,
        caption: extra.trim() || undefined,
        visualKey: existing?.visualKey || 'spa_massage',
        published: existing ? existing.published : true,
      });
    } else if (mode === 'social') {
      const existing = editingId ? social.find((p) => p.id === editingId) : undefined;
      await saveSocial({
        ...existing,
        id: editingId || `soc-${Date.now()}`,
        platform: sub.toLowerCase().includes('insta') ? 'instagram' : 'facebook',
        postType: existing?.postType || 'announcement',
        title: title.trim(),
        caption: extra.trim() || sub.trim() || 'Healing Touch Birgunj update.',
        externalUrl: url.trim() || 'https://www.facebook.com/healingtouchbrj',
        publishedAt: existing?.publishedAt || new Date().toISOString().slice(0, 10),
        published: existing ? existing.published : true,
      });
    } else if (mode === 'offers') {
      const existing = editingId ? offers.find((o) => o.id === editingId) : undefined;
      await saveOffer({
        ...existing,
        id: editingId || `off-${Date.now()}`,
        title: title.trim(),
        festivalTag: sub.trim() || 'Nepal Seasonal',
        description: extra.trim() || 'Special promotion at Healing Touch Spa & Saloon.',
        discountLabel: url.trim() || 'Special Offer',
        promoCode: promoCode.trim() ? promoCode.trim().toUpperCase() : undefined,
        applicableTo: existing?.applicableTo || 'all',
        active: existing ? existing.active : true,
      });
    } else if (mode === 'blog') {
      const existing = editingId ? blogs.find((b) => b.id === editingId) : undefined;
      await saveBlog({
        ...existing,
        id: editingId || `blog-${Date.now()}`,
        slug:
          existing?.slug ||
          title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'),
        title: title.trim(),
        excerpt: sub.trim() || 'Wellness editorial guide.',
        content: extra.trim() || url.trim() || sub.trim() || 'Wellness editorial article.',
        category: existing?.category || 'Wellness',
        author: url.trim() || 'Healing Touch Editorial',
        readMinutes: existing?.readMinutes || 3,
        publishedAt: existing?.publishedAt || new Date().toISOString().slice(0, 10),
        published: existing ? existing.published : true,
      });
    }
    reset();
  };

  if (mode === 'reviews') {
    return (
      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {reviews.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
            <div>
              <p className="font-medium text-[#183D35]">
                {r.authorName} · {r.rating}/5 · <span className="text-[#858078]">{r.serviceUsed}</span>
              </p>
              <p className="text-[#858078]">{r.comment}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => moderateReview({ id: r.id, published: !r.published })}
                className="border border-[#183D35]/20 px-3 py-1.5 font-medium"
              >
                {r.published ? 'Published (Hide)' : 'Pending (Publish)'}
              </button>
              <button
                type="button"
                onClick={() => removeReview(r.id)}
                className="text-red-700 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3 border border-[#183D35]/12 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-medium capitalize text-[#183D35]">
            {editingId ? `Edit ${mode} Entry` : `Add ${mode} Entry`}
          </h3>
          {editingId && (
            <button type="button" onClick={reset} className="text-xs text-[#858078] underline">
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title *"
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
            required
          />
          <input
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            placeholder={
              mode === 'gallery'
                ? 'Category'
                : mode === 'social'
                ? 'Platform (facebook / instagram)'
                : mode === 'offers'
                ? 'Festival Tag'
                : 'Excerpt Summary'
            }
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              mode === 'gallery'
                ? 'Image URL'
                : mode === 'social'
                ? 'Post URL'
                : mode === 'offers'
                ? 'Discount Label (e.g. 15% Off)'
                : 'Author Name'
            }
            className="border border-[#183D35]/20 px-3 py-2 text-xs"
          />
          {mode === 'offers' && (
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo Code (optional)"
              className="border border-[#183D35]/20 px-3 py-2 text-xs font-mono uppercase"
            />
          )}
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder={mode === 'blog' ? 'Full Article Content' : 'Caption / Description'}
            className={`border border-[#183D35]/20 px-3 py-2 text-xs ${
              mode === 'offers' ? 'sm:col-span-3' : 'sm:col-span-4'
            }`}
          />
          <button type="submit" className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]">
            {editingId ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>

      <div className="divide-y divide-[#183D35]/10 border border-[#183D35]/12 bg-white">
        {mode === 'gallery' &&
          gallery.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-4 p-4 text-xs">
              <span>
                <strong className="text-[#183D35]">{g.title}</strong> ({g.category})
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(g.id);
                    setTitle(g.title);
                    setSub(g.category);
                    setUrl(g.imageUrl || '');
                    setExtra(g.caption || '');
                  }}
                  className="text-[#183D35] underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => saveGallery({ ...g, published: !g.published })}
                  className="border border-[#183D35]/20 px-2.5 py-0.5"
                >
                  {g.published ? 'Published' : 'Hidden'}
                </button>
                <button type="button" onClick={() => removeGallery(g.id)} className="text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
        {mode === 'social' &&
          social.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4 text-xs">
              <span>
                <strong className="text-[#183D35]">{p.title}</strong> ({p.platform})
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(p.id);
                    setTitle(p.title);
                    setSub(p.platform);
                    setUrl(p.externalUrl || '');
                    setExtra(p.caption);
                  }}
                  className="text-[#183D35] underline"
                >
                  Edit
                </button>
                <button type="button" onClick={() => removeSocial(p.id)} className="text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
        {mode === 'offers' &&
          offers.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-4 p-4 text-xs">
              <span>
                <strong className="text-[#183D35]">{o.title}</strong> ({o.festivalTag} · {o.discountLabel}
                {o.promoCode ? ` · ${o.promoCode}` : ''})
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(o.id);
                    setTitle(o.title);
                    setSub(o.festivalTag || '');
                    setUrl(o.discountLabel);
                    setPromoCode(o.promoCode || '');
                    setExtra(o.description);
                  }}
                  className="text-[#183D35] underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => saveOffer({ ...o, active: !o.active })}
                  className="border border-[#183D35]/20 px-2.5 py-0.5"
                >
                  {o.active ? 'Active' : 'Paused'}
                </button>
                <button type="button" onClick={() => removeOffer(o.id)} className="text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
        {mode === 'blog' &&
          blogs.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-4 p-4 text-xs">
              <span>
                <strong className="text-[#183D35]">{b.title}</strong> (/blog/{b.slug})
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(b.id);
                    setTitle(b.title);
                    setSub(b.excerpt);
                    setUrl(b.author);
                    setExtra(b.content);
                  }}
                  className="text-[#183D35] underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => saveBlog({ ...b, published: !b.published })}
                  className="border border-[#183D35]/20 px-2.5 py-0.5"
                >
                  {b.published ? 'Published' : 'Draft'}
                </button>
                <button type="button" onClick={() => removeBlog(b.id)} className="text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export const AdminNotificationsSection: React.FC = () => {
  const { data: messages = [] } = useGetContactMessagesQuery();
  const [updateMsgStatus] = useUpdateContactMessageStatusMutation();
  const [removeMsg] = useRemoveContactMessageMutation();

  return (
    <div className="border border-[#183D35]/12 bg-white p-6 space-y-4">
      <h3 className="font-display text-2xl font-medium text-[#183D35]">
        Guest Inquiries &amp; Notification Readiness
      </h3>
      <p className="text-xs text-[#858078]">
        Email &amp; SMS-ready architecture is active via `/api/notifications/compose` alongside direct WhatsApp confirmation links.
      </p>
      {messages.length === 0 ? (
        <p className="text-sm text-[#858078]">No contact form submissions yet.</p>
      ) : (
        <div className="divide-y divide-[#183D35]/10">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-wrap items-start justify-between gap-4 py-4 text-xs">
              <div className="space-y-1 max-w-2xl">
                <p className="font-semibold text-[#183D35]">
                  {m.name} · <span className="font-mono">{m.phone}</span> · {m.subject || 'Inquiry'}
                </p>
                {m.email && <p className="text-[#858078]">{m.email}</p>}
                <p className="text-[#252525]/85">{m.message}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <select
                  value={m.status}
                  onChange={(e) =>
                    updateMsgStatus({ id: m.id, status: e.target.value as ContactMessage['status'] })
                  }
                  className="border border-[#183D35]/20 bg-[#FBF9F5] px-2.5 py-1 text-xs"
                >
                  <option value="new">New</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <a
                  href={`tel:${m.phone.replace(/\s+/g, '')}`}
                  className="border border-[#183D35]/20 px-2.5 py-1 text-[#183D35]"
                >
                  Call
                </a>
                <button
                  type="button"
                  onClick={() => removeMsg(m.id)}
                  className="text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminSettingsSection: React.FC = () => {
  const { data: settings } = useGetBusinessSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateBusinessSettingsMutation();
  const [seedCatalog, { isLoading: seeding }] = useSeedCatalogMutation();
  const [form, setForm] = useState<BusinessSettings | null>(null);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const current = form || settings;
  if (!current) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(current);
    setSavedNotice('Business settings saved to Firestore.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#183D35]/15 bg-[#F6F0E7] p-5">
        <div>
          <p className="font-semibold text-[#183D35] text-sm">
            Database Catalog &amp; Records Sync
          </p>
          <p className="text-xs text-[#858078]">
            Synchronize the complete spa &amp; salon catalog, staff directory, suites, bookings, CRM records, payments, reviews, inquiries, and Nepal holidays to Firestore.
          </p>
        </div>
        <button
          type="button"
          disabled={seeding}
          onClick={async () => {
            await seedCatalog();
            setSavedNotice('All catalog and operational records synced to Firestore.');
          }}
          className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]"
        >
          {seeding ? 'Syncing...' : 'Sync Catalog to Firestore'}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 border border-[#183D35]/12 bg-white p-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Business Name</label>
          <input
            value={current.businessName}
            onChange={(e) => setForm({ ...current, businessName: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Tagline</label>
          <input
            value={current.tagline}
            onChange={(e) => setForm({ ...current, tagline: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Phone</label>
          <input
            value={current.phone}
            onChange={(e) => setForm({ ...current, phone: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">WhatsApp Number</label>
          <input
            value={current.whatsappNumber}
            onChange={(e) => setForm({ ...current, whatsappNumber: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Concierge Email</label>
          <input
            type="email"
            value={current.email}
            onChange={(e) => setForm({ ...current, email: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Address</label>
          <input
            value={current.address}
            onChange={(e) => setForm({ ...current, address: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Opening Hours Label</label>
          <input
            value={current.openingHoursText}
            onChange={(e) => setForm({ ...current, openingHoursText: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#183D35]">Open Time</label>
            <input
              type="time"
              value={current.openTime}
              onChange={(e) => setForm({ ...current, openTime: e.target.value })}
              className="mt-1 w-full border border-[#183D35]/20 px-2 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#183D35]">Close Time</label>
            <input
              type="time"
              value={current.closeTime}
              onChange={(e) => setForm({ ...current, closeTime: e.target.value })}
              className="mt-1 w-full border border-[#183D35]/20 px-2 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#183D35]">Min Spa Age</label>
            <input
              type="number"
              value={current.minimumAgeSpa}
              onChange={(e) => setForm({ ...current, minimumAgeSpa: Number(e.target.value) })}
              className="mt-1 w-full border border-[#183D35]/20 px-2 py-2 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Facebook URL</label>
          <input
            value={current.facebookUrl}
            onChange={(e) => setForm({ ...current, facebookUrl: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183D35]">Instagram URL</label>
          <input
            value={current.instagramUrl}
            onChange={(e) => setForm({ ...current, instagramUrl: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#183D35]">Google Maps URL</label>
          <input
            value={current.googleMapsUrl}
            onChange={(e) => setForm({ ...current, googleMapsUrl: e.target.value })}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#183D35]">Age Policy Text</label>
          <textarea
            value={current.agePolicyText}
            onChange={(e) => setForm({ ...current, agePolicyText: e.target.value })}
            rows={2}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#183D35]">Hygiene &amp; Room Turnover Standards</label>
          <textarea
            value={current.hygieneStandardsText}
            onChange={(e) => setForm({ ...current, hygieneStandardsText: e.target.value })}
            rows={2}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#183D35]">Cancellation Policy</label>
          <textarea
            value={current.cancellationPolicyText}
            onChange={(e) => setForm({ ...current, cancellationPolicyText: e.target.value })}
            rows={2}
            className="mt-1 w-full border border-[#183D35]/20 px-3 py-2 text-xs"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#183D35] px-5 py-2.5 text-xs font-semibold text-[#FBF9F5]"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          {savedNotice && <span className="text-xs text-[#183D35]">{savedNotice}</span>}
        </div>
      </form>
    </div>
  );
};

export const AdminUsersAndRolesSection: React.FC<{ showAudit?: boolean }> = ({ showAudit }) => {
  const { data: admins = [] } = useGetAdminUsersQuery();
  const { data: logs = [] } = useGetAuditLogsQuery();
  const [saveAdmin] = useSaveAdminUserMutation();
  const [removeAdmin] = useRemoveAdminUserMutation();

  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('manager');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim() || !email.trim()) return;
    await saveAdmin({
      uid: uid.trim(),
      email: email.trim(),
      role,
      active: true,
      createdAt: new Date().toISOString(),
    });
    setUid('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {!showAudit ? (
        <>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 border border-[#183D35]/12 bg-white p-5 sm:grid-cols-4">
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Firebase User UID"
              className="border border-[#183D35]/20 px-3 py-2 text-xs"
              required
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Staff Email"
              className="border border-[#183D35]/20 px-3 py-2 text-xs"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="border border-[#183D35]/20 px-3 py-2 text-xs"
            >
              <option value="super_admin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="therapist">Therapist</option>
              <option value="stylist">Stylist</option>
            </select>
            <button type="submit" className="bg-[#183D35] px-4 py-2 text-xs font-medium text-[#FBF9F5]">
              Grant Role
            </button>
          </form>

          <div className="border border-[#183D35]/12 bg-white p-5 space-y-3 text-xs">
            <p className="font-semibold text-[#183D35]">Bootstrapped Owner: alamayub000@gmail.com (super_admin)</p>
            {admins.map((a) => (
              <div key={a.uid} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#183D35]/10 pt-3">
                <div>
                  <p className="font-medium text-[#183D35]">{a.email}</p>
                  <p className="font-mono text-[10px] text-[#858078]">{a.uid}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <select
                    value={a.role}
                    onChange={(e) => saveAdmin({ ...a, role: e.target.value as UserRole })}
                    className="border border-[#183D35]/20 px-2 py-1 text-xs"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="therapist">Therapist</option>
                    <option value="stylist">Stylist</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => saveAdmin({ ...a, active: !a.active })}
                    className="border border-[#183D35]/20 px-2.5 py-1"
                  >
                    {a.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAdmin(a.uid)}
                    className="text-red-700 hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="border border-[#183D35]/12 bg-white p-6 space-y-4">
          <h3 className="font-display text-2xl font-medium text-[#183D35]">
            Role Matrix &amp; Audit Trail
          </h3>
          <div className="divide-y divide-[#183D35]/10 text-xs">
            {logs.length === 0 ? (
              <p className="py-4 text-[#858078]">Administrative actions will appear here.</p>
            ) : (
              logs.slice(0, 30).map((log) => (
                <div key={log.id} className="py-2.5 flex justify-between gap-4">
                  <span>
                    <strong className="text-[#183D35]">{log.action}</strong> — {log.summary}
                  </span>
                  <span className="font-mono text-[#858078] shrink-0">
                    {log.createdAt.slice(0, 16)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
