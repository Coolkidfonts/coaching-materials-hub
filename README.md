# Coaching Materials Hub

A modern web application for sharing and discovering coaching materials including PDFs, videos, and documents. Built with React, Supabase, and Tailwind CSS.

## Features

- 🔐 **User Authentication** - Sign up and sign in with email/password
- 📁 **File Upload** - Upload PDFs, videos, images, and documents (max 50MB)
- 👀 **File Viewing** - Browse and download materials shared by the community
- 🗑️ **File Management** - Delete your own uploaded files
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean and intuitive interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify (recommended)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note down your project URL and anon key from Settings > API

### 2. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view files" ON files
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own files" ON files
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true);

-- Create storage policies
CREATE POLICY "Anyone can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Supabase

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Update Supabase Configuration

Edit `src/lib/supabase.js` and replace the placeholder values:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## File Size Limits

- **Free Supabase**: 1GB storage, 2GB bandwidth/month
- **File Upload**: Maximum 50MB per file
- **Supported Types**: PDF, MP4, AVI, MOV, WMV, JPG, PNG, GIF, DOC, DOCX, PPT, PPTX

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own coaching materials hub!