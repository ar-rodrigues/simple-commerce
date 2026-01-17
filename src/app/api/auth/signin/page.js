'use client'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button, Typography, Card } from 'antd'
import { RiLoginBoxLine, RiShieldCheckLine } from 'react-icons/ri'

const { Title, Text } = Typography

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const handleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card
          className="max-w-md w-full shadow-2xl border-0"
          style={{
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          <div className="text-center py-8 px-6">
            {/* Icon Container */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <RiShieldCheckLine className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <Title level={2} className="mb-3 text-gray-800 font-bold">
              Acceso al Panel de Administración
            </Title>

            {/* Description */}
            <Text className="text-gray-600 text-base mb-8 block">
              Inicia sesión con tu cuenta de Google para acceder al panel de administración
            </Text>

            {/* Sign In Button */}
            <Button
              type="primary"
              size="large"
              icon={<RiLoginBoxLine className="text-xl" />}
              onClick={handleSignIn}
              className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: '#16a34a',
                borderColor: '#16a34a',
                color: '#ffffff',
                borderRadius: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d'
                e.currentTarget.style.borderColor = '#15803d'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a'
                e.currentTarget.style.borderColor = '#16a34a'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Iniciar Sesión con Google
            </Button>

            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <RiShieldCheckLine className="text-green-600" />
                <Text type="secondary" className="text-xs">
                  Acceso seguro y protegido
                </Text>
              </div>
            </div>
          </div>
        </Card>
    </div>
  )
}
