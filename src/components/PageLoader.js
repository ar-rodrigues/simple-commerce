'use client'
import { Layout } from 'antd';
import Loading from './Loading';

export default function PageLoader({ message = 'Cargando página...' }) {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Loading 
        message={message} 
        size="large" 
        fullHeight 
        className="min-h-screen"
      />
    </Layout>
  );
}
