import { TestsView } from '@/components/tests/TestsView';
import { redirect } from 'next/navigation';

export default function TestsPage({ params }: { params: { page: string } }) {
  const pageNumber = Number(params.page);

  if (isNaN(pageNumber) || pageNumber < 1) {
    redirect('/tests');
  }

  return <TestsView page={pageNumber} />;
}
