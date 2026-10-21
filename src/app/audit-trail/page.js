import AuditTrailView from '@/components/views/AuditTrailView';

export const metadata = {
  title: 'Audit Trail & Log Kepatuhan | Pegadaian RFID System',
  description: 'Rekam jejak kepatuhan, mutasi operasional, dan log pemindaian RFID vault',
};

export default function AuditTrailPage() {
  return <AuditTrailView />;
}
