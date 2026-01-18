import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Upload, X } from "lucide-react";
import { SortableBannerItem } from "@/components/admin/SortableBannerItem";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
}

const BannersPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    button_link: "",
    active: true,
    display_order: 0,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Banner[];
    },
  });

  // Subscribe to real-time changes
  React.useEffect(() => {
    const channel = supabase
      .channel("banners-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "banners" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedBanners: Banner[]) => {
      const updates = reorderedBanners.map((banner, index) =>
        supabase
          .from("banners")
          .update({ display_order: index })
          .eq("id", banner.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      toast({
        title: "Ordem atualizada!",
        description: "A ordem dos banners foi salva.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reordenar",
        description: error.message,
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      subtitle: string | null;
      button_text: string | null;
      button_link: string | null;
      active: boolean;
      display_order: number;
      image_url?: string | null;
    }) => {
      if (selectedBanner) {
        const { error } = await supabase
          .from("banners")
          .update(data)
          .eq("id", selectedBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: selectedBanner ? "Banner atualizado!" : "Banner criado!",
        description: "Alterações salvas com sucesso.",
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Banner excluído!",
        description: "O banner foi removido.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedBanner(null);
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);

      const reorderedBanners = arrayMove(banners, oldIndex, newIndex);

      // Optimistic update
      queryClient.setQueryData(["admin-banners"], reorderedBanners);

      // Persist to database
      reorderMutation.mutate(reorderedBanners);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      button_text: "",
      button_link: "",
      active: true,
      display_order: banners.length,
    });
    setSelectedBanner(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const openEditDialog = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      button_text: banner.button_text || "",
      button_link: banner.button_link || "",
      active: banner.active,
      display_order: banner.display_order,
    });
    setImagePreview(banner.image_url);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return selectedBanner?.image_url || null;

    setIsUploading(true);
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);

    setIsUploading(false);

    if (uploadError) {
      toast({
        title: "Erro no upload",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }

    const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrl = await uploadImage();

    saveMutation.mutate({
      title: formData.title,
      subtitle: formData.subtitle || null,
      button_text: formData.button_text || null,
      button_link: formData.button_link || null,
      active: formData.active,
      display_order: formData.display_order,
      image_url: imageUrl,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Banners</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Banners da Home</CardTitle>
          <CardDescription className="text-white/80">
            Arraste os banners para reordenar. A ordem aqui será a mesma exibida
            no carrossel da home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : banners.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={banners.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {banners.map((banner) => (
                    <SortableBannerItem
                      key={banner.id}
                      banner={banner}
                      onEdit={openEditDialog}
                      onDelete={(b) => {
                        setSelectedBanner(b);
                        setIsDeleteDialogOpen(true);
                      }}
                      onToggleActive={(id, active) =>
                        toggleActiveMutation.mutate({ id, active })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum banner cadastrado. Clique em "Novo Banner" para criar o
              primeiro.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBanner ? "Editar Banner" : "Novo Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Texto do Botão</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) =>
                    setFormData({ ...formData, button_text: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_link">Link do Botão</Label>
                <Input
                  id="button_link"
                  value={formData.button_link}
                  onChange={(e) =>
                    setFormData({ ...formData, button_link: e.target.value })
                  }
                  placeholder="/categoria/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagem de Fundo</Label>
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground w-full">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">
                      Clique para fazer upload da imagem
                    </span>
                    <span className="text-xs">
                      Recomendado: 1920x600 pixels
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label htmlFor="active">Banner ativo</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || isUploading}
              >
                {(saveMutation.isPending || isUploading) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {selectedBanner ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O banner "{selectedBanner?.title}
              " será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedBanner && deleteMutation.mutate(selectedBanner.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannersPage;
