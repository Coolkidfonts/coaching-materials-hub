import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, Video, Image, Download, Trash2, Calendar, User } from 'lucide-react'

export default function FileList({ files, loading, onDelete }) {
  const [deleting, setDeleting] = useState(null)

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType.includes('video')) return <Video className="w-5 h-5 text-blue-500" />
    if (fileType.includes('image')) return <Image className="w-5 h-5 text-green-500" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error.message)
    }
  }

  const handleDelete = async (fileId, filePath) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    setDeleting(fileId)
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      onDelete()
    } catch (error) {
      console.error('Error deleting file:', error.message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials Library</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Materials Library ({files.length})
      </h3>
      
      {files.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No materials uploaded yet.</p>
          <p className="text-sm text-gray-400">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(file.file_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {file.title}
                  </h4>
                  
                  {file.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{file.uploaded_by}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                    <span>{formatFileSize(file.file_size)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(file.id, file.file_path)}
                    disabled={deleting === file.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
