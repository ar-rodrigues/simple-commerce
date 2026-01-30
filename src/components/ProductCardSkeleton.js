'use client'
import { Card, Skeleton } from 'antd';

export default function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col shadow-md">
      <div className="w-full h-56 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
      <Card.Meta
        title={<Skeleton.Input active size="small" style={{ width: '80%' }} />}
        description={
          <div className="flex flex-col gap-2 mt-2">
            <Skeleton paragraph={{ rows: 2, width: ['100%', '80%'] }} active />
            <Skeleton.Input active size="small" style={{ width: '40%' }} />
          </div>
        }
      />
    </Card>
  );
}
