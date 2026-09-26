import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import { ProductCategory, ResourceListing } from '../types';
import { X, Upload, Plus, Layers, Image as ImageIcon } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resource: ResourceListing) => void;
}

const PRESET_IMAGES = [
  { label: 'Gold Chiavari Chairs', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CYgaAYUcrbyc-vkPRsiYs5T07TJdKC9lxt9yn-Al_0n_QKc7AHTu3yJY_AmGtHBqqFS_SwYT-4-3kRrQiqw5a3kCgK_FkGEmnvkEYMkdmXdGnt_u5nqo7h5E0orvNf_cf5UjvWbcXj875zygXY9Jh00PElHjCK7Ethf-jfHD8IspZqMKqSLt9ffFujGUz8BBCkdwFtwMb8ZJic20XEsy5llWci7v5NLEOgsU0ONyAZBBlovyXEZJGw' },
  { label: 'Round Banquet Tables', url: '/src/assets/images/banquet_round_tables_1790318100806.jpg' },
  { label: 'Charcoal Chairs', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw1qjlVFPL56yn1pDS3hCHOEoWD0U8W9SYblqQaYm6ruRxwfjfg46iSWXLbxV3Q4_x6eJ43HA2LD9yGq587EMr8Lze2FDkZsob8cV5atT1TFMX9Ejip8MjFeDZa6PbD1AgLR_nGLwnmta2HpUxfeVDErWEmt2i7hAH2-Y8_MurkiHCodhvvnqTNhbvsekyh7GSui6LysgvquvLXF75RUIQlf3tE2zoIrsv1_Yi81QLwiAO5PUlN-gIbA' },
  { label: 'Commercial Combi Oven', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Bvt9xEHhMXh4Eav2DhHntp_Q7v17rSTrUTH5wSyHOrwQwYNtnmfa0pGMODcgsMUSmu8Zmtvb0G7T4tnx1RsHfDdCeAJ911f4Z_LcYRphBEbOBaHvf7jmO5x1ASSZKRL9QDNRHl9G6pMaMzZX4Imn4EQgmIxnu4hi7RfHqkkdMafoE0X1uyjP1mo8qoTr9s9LImI_qftU4aHMxsKP-ONaIhSZHp03D7blHDSaboqJrmyu6MZY96h59Q' },
  { label: 'Catering Delivery Van', url: '/src/assets/images/catering_delivery_van_1790318085967.jpg' },
  { label: 'Laser Projector', url: '/src/assets/images/conference_laser_projector_1790318116337.jpg' },
  { label: 'Executive Boardroom', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3N9_laYm7rHAqlHmqd-cjnuI0gzE8j1JAE4vRl9RV34TRN9eLhsX3oNThZNtcCOzb6W3OvpeYBrPFXl_2pvkGMDQ28JINIEqcVOA_v_dfQtcGPVq1NHEKMBTAbc7VV7GmmLePX52QgL9FCu2hdKJ6kyeJxZU-ZFu_1zKjv1pVhlYe-BYeDh24_05KlJl3nQH13I6-Bzxz8AYav2DOHQPt_4h9vlIOmZXCm5a5Q55BKI657FdBxFnQCQ' },
];

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Chairs & Seating');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [quantityTotal, setQuantityTotal] = useState(150);
  const [pricePerUnitPerDay, setPricePerUnitPerDay] = useState(120);
  const [depositPercent, setDepositPercent] = useState(15);
  const [location, setLocation] = useState(currentUser?.location || 'Vashi, Navi Mumbai');
  const [availabilityStartDate, setAvailabilityStartDate] = useState('2026-10-01');
  const [availabilityEndDate, setAvailabilityEndDate] = useState('2026-12-31');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [flatDeliveryFee, setFlatDeliveryFee] = useState(1800);
  const [packagingNotes, setPackagingNotes] = useState('Packed in protective padded transport covers.');
  const [loadingDockRequirements, setLoadingDockRequirements] = useState('Standard loading bay accessible.');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newResource: ResourceListing = {
      id: `res-${Date.now()}`,
      providerId: currentUser?.id || 'biz-grand-horizon',
      providerName: currentUser?.name || 'Grand Horizon Hotel',
      providerLocation: currentUser?.location || location,
      providerRating: currentUser?.rating || 4.9,
      providerReviewsCount: currentUser?.reviewsCount || 20,
      name,
      category,
      description,
      imageUrl,
      galleryUrls: [imageUrl],
      quantityTotal,
      pricePerUnitPerDay,
      depositPercent,
      location,
      distanceKm: 2.5,
      availabilityStartDate,
      availabilityEndDate,
      deliveryOptions: {
        pickupAvailable,
        deliveryAvailable,
        maxDistanceKm,
        flatDeliveryFee,
      },
      specifications: [
        'Commercial grade hospitality standard',
        'Inspected and disinfected prior to handover',
        'Supplied with protective transport padding',
      ],
      packagingNotes,
      loadingDockRequirements,
      qualityInspected: true,
      minRentalDays: 1,
      createdAt: new Date().toISOString(),
    };

    await db.saveResource(newResource);
    onSuccess(newResource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E6DF] relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64748B] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">List Idle Hospitality Resource</h2>
            <p className="text-xs text-[#64748B]">
              Publish equipment or space to verified hospitality peers in Navi Mumbai
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Resource Title / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 150x Gold Chiavari Banquet Chairs with Cushions"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-sm text-[#1E293B] focus:border-[#0F766E] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:outline-none"
              >
                <option value="Chairs & Seating">Chairs & Seating</option>
                <option value="Tables & Dining">Tables & Dining</option>
                <option value="Commercial Kitchen">Commercial Kitchen</option>
                <option value="AV & Staging">AV & Staging</option>
                <option value="Vehicles & Transport">Vehicles & Transport</option>
                <option value="Event Spaces">Event Spaces</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Storage / Dispatch Location
              </label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:outline-none"
              >
                <option value="Vashi, Navi Mumbai">Vashi, Navi Mumbai</option>
                <option value="CBD Belapur, Navi Mumbai">CBD Belapur, Navi Mumbai</option>
                <option value="Kharghar, Navi Mumbai">Kharghar, Navi Mumbai</option>
                <option value="Panvel, Navi Mumbai">Panvel, Navi Mumbai</option>
                <option value="Seawoods, Navi Mumbai">Seawoods, Navi Mumbai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Select or Provide Photo
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    imageUrl === img.url ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20' : 'border-[#E8E6DF] opacity-70'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste external image URL"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full mt-2 px-3 py-1.5 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Description & Operational Notes
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe materials, condition, specifications, and suggested event uses..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Total Available Units
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantityTotal}
                onChange={e => setQuantityTotal(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs font-bold text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Daily Rate (₹ / unit / day)
              </label>
              <input
                type="number"
                min="1"
                required
                value={pricePerUnitPerDay}
                onChange={e => setPricePerUnitPerDay(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs font-bold text-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Refundable Deposit (%)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                required
                value={depositPercent}
                onChange={e => setDepositPercent(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs font-bold text-[#1E293B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Available From
              </label>
              <input
                type="date"
                required
                value={availabilityStartDate}
                onChange={e => setAvailabilityStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Available Until
              </label>
              <input
                type="date"
                required
                value={availabilityEndDate}
                onChange={e => setAvailabilityEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl text-xs text-[#1E293B]"
              />
            </div>
          </div>

          {/* Delivery Options */}
          <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] space-y-3">
            <h4 className="text-xs font-bold text-[#1E293B]">Delivery & Dispatch Capabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs text-[#1E293B]">
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={e => setDeliveryAvailable(e.target.checked)}
                  className="rounded text-[#0F766E] accent-[#0F766E]"
                />
                <span>Supports Porter dock dispatch</span>
              </label>

              {deliveryAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Flat Fee:</span>
                  <input
                    type="number"
                    value={flatDeliveryFee}
                    onChange={e => setFlatDeliveryFee(parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-white border border-[#E8E6DF] rounded-lg text-xs font-bold text-[#0F766E]"
                  />
                  <span className="text-xs text-[#64748B]">₹</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0F766E] hover:bg-[#0b5751] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer mt-4"
          >
            Publish to VenueX Marketplace
          </button>
        </form>

      </div>
    </div>
  );
};
