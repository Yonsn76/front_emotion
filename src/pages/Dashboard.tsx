import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface EmotionData {
  frustracion: number
  tristeza: number
  enojo: number
  desmotivacion: number
  atencion_baja: number
}

interface Session {
  id: string
  class_name: string
  subject: string
  status: string
  start_time: string
}

const Dashboard: React.FC = () => {
  const [emotionData, setEmotionData] = useState<EmotionData>({
    frustracion: 0,
    tristeza: 0,
    enojo: 0,
    desmotivacion: 0,
    atencion_baja: 0
  })
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    checkCameraStatus()
    
    // Verificar estado de cámara cada 2 segundos
    const interval = setInterval(checkCameraStatus, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Obtener datos reales de la API
      const response = await fetch('http://127.0.0.1:8000/api/emotion/current-stats')
      if (response.ok) {
        const data = await response.json()
        setEmotionData(data)
      } else {
        // Si no hay datos, inicializar en 0
        setEmotionData({
          frustracion: 0,
          tristeza: 0,
          enojo: 0,
          desmotivacion: 0,
          atencion_baja: 0
        })
      }
    } catch (err) {
      setError('Error cargando datos del dashboard')
      // Inicializar en 0 si hay error
      setEmotionData({
        frustracion: 0,
        tristeza: 0,
        enojo: 0,
        desmotivacion: 0,
        atencion_baja: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:8000/api/emotion/start-camera', {
        method: 'POST'
      })
      
      if (response.ok) {
        setCameraActive(true)
      } else {
        setError('No se pudo iniciar la cámara')
      }
    } catch (err) {
      setError('Error conectando con la cámara')
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:8000/api/emotion/stop-camera', {
        method: 'POST'
      })
      
      if (response.ok) {
        setCameraActive(false)
        // Forzar actualización del componente
        setTimeout(() => {
          setCameraActive(false)
        }, 100)
      } else {
        setError('No se pudo detener la cámara')
      }
    } catch (err) {
      setError('Error conectando con la cámara')
    } finally {
      setLoading(false)
    }
  }

  const checkCameraStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/emotion/camera-status')
      if (response.ok) {
        const data = await response.json()
        setCameraActive(data.active)
      }
    } catch (err) {
      console.error('Error verificando estado de cámara:', err)
    }
  }

  const startNewSession = async () => {
    try {
      const sessionData = {
        teacher_id: 'current_user',
        class_name: 'Clase Demo',
        subject: 'Matemáticas',
        notes: 'Sesión de prueba del sistema'
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/emotion/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentSession({
          id: data.session_id,
          class_name: sessionData.class_name,
          subject: sessionData.subject,
          status: data.status,
          start_time: new Date().toISOString()
        })
        setError(null)
      } else {
        setError('Error creando sesión')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const endCurrentSession = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:8000/api/emotion/end-session', {
        method: 'POST'
      })
      
      if (response.ok) {
        setCurrentSession(null)
        setError(null)
      } else {
        setError('Error terminando sesión')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const totalEmotions = Object.values(emotionData).reduce((sum, value) => sum + value, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Monitoreo en tiempo real - {currentSession?.class_name || 'Sin sesión activa'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Sistema Activo</span>
              </div>
              
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>🔄</span>
                )}
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Controles de sesión */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Control de Sesión</h2>
            
            {currentSession ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sesión activa:</p>
                  <p className="font-medium">{currentSession.class_name} - {currentSession.subject}</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Finalizar Sesión
                </button>
              </div>
            ) : currentSession ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Sesión:</strong> {currentSession.class_name} - {currentSession.subject}</p>
                  <p><strong>Iniciada:</strong> {new Date(currentSession.start_time).toLocaleTimeString()}</p>
                </div>
                <button 
                  onClick={endCurrentSession}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Terminar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">No hay sesión activa</p>
                  <p className="text-sm text-gray-500">Inicia una nueva sesión para comenzar el monitoreo</p>
                </div>
                <button 
                  onClick={startNewSession}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Stream */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cámara de Monitoreo</h2>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden relative">
              {cameraActive ? (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <img
                    src={`http://127.0.0.1:8000/api/emotion/video-stream?t=${Date.now()}`}
                    alt="Video Stream"
                    className="w-full h-auto"
                    onError={() => setError('Error cargando video stream')}
                    key={cameraActive ? 'active' : 'inactive'}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📹</div>
                    <p className="text-lg font-medium">Cámara no iniciada</p>
                    <p className="text-sm text-gray-400">Haz clic en "Iniciar Cámara" para comenzar</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={startCamera}
                disabled={cameraActive || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>📹</span>
                )}
                {loading ? 'Iniciando...' : 'Iniciar Cámara'}
              </button>
              
              <button
                onClick={stopCamera}
                disabled={!cameraActive}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>⏹️</span>
                Detener Cámara
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Métricas */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gráfico de emociones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Distribución Emocional Actual
              </h3>
              
              <div className="space-y-4">
                {Object.entries(emotionData).map(([emotion, value]) => {
                  const percentage = totalEmotions > 0 ? (value / totalEmotions) * 100 : 0
                  const colors = {
                    frustracion: 'bg-orange-500',
                    tristeza: 'bg-blue-400',
                    enojo: 'bg-red-500',
                    desmotivacion: 'bg-yellow-500',
                    atencion_baja: 'bg-purple-400'
                  }
                  
                  return (
                    <div key={emotion} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-600 capitalize">
                        {emotion.replace('_', ' ')}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${colors[emotion as keyof typeof colors]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {value} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {totalEmotions > 0 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Total: {totalEmotions} detecciones
                </div>
              )}
            </div>

            {/* Métricas generales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {currentSession ? 1 : 0}
                </div>
                <div className="text-sm text-gray-600">Sesiones Activas</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {totalEmotions}
                </div>
                <div className="text-sm text-gray-600">Detecciones</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {cameraActive ? '85%' : '0%'}
                </div>
                <div className="text-sm text-gray-600">Atención Promedio</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {totalEmotions > 50 ? 1 : 0}
                </div>
                <div className="text-sm text-gray-600">Alertas Críticas</div>
              </div>
            </div>
          </div>

          {/* Columna lateral - Enlaces rápidos */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Enlaces Rápidos
              </h3>
              
              <div className="space-y-2">
                <Link
                  to="/sessions"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  📊 Ver Todas las Sesiones
                </Link>
                <Link
                  to="/reports"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  📄 Generar Reportes
                </Link>
                <Link
                  to="/settings"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  ⚙️ Configuración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
