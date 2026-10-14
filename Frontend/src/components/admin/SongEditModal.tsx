import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useUpdateSong } from "../../hooks/useAdminSongs";
import type { Song } from "../../api/types";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  artistName: z.string().trim().min(1, "Artist is required").max(200),
  albumName: z.string().trim().max(200).optional().or(z.literal("")),
  genre: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface SongEditModalProps {
  open: boolean;
  song: Song | null;
  onClose: () => void;
}

export function SongEditModal({ open, song, onClose }: SongEditModalProps) {
  const update = useUpdateSong(song?.id ?? "");

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

  useEffect(() => {
    if (song && open) {
      reset({
        title: song.title,
        artistName: song.artistName,
        albumName: song.albumName ?? "",
        genre: song.genre ?? "",
        description: song.description ?? "",
      });
    }
  }, [song, open, reset]);

  if (!song) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await update.mutateAsync({
        title: values.title.trim(),
        artistName: values.artistName.trim(),
        albumName: values.albumName?.trim() || undefined,
        genre: values.genre?.trim() || undefined,
        description: values.description?.trim() || undefined,
      });
      onClose();
    } catch {
      /* toast in hook */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit song"
      description={song.title}
      size="lg"
      disableDismiss={update.isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *" error={errors.title?.message}>
            <input
              {...register("title")}
              disabled={update.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>
          <Field label="Artist *" error={errors.artistName?.message}>
            <input
              {...register("artistName")}
              disabled={update.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>
          <Field label="Album" error={errors.albumName?.message}>
            <input
              {...register("albumName")}
              disabled={update.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>
          <Field label="Genre" error={errors.genre?.message}>
            <input
              {...register("genre")}
              disabled={update.isPending}
              className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
            />
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            {...register("description")}
            rows={3}
            disabled={update.isPending}
            className="w-full rounded-lg surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 resize-none disabled:opacity-60"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2 border-t border-[rgb(var(--border-subtle))]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={update.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={update.isPending}
          >
            Save changes
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