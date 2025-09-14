import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, FileText, Video, Image, X } from 'lucide-react'

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setMessage('File size must be less than 50MB')
        return
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage('File type not supported. Please upload PDF, video, image, or document files.')
        return
      }
      
      setFile(selectedFile)
      setMessage('')
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />
    if (fileType.includes('video')) return <Video className="w-6 h-6 text-blue-500" />
    if (fileType.includes('image')) return <Image className="w-6 h-6 text-green-500" />
    return <FileText className="w-6 h-6 text-gray-500" />
  }

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!file || !title.trim()) {
      setMessage('Please select a file and enter a title')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      // Save file info to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          title: title.trim(),
          description: description.trim(),
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user.id
        })

      if (dbError) throw dbError

      // Reset form
      setFile(null)
      setTitle('')
      setDescription('')
      setMessage('File uploaded successfully!')
      
      // Refresh file list
      onUpload()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Material</h3>
      
      <form onSubmit={uploadFile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Video, Image, or Document (max 50MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Describe what this material is about..."
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file || !title.trim()}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Material'}
        </button>
      </form>
    </div>
  )
}
