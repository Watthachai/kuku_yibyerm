import { Suspense } from 'react';
import { getMyRequests } from '@/lib/actions/request.actions';
import { RequestCard } from '@/features/mobile/components/requests/request-card';
import { RequestTabs } from '@/features/mobile/components/requests/request-tabs';

interface Props {
  searchParams: {
    status?: string;
    page?: string;
  };
}

export default async function RequestsPage({ searchParams }: Props) {
  const status = searchParams.status;
  const page = parseInt(searchParams.page || '1');

  const requestsData = await getMyRequests({
    status,
    page,
    limit: 10,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">คำขอเบิกของฉัน</h1>
        <p className="text-sm text-gray-600">ติดตามสถานะคำขอเบิกครุภัณฑ์</p>
      </div>

      {/* Tabs */}
      <Suspense fallback={<div>Loading tabs...</div>}>
        <RequestTabs activeStatus={status} />
      </Suspense>

      {/* Requests List */}
      <div className="p-4 space-y-4">
        {requestsData.requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">ไม่มีคำขอเบิก</p>
          </div>
        ) : (
          requestsData.requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </div>
    </div>
  );
}