import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GenericSummary } from '@/types/generic';
import { FlaskConical } from 'lucide-react';

const TYPE_SHORT: Record<string, string> = {
  Herbal: 'Herb', Homeopathic: 'Homeo', Ayurvedic: 'Ayur',
  Unani: 'Unani', Veterinary: 'Vet', Supplement: 'Suppl',
  Device: 'Dev', PersonalCare: 'Care', Vaccine: 'Vacc',
};
const TYPE_COLORS: Record<string, string> = {
  Herbal: 'bg-emerald-500', Homeopathic: 'bg-violet-500', Ayurvedic: 'bg-amber-500',
  Unani: 'bg-rose-500', Veterinary: 'bg-blue-500', Supplement: 'bg-orange-500',
  Device: 'bg-gray-500', PersonalCare: 'bg-pink-500', Vaccine: 'bg-cyan-500',
};

export default function GenericCard({ generic }: { generic: GenericSummary }) {
  const router = useRouter();
  const classShort = generic.therapeuticClass ? generic.therapeuticClass.split(' ')[0] : 'API';
  const detailHref = `/generics/${generic.slug || generic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

  return (
    <div className="block group">
      <div className="relative h-full transition-all duration-300 hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.12),0_4px_10px_-4px_rgba(0,150,136,0.15)] overflow-hidden bg-white border border-gray-200 hover:border-teal-300 hover:-translate-y-0.5 rounded-xl before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r before:bg-teal-500 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100 group-hover:before:inset-y-3">
        <div className="p-4 flex flex-col h-full">
          {/* Top: Icon + Name + Actions */}
          <div className="flex items-start gap-3.5">
            <div className="flex flex-col items-center gap-1 shrink-0 w-14">
              <Link href={detailHref}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-600 shadow-sm hover:shadow-md hover:from-teal-200 hover:to-teal-300 hover:text-teal-700 hover:scale-105 transition-all duration-300">
                  <FlaskConical className="w-5 h-5" />
                </div>
              </Link>
              <span title={generic.therapeuticClass || ''} className="text-[9px] font-bold text-teal-600 uppercase tracking-wider text-center leading-tight truncate w-full">
                {classShort}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-start gap-2">
                <Link href={detailHref}>
                  <h3 title={generic.name} className="font-bold text-gray-800 hover:text-teal-700 transition-colors text-[15px] leading-snug truncate cursor-pointer">
                    {generic.name}
                  </h3>
                </Link>
                {generic.hasMedicalInfo && (
                  <span className="shrink-0 text-teal-600" title="Medical info verified">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {generic.medicineType && generic.medicineType !== 'Allopathic' && (
                  <span className={`shrink-0 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full ${TYPE_COLORS[generic.medicineType] || 'bg-gray-400'}`}>
                    {TYPE_SHORT[generic.medicineType] || generic.medicineType}
                  </span>
                )}
                {generic.brandCount > 0 && (
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                    {generic.brandCount} brand{generic.brandCount !== 1 ? 's' : ''}
                  </span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); router.push(`/drugs?generic=${encodeURIComponent(generic.name)}`); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); router.push(`/drugs?generic=${encodeURIComponent(generic.name)}`); } }}
                  className="text-[10px] font-bold text-white bg-teal-500 px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-teal-600 hover:scale-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ease-out select-none"
                >
                  View Brands
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
