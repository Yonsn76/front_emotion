import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface EmotionData {
  enojo: number
  tristeza: number
  asco: number
  miedo: number
  felicidad: number
  sorpresa: number
  neutral: number
  total_detections?: number
  last_update?: string
  active_session?: string
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
    enojo: 0,
    tristeza: 0,
    asco: 0,
    miedo: 0,
    felicidad: 0,
    sorpresa: 0,
    neutral: 0,
    total_detections: 0,
    last_update: '',
    active_session: ''
  })
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    checkCameraStatus()
    
    // Verificar estado de cámara cada 2 segundos
    const cameraInterval = setInterval(checkCameraStatus, 2000)
    
    // Actualizar datos emocionales cada 10 segundos (modo prueba)
    const dataInterval = setInterval(loadDashboardData, 10000)
    
    return () => {
      clearInterval(cameraInterval)
      clearInterval(dataInterval)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Obtener datos reales de la API con el nuevo sistema de agregación
      const response = await fetch('http://127.0.0.1:8000/api/emotion/current-stats')
        if (response.ok) {
          const data = await response.json()
          setEmotionData({
            enojo: data.enojo || 0,
            tristeza: data.tristeza || 0,
            asco: data.asco || 0,
            miedo: data.miedo || 0,
            felicidad: data.felicidad || 0,
            sorpresa: data.sorpresa || 0,
            neutral: data.neutral || 0,
            total_detections: data.total_detections || 0,
            last_update: data.last_update || '',
            active_session: data.active_session || ''
          })
        } else {
        // Si no hay datos, inicializar en 0
        setEmotionData({
          enojo: 0,
          tristeza: 0,
          asco: 0,
          miedo: 0,
          felicidad: 0,
          sorpresa: 0,
          neutral: 0,
          total_detections: 0,
          last_update: '',
          active_session: ''
        })
      }
    } catch (err) {
      setError('Error cargando datos del dashboard')
      // Inicializar en 0 si hay error
      setEmotionData({
        enojo: 0,
        tristeza: 0,
        asco: 0,
        miedo: 0,
        felicidad: 0,
        sorpresa: 0,
        neutral: 0,
        total_detections: 0,
        last_update: '',
        active_session: ''
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

  // Removed totalEmotions calculation as we now use percentage-based system

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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribución Emocional (Modo Prueba - 30 seg)
                </h3>
                <div className="text-sm text-gray-500">
                  {emotionData.last_update && (
                    <span>Última actualización: {new Date(emotionData.last_update).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
              
            <div className="space-y-4">
              {Object.entries(emotionData).filter(([key]) =>
                ['enojo', 'tristeza', 'asco', 'miedo', 'felicidad', 'sorpresa', 'neutral'].includes(key)
              ).map(([emotion, value]) => {
                  const percentage = typeof value === 'number' ? value : 0
                  const colors = {
                    enojo: 'bg-red-500',
                    tristeza: 'bg-blue-400',
                    asco: 'bg-green-500',
                    miedo: 'bg-purple-500',
                    felicidad: 'bg-yellow-400',
                    sorpresa: 'bg-orange-500',
                    neutral: 'bg-gray-500'
                  }
                  
                  return (
                    <div key={emotion} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-600 capitalize">
                        {emotion.replace('_', ' ')}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${colors[emotion as keyof typeof colors]}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Detecciones en ventana:</span> {emotionData.total_detections || 0}
                </div>
                <div className="text-xs text-gray-500">
                  Modo prueba: agregación cada 30 segundos
                </div>
              </div>
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
                  {emotionData.total_detections || 0}
                </div>
                <div className="text-sm text-gray-600">Detecciones (30s)</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {cameraActive ? 'ON' : 'OFF'}
                </div>
                <div className="text-sm text-gray-600">Estado Cámara</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {emotionData.enojo > 30 || emotionData.tristeza > 20 ? 1 : 0}
                </div>
                <div className="text-sm text-gray-600">Alertas</div>
              </div>
            </div>
          </div>

          {/* Columna lateral - Información del sistema */}
          <div className="space-y-6">
            {/* Información del sistema de agregación */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📊 Sistema de Análisis
              </h3>
              
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">⏱️ Frecuencia:</span>
                  <span>Modo prueba: cada 30 segundos</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="font-medium">📈 Métricas:</span>
                  <span>Promedios de emociones por ventana</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="font-medium">🎯 Precisión:</span>
                  <span>Optimizado para análisis educativo</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="font-medium">💾 Eficiencia:</span>
                  <span>Menos datos, mejor rendimiento</span>
                </div>
              </div>
              
              {emotionData.active_session && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <div className="text-xs text-blue-600">
                    <strong>Sesión activa:</strong> {emotionData.active_session}
                  </div>
                </div>
              )}
            </div>

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
