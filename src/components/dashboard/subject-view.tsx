'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { UserContext } from '@/context/user-provider';
import { UploadCloud, File as FileIcon, Download, Trash2, X } from 'lucide-react';
import type { Subject } from '@/lib/constants';
import { ScrollArea } from '../ui/scroll-area';

interface FileData {
  id: string;
  name: string;
  url: string;
  uploader: string;
  subject: string;
  createdAt: Timestamp;
}

export function SubjectView({ subject }: { subject: Subject }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const { username } = useContext(UserContext);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, 'files'),
      where('subject', '==', subject.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileList = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as FileData)
      );
      setFiles(fileList);
    });
    return () => unsubscribe();
  }, [subject.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !username) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `materials/${subject.id}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        setUploadProgress(null);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message,
        });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'files'), {
          name: file.name,
          url: downloadURL,
          uploader: username,
          subject: subject.id,
          createdAt: serverTimestamp(),
        });

        setIsUploading(false);
        setUploadProgress(null);
        setFile(null);
        toast({
          title: 'Upload Successful',
          description: `${file.name} has been shared.`,
        });
      }
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <subject.icon className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="font-headline text-3xl">{subject.name}</CardTitle>
                <CardDescription>Share and discover study materials.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                <label htmlFor="file-upload" className="flex-1">
                    <Button variant="outline" asChild className="w-full cursor-pointer">
                        <div>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Choose file
                        </div>
                    </Button>
                </label>
                <Button onClick={handleUpload} disabled={!file || isUploading}>
                  Upload
                </Button>
              </div>

              {file && !isUploading && (
                <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{file.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isUploading && uploadProgress !== null && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Uploading {file?.name}...</p>
                    <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
            <h3 className="font-headline text-2xl">Shared Materials</h3>
            {files.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No materials shared for this subject yet. Be the first!</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {files.map((f) => (
                        <Card key={f.id}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <FileIcon className="h-8 w-8 text-primary/70 mt-1" />
                                <div className="flex-1 space-y-1">
                                    <p className="font-semibold break-all">{f.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Uploaded by: {f.uploader}
                                    </p>
                                </div>
                                <Button asChild variant="ghost" size="icon">
                                    <a href={f.url} target="_blank" rel="noopener noreferrer" download={f.name}>
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </ScrollArea>
  );
}
