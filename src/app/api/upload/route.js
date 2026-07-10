import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary is configured (Recommended for production)
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', new Blob([buffer]), file.name);
      cloudinaryFormData.append('upload_preset', uploadPreset);
      
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      const cloudinaryData = await cloudinaryRes.json();
      if (cloudinaryData.secure_url) {
        return NextResponse.json({ url: cloudinaryData.secure_url });
      } else {
        throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
      }
    }

    // Otherwise, save to public/uploads (local development fallback)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const path = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(path, buffer);
    
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
