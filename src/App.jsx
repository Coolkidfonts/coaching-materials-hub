import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import Auth from './components/Auth'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'

function App() {
  const [session, setSession] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchFiles()
    }
  }, [session])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <main className="container mx-auto px-4 py-8">
        {!session ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Coaching Materials Hub
              </h1>
              <p className="text-gray-600">
                Share and discover coaching materials with the community
              </p>
            </div>
            <Auth />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                Upload your coaching materials or browse what others have shared
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FileUpload onUpload={fetchFiles} />
              </div>
              <div className="lg:col-span-2">
                <FileList files={files} loading={loading} onDelete={fetchFiles} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
