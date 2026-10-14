import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FileDropzone } from "./FileDropzone";
import { useUploadSong } from "../../hooks/useAdminSongs";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  artistName: z.string().trim().min(1, "Artist is required").max(200),
  albumName: z.string().trim().max(200).optional().or(z.literal("")),
  genre: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface SongUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function SongUploadModal({ open, onClose }: SongUploadModalProps) {
  const upload = useUploadSong();
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      artistName: "",
      albumName: "",
      genre: "",
      description: "",
    },
  });

  const resetAll = () => {
    reset();
    setAudio(null);
    setCover(null);
    setFileError(null);
  };

  const handleClose = () => {
    if (upload.isPending) return;
    resetAll();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!audio) {
      setFileError("Audio file is required.");
      return;
    }
    setFileError(null);

    try {
      await upload.mutateAsync({
        title: values.title.trim(),
        artistName: values.artistName.trim(),
        albumName: values.albumName?.trim() || undefined,
        genre: values.genre?.trim() || undefined,
        description: values.description?.trim() || undefined,
        audio,
        cover: cover ?? undefined,
      });
      resetAll();
      onClose();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload song"
      description="The song will be saved as a draft. Publish it when you're ready."
      size="lg"
      disableDismiss={upload.isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
        {/* Files */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FileDropzone
            label="Audio file *"
            accept="audio/*"
            file={audio}
            onChange={(f) => {
              setAudio(f);
              if (f) setFileError(null);
            }}
            hint="MP3, WAV, M4A · up to 100MB"
            previewType="audio"
            disabled={upload.isPending}
          />
          <FileDropzone
            label="Cover image"
            accept="image/*"
            file={cover}
            onChange={setCover}
            hint="JPG, PNG, WebP · square recommended"
            previewType="image"
            disabled={upload.isPending}
          />
        </div>

        {fileError && (
          <p className="text-xs text-red-500 -mt-2">{fileError}</p>
        )}

        {/* Metadata */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *" error={errors.title?.message}>
            <input
              {...register("title")}
              placeholder="Midnight Drive"
              disabled={upload.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>

          <Field label="Artist *" error={errors.artistName?.message}>
            <input
              {...register("artistName")}
              placeholder="Neon Horizon"
              disabled={upload.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>

          <Field label="Album" error={errors.albumName?.message}>
            <input
              {...register("albumName")}
              placeholder="Night Sessions"
              disabled={upload.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>

          <Field label="Genre" error={errors.genre?.message}>
            <input
              {...register("genre")}
              placeholder="Synthwave"
              disabled={upload.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            {...register("description")}
            placeholder="Relaxing synthwave track…"
            rows={3}
            disabled={upload.isPending}
            className="w-full rounded-lg surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 resize-none disabled:opacity-60"
          />
        </Field>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[rgb(var(--border-subtle))]">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={upload.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            leftIcon={<Upload className="h-4 w-4" />}
            isLoading={upload.isPending}
          >
            {upload.isPending ? "Uploading…" : "Upload song"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}