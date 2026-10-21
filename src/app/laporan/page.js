import ReportsView from '@/components/views/ReportsView';

export const metadata = {
  title: 'Laporan & Berita Acara | Pegadaian RFID System',
  description: 'Rekapitulasi Stock Opname, arsip Berita Acara Selisih, dan cetak dokumen resmi',
};

export default function LaporanPage() {
  return <ReportsView />;
}
