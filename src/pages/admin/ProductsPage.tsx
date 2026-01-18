import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  X,
  Search,
  ImagePlus,
  GripVertical,
} from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promotional_price: number | null;
  category: string;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

const categories = [
  "Masculino",
  "Feminino",
  "Acessórios",
  "Calçados",
  "Infantil",
];

// Sortable Image Item Component
interface SortableImageItemProps {
  image: ProductImage;
  onRemove: (id: string) => void;
}

function SortableImageItem({ image, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square border-2 border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0.5 left-0.5 z-10 bg-background/80 rounded p-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>
      <img
        src={image.image_url}
        alt="Produto"
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        className="absolute inset-0 bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(image.id)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// New Image Item (not yet saved)
interface NewImageItemProps {
  preview: string;
  index: number;
  onRemove: (index: number) => void;
}

function NewImageItem({ preview, index, onRemove }: NewImageItemProps) {
  return (
    <div className="relative group aspect-square border-2 border-primary rounded-lg overflow-hidden">
      <img
        src={preview}
        alt="Nova imagem"
        className="w-full h-full object-cover"
      />
      <span className="absolute top-0.5 left-0.5 text-[10px] bg-primary text-white px-1 rounded">
        Novo
      </span>
      <button
        type="button"
        className="absolute inset-0 bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

const ProductsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reorderedImages, setReorderedImages] = useState<string[]>([]);

  // Additional images state
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    promotional_price: "",
    category: "",
    stock: "",
    active: true,
  });

  // Fetch products with real-time subscription
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch product images
  const fetchProductImages = async (productId: string) => {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching product images:", error);
      return [];
    }
    return data as ProductImage[];
  };

  // Subscribe to real-time changes
  React.useEffect(() => {
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      promotional_price: number | null;
      category: string;
      stock: number;
      active: boolean;
      image_url?: string | null;
    }) => {
      let productId = selectedProduct?.id;

      if (selectedProduct) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", selectedProduct.id);
        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        productId = newProduct.id;
      }

      // Delete removed images
      if (imagesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("product_images")
          .delete()
          .in("id", imagesToDelete);
        if (deleteError) throw deleteError;
      }

      // Update display_order for reordered images
      if (reorderedImages.length > 0) {
        for (let i = 0; i < additionalImages.length; i++) {
          const img = additionalImages[i];
          await supabase
            .from("product_images")
            .update({ display_order: i })
            .eq("id", img.id);
        }
      }

      // Upload and save new additional images
      if (newImageFiles.length > 0 && productId) {
        const startOrder = additionalImages.length;

        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${productId}_${Date.now()}_${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

          await supabase.from("product_images").insert({
            product_id: productId,
            image_url: urlData.publicUrl,
            display_order: startOrder + i,
          });
        }
      }
    },
    onSuccess: () => {
      toast({
        title: selectedProduct ? "Produto atualizado!" : "Produto criado!",
        description: "Alterações salvas com sucesso.",
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
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
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído!",
        description: "O produto foi removido.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      promotional_price: "",
      category: "",
      stock: "",
      active: true,
    });
    setSelectedProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
    setReorderedImages([]);
  };

  const openEditDialog = async (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      promotional_price: product.promotional_price?.toString() || "",
      category: product.category,
      stock: product.stock.toString(),
      active: product.active,
    });
    setImagePreview(product.image_url);

    // Fetch additional images
    const images = await fetchProductImages(product.id);
    setAdditionalImages(images);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
    setReorderedImages([]);

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

  const MAX_ADDITIONAL_IMAGES = 10;

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentTotal = additionalImages.length + newImageFiles.length;
      const remainingSlots = MAX_ADDITIONAL_IMAGES - currentTotal;

      if (remainingSlots <= 0) {
        toast({
          title: "Limite atingido",
          description: `Você pode adicionar no máximo ${MAX_ADDITIONAL_IMAGES} imagens adicionais.`,
          variant: "destructive",
        });
        return;
      }

      const filesToAdd = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast({
          title: "Algumas imagens não foram adicionadas",
          description: `Limite de ${MAX_ADDITIONAL_IMAGES} imagens. Apenas ${remainingSlots} foram adicionadas.`,
        });
      }

      setNewImageFiles((prev) => [...prev, ...filesToAdd]);
      const previews = filesToAdd.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeAdditionalImage = (imageId: string) => {
    setAdditionalImages((prev) => prev.filter((img) => img.id !== imageId));
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAdditionalImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Track reordered image IDs
        setReorderedImages(newOrder.map((img) => img.id));

        return newOrder;
      });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return selectedProduct?.image_url || null;

    setIsUploading(true);
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
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

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrl = await uploadImage();

    saveMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      promotional_price: formData.promotional_price
        ? parseFloat(formData.promotional_price)
        : null,
      category: formData.category,
      stock: parseInt(formData.stock),
      active: formData.active,
      image_url: imageUrl,
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAdditionalImages =
    additionalImages.length + newImagePreviews.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Produtos</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-white"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Imagem</th>
                    <th className="text-left py-3 px-2 font-medium">Nome</th>
                    <th className="text-left py-3 px-2 font-medium hidden md:table-cell">
                      Categoria
                    </th>
                    <th className="text-left py-3 px-2 font-medium">Preço</th>
                    <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">
                      Estoque
                    </th>
                    <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-3 px-2">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                            Sem img
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium">{product.name}</td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        {product.category}
                      </td>
                      <td className="py-3 px-2">
                        {product.promotional_price ? (
                          <div>
                            <span className="line-through text-muted-foreground text-xs">
                              {product.price.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                            <br />
                            <span className="text-primary font-medium">
                              {product.promotional_price.toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )}
                            </span>
                          </div>
                        ) : (
                          product.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        )}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        {product.stock}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <Badge
                          variant={product.active ? "default" : "secondary"}
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum produto encontrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotional_price">
                  Preço Promocional (R$)
                </Label>
                <Input
                  id="promotional_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.promotional_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promotional_price: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label>Imagem Principal</Label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex-1 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Clique para fazer upload</span>
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

            {/* Additional Images - Gallery Style with Drag & Drop */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Galeria de Imagens ({totalAdditionalImages}/
                  {MAX_ADDITIONAL_IMAGES})
                </Label>
                {totalAdditionalImages >= MAX_ADDITIONAL_IMAGES && (
                  <span className="text-xs text-destructive font-medium">
                    Limite atingido
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Adicione até {MAX_ADDITIONAL_IMAGES} fotos. Arraste para
                reordenar.
              </p>

              <div className="flex gap-4">
                {/* Thumbnails Column with Drag & Drop */}
                <div className="w-20 flex flex-col gap-2 max-h-80 overflow-y-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleImageDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={additionalImages.map((img) => img.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {additionalImages.map((img) => (
                        <SortableImageItem
                          key={img.id}
                          image={img}
                          onRemove={removeAdditionalImage}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* New images to upload (not sortable yet) */}
                  {newImagePreviews.map((preview, index) => (
                    <NewImageItem
                      key={`new-${index}`}
                      preview={preview}
                      index={index}
                      onRemove={removeNewImage}
                    />
                  ))}

                  {/* Add more button */}
                  {totalAdditionalImages < MAX_ADDITIONAL_IMAGES && (
                    <label className="aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center text-muted-foreground">
                      <Plus className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAdditionalImagesChange}
                      />
                    </label>
                  )}
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 border-2 border-dashed border-border rounded-lg p-4 min-h-48 flex items-center justify-center">
                  {totalAdditionalImages > 0 ? (
                    <div className="text-center text-muted-foreground">
                      <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">
                        {totalAdditionalImages} imagens adicionadas
                      </p>
                      <p className="text-xs mt-1">
                        Passe o mouse sobre as miniaturas para excluir
                      </p>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Arraste ou clique para adicionar imagens
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos: JPG, PNG, WEBP (máx. {MAX_ADDITIONAL_IMAGES}{" "}
                        imagens)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAdditionalImagesChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="active">Produto ativo</Label>
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
                {selectedProduct ? "Salvar" : "Criar"}
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
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto "
              {selectedProduct?.name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedProduct && deleteMutation.mutate(selectedProduct.id)
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

export default ProductsPage;
