import AlertView from '@/components/views/AlertView';

export const metadata = {
  title: 'Pusat Notifikasi Alert | Pegadaian RFID System',
  description: 'Daftar peringatan deteksi hardware RFID, selisih fisik barang, dan status anomali vault',
};

export default function AlertPage() {
  return <AlertView />;
}
