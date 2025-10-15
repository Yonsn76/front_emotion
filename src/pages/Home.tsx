import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  database_connected: boolean
  models_loaded: boolean
  active_sessions: number
}

const Home: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/emotion/health')
      if (response.ok) {
        const data = await response.json()
        setHealthStatus(data)
      } else {
        setError('No se pudo conectar con el sistema')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-red-600 bg-red-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Sistema Operativo'
      case 'degraded':
        return 'Funcionamiento Limitado'
      default:
        return 'Sistema No Disponible'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Header */}
      <div className="py-12 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">
            Sistema de Análisis Emocional
          </h1>
          
          <h2 className="text-xl mb-6 opacity-90">
            I.E. N.° 32004 San Pedro
          </h2>
          
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Optimice el aprendizaje de sus estudiantes mediante el monitoreo inteligente 
            de emociones y la generación de insights pedagógicos en tiempo real.
          </p>
        </div>
      </div>

      {/* Status del Sistema */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Estado del Sistema
            </h3>
            {loading && (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : healthStatus ? (
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.status)}`}>
                {getStatusText(healthStatus.status)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                healthStatus.database_connected ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                Base de Datos: {healthStatus.database_connected ? 'Conectada' : 'Desconectada'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                healthStatus.models_loaded ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                Modelos IA: {healthStatus.models_loaded ? 'Cargados' : 'No Cargados'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100">
                Sesiones Activas: {healthStatus.active_sessions}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Características */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <h2 className="text-4xl font-bold text-center text-white mb-8">
          Características Principales
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Análisis Emocional en Tiempo Real
              </h3>
              <p className="text-gray-600">
                Detecta automáticamente emociones como frustración, tristeza, enojo y desmotivación durante las clases.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Métricas y Reportes
              </h3>
              <p className="text-gray-600">
                Genera reportes detallados y análisis de tendencias para mejorar la experiencia educativa.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Privacidad Garantizada
              </h3>
              <p className="text-gray-600">
                Sistema completamente anonimizado que protege la privacidad de los estudiantes.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Alertas Inteligentes
              </h3>
              <p className="text-gray-600">
                Recibe notificaciones automáticas cuando se detectan situaciones que requieren atención.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Acceda al dashboard para iniciar el monitoreo emocional de sus clases
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/dashboard"
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              📊 Ir al Dashboard
            </Link>
            
            <Link
              to="/sessions"
              className="border-2 border-white hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              📋 Ver Sesiones
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-white opacity-80">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm">
            © 2024 I.E. N.° 32004 San Pedro - Sistema de Análisis Emocional
          </p>
          <p className="text-xs mt-1">
            Desarrollado con tecnología de Inteligencia Artificial e IoT
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
