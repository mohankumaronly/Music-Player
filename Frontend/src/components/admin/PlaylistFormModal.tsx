import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  useCreatePlaylist,
  useUpdatePlaylist,
} from "../../hooks/useAdminPlaylists";
import type { Playlist } from "../../api/types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface PlaylistFormModalProps {
  open: boolean;
  playlist?: Playlist | null;
  onClose: () => void;
  /** Called with the created/updated playlist id */
  onSaved?: (id: string) => void;
}

export function PlaylistFormModal({
  open,
  playlist,
  onClose,
  onSaved,
}: PlaylistFormModalProps) {
  const isEdit = Boolean(playlist);
  const createMutation = useCreatePlaylist();
  const updateMutation = useUpdatePlaylist(playlist?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", isPublic: true },
  });

  useEffect(() => {
    if (!open) return;
    if (playlist) {
      reset({
        name: playlist.name,
        description: playlist.description ?? "",
        isPublic: playlist.isPublic,
      });
    } else {
      reset({ name: "", description: "", isPublic: true });
    }
  }, [open, playlist, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && playlist) {
        await updateMutation.mutateAsync({
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          isPublic: values.isPublic,
        });
        onSaved?.(playlist.id);
      } else {
        const created = await createMutation.mutateAsync({
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          isPublic: values.isPublic,
        });
        onSaved?.(created.id);
      }
      onClose();
    } catch {
      /* toast in hook */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit playlist" : "New playlist"}
      size="md"
      disableDismiss={mutation.isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
            Name *
          </span>
          <input
            {...register("name")}
            placeholder="Late Night Chill Vibes"
            disabled={mutation.isPending}
            className="h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
          />
          {errors.name && (
            <span className="mt-1 block text-xs text-red-500">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[rgb(var(--text-secondary))]">
            Description
          </span>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Curated ad-free tracks…"
            disabled={mutation.isPending}
            className="w-full rounded-lg surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 resize-none disabled:opacity-60"
          />
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("isPublic")}
            disabled={mutation.isPending}
            className="h-4 w-4 rounded accent-brand-600"
          />
          <div>
            <div className="text-sm font-medium">Public playlist</div>
            <div className="text-xs text-[rgb(var(--text-tertiary))]">
              Visible to everyone in the library
            </div>
          </div>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t border-[rgb(var(--border-subtle))]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={mutation.isPending}
          >
            {isEdit ? "Save changes" : "Create playlist"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}