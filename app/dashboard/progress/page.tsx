'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CameraIcon, PhotoIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { progressPhotoSchema, ProgressPhotoFormData } from '@/lib/validations/auth';

interface ProgressPhoto {
  id: string;
  user_id: string;
  cloudflare_r2_key: string;
  signed_url?: string;
  url_expires_at?: string;
  photo_type: 'front' | 'side' | 'back' | 'custom';
  photo_date: string;
  notes?: string;
  file_size_bytes?: number;
  mime_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface UploadResponse {
  photo_id: string;
  upload_url: string;
  expires_at: string;
}

const PHOTO_TYPES = [
  { value: 'front', label: 'Frontal' },
  { value: 'side', label: 'Lateral' },
  { value: 'back', label: 'Posterior' },
  { value: 'custom', label: 'Personalizada' },
] as const;

export default function ProgressPhotosPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form setup with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProgressPhotoFormData>({
    resolver: zodResolver(progressPhotoSchema),
    defaultValues: {
      photo_type: 'front',
      photo_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const watchedPhotoType = watch('photo_type');

  // Fetch progress photos
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async (): Promise<ProgressPhoto[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('photo_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, formData }: {
      file: File;
      formData: ProgressPhotoFormData;
    }) => {
      // Step 1: Get upload URL from Edge Function
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke<UploadResponse>(
        'upload-progress-photo',
        {
          body: {
            photo_type: formData.photo_type,
            notes: formData.notes,
            photo_date: formData.photo_date,
          },
        }
      );

      if (uploadError || !uploadData) {
        throw new Error(uploadError?.message || 'Failed to get upload URL');
      }

      // Step 2: Upload file to Cloudflare R2 using signed URL
      const uploadResponse = await fetch(uploadData.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to R2');
      }

      return uploadData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast.success('Foto subida exitosamente');
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      reset();
    },
    onError: (error) => {
      toast.error(`Error al subir la foto: ${error.message}`);
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
      toast.success('Foto eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar la foto: ${error.message}`);
    },
  });

  // Get photo URL mutation
  const getPhotoUrlMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { data, error } = await supabase.functions.invoke<{ signed_url: string; expires_at: string }>(
        'get-photo-url',
        {
          body: { photo_id: photoId },
        }
      );

      if (error || !data) {
        throw new Error(error?.message || 'Failed to get photo URL');
      }

      return data;
    },
    onSuccess: (data, photoId) => {
      // Update the photo in the cache with the new signed URL
      queryClient.setQueryData(['progress-photos', user?.id], (oldData: ProgressPhoto[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(photo => 
          photo.id === photoId 
            ? { ...photo, signed_url: data.signed_url, url_expires_at: data.expires_at }
            : photo
        );
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB permitido');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const onSubmit = (formData: ProgressPhotoFormData) => {
    if (!selectedFile) {
      toast.error('Por favor selecciona una foto');
      return;
    }

    uploadPhotoMutation.mutate({
      file: selectedFile,
      formData,
    });
  };

  const handleViewPhoto = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
    
    // Check if we need to get a new signed URL
    const needsNewUrl = !photo.signed_url || 
      (photo.url_expires_at && new Date(photo.url_expires_at) <= new Date());
    
    if (needsNewUrl) {
      getPhotoUrlMutation.mutate(photo.id);
    }
    
    setIsViewDialogOpen(true);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      deletePhotoMutation.mutate(photoId);
    }
  };

  const getPhotoTypeLabel = (type: string) => {
    return PHOTO_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fotos de Progreso</h1>
          <p className="text-gray-600">Documenta tu transformación física con fotos de progreso</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <CameraIcon className="h-4 w-4 mr-2" />
              Subir Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Foto de Progreso</DialogTitle>
              <DialogDescription>
                Selecciona una foto para documentar tu progreso físico
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="photo-file">Seleccionar Foto</Label>
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="photo-type">Tipo de Foto</Label>
                <Select
                  value={watchedPhotoType}
                  onValueChange={(value) => setValue('photo_type', value as 'front' | 'side' | 'back' | 'custom')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.photo_type && (
                  <p className="text-sm text-red-600 mt-1">{errors.photo_type.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="photo-date">Fecha</Label>
                <Input
                  id="photo-date"
                  type="date"
                  {...register('photo_date')}
                  className="mt-1"
                />
                {errors.photo_date && (
                  <p className="text-sm text-red-600 mt-1">{errors.photo_date.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="photo-notes">Notas (Opcional)</Label>
                <Textarea
                  id="photo-notes"
                  {...register('notes')}
                  placeholder="Añade notas sobre esta foto..."
                  className="mt-1"
                  rows={3}
                />
                {errors.notes && (
                  <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                    reset();
                  }}
                  disabled={uploadPhotoMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || isSubmitting || uploadPhotoMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {uploadPhotoMutation.isPending ? 'Subiendo...' : 'Subir Foto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fotos de progreso</h3>
            <p className="text-gray-500 text-center mb-4">
              Comienza a documentar tu transformación subiendo tu primera foto de progreso
            </p>
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Subir Primera Foto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 relative group">
                {photo.signed_url && new Date(photo.url_expires_at || 0) > new Date() ? (
                  <img
                    src={photo.signed_url}
                    alt={`Foto de progreso ${getPhotoTypeLabel(photo.photo_type)}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewPhoto(photo)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-600">
                    {getPhotoTypeLabel(photo.photo_type)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(photo.photo_date), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
                
                {photo.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {photo.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Photo Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Foto {selectedPhoto ? getPhotoTypeLabel(selectedPhoto.photo_type) : ''}
            </DialogTitle>
            <DialogDescription>
              {selectedPhoto && format(new Date(selectedPhoto.photo_date), 'dd MMMM yyyy', { locale: es })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {selectedPhoto.signed_url && new Date(selectedPhoto.url_expires_at || 0) > new Date() ? (
                  <img
                    src={selectedPhoto.signed_url}
                    alt={`Foto de progreso ${getPhotoTypeLabel(selectedPhoto.photo_type)}`}
                    className="w-full h-full object-cover"
                  />
                ) : getPhotoUrlMutation.isPending ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {selectedPhoto.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                  <p className="text-gray-600">{selectedPhoto.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}