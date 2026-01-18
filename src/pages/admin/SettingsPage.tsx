import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, UserWithRole } from "@/hooks/useUsers";
import {
  useStoreSettings,
  useStoreSeals,
  useUpdateStoreSetting,
  useCreateStoreSeal,
  useDeleteStoreSeal,
  useReorderStoreSeals,
  StoreSeal,
} from "@/hooks/useStoreSettings";
import { FooterPreview } from "@/components/admin/FooterPreview";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Shield,
  Users,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  KeyRound,
  UserPlus,
  Store,
  ImagePlus,
  Upload,
  X,
  GripVertical,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Seal Item Component
interface SortableSealItemProps {
  seal: StoreSeal;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  size: "seal" | "payment";
}

function SortableSealItem({
  seal,
  onDelete,
  isDeleting,
  size,
}: SortableSealItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: seal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sizeClasses = size === "seal" ? "w-20 h-12" : "w-16 h-10";

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 bg-background/80 rounded p-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>
      <div
        className={`${sizeClasses} border rounded-lg overflow-hidden bg-muted flex items-center justify-center`}
      >
        <img
          src={seal.image_url}
          alt={seal.name}
          className="max-w-full max-h-full object-contain p-1"
        />
      </div>
      <span className="text-xs text-muted-foreground block text-center mt-1">
        {seal.name}
      </span>
      <button
        type="button"
        onClick={() => onDelete(seal.id)}
        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <X className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo"),
});

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Senha atual deve ter no mínimo 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "Nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "Confirmação deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const newUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["admin", "user"]),
});

const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const {
    users,
    loading,
    fetchUsers,
    updateUserRole,
    updateUserProfile,
    deleteUserRole,
  } = useUsers();

  // Store settings hooks
  const { data: storeSettings, isLoading: loadingSettings } =
    useStoreSettings();
  const { data: seals = [], isLoading: loadingSeals } = useStoreSeals("seal");
  const { data: paymentMethods = [], isLoading: loadingPayments } =
    useStoreSeals("payment");
  const updateSetting = useUpdateStoreSetting();
  const createSeal = useCreateStoreSeal();
  const deleteSeal = useDeleteStoreSeal();
  const reorderSeals = useReorderStoreSeals();

  // Local state for drag and drop
  const [localSeals, setLocalSeals] = useState<StoreSeal[]>([]);
  const [localPayments, setLocalPayments] = useState<StoreSeal[]>([]);

  // Sync local state with fetched data
  useEffect(() => {
    setLocalSeals(seals);
  }, [seals]);

  useEffect(() => {
    setLocalPayments(paymentMethods);
  }, [paymentMethods]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "user" as "admin" | "user",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<UserWithRole | null>(null);
  const [saving, setSaving] = useState(false);

  // My account edit states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "" });
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Create user states
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Store settings form
  const [storeForm, setStoreForm] = useState({
    store_name: "",
    store_logo: "",
    store_description: "",
    store_phone: "",
    store_email: "",
    store_address: "",
    store_cnpj: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingStore, setSavingStore] = useState(false);

  // Seal upload states
  const [uploadingSeal, setUploadingSeal] = useState(false);
  const [newSealName, setNewSealName] = useState("");
  const [newSealType, setNewSealType] = useState<"seal" | "payment">("seal");
  const [deletingSealId, setDeletingSealId] = useState<string | null>(null);

  // Load store settings into form
  useEffect(() => {
    if (storeSettings) {
      setStoreForm({
        store_name: storeSettings.store_name || "",
        store_logo: storeSettings.store_logo || "",
        store_description: storeSettings.store_description || "",
        store_phone: storeSettings.store_phone || "",
        store_email: storeSettings.store_email || "",
        store_address: storeSettings.store_address || "",
        store_cnpj: storeSettings.store_cnpj || "",
        facebook_url: storeSettings.facebook_url || "",
        instagram_url: storeSettings.instagram_url || "",
        youtube_url: storeSettings.youtube_url || "",
        twitter_url: storeSettings.twitter_url || "",
      });
    }
  }, [storeSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("seals")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("seals")
        .getPublicUrl(fileName);

      setStoreForm({ ...storeForm, store_logo: urlData.publicUrl });
      toast({
        title: "Logo carregado",
        description: "Clique em Salvar para confirmar.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleSaveStoreSettings = async () => {
    setSavingStore(true);
    try {
      for (const [key, value] of Object.entries(storeForm)) {
        await updateSetting.mutateAsync({ key, value });
      }
      toast({
        title: "Configurações salvas",
        description: "As informações da loja foram atualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingStore(false);
    }
  };

  const handleSealUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "seal" | "payment"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newSealName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o selo/bandeira.",
        variant: "destructive",
      });
      return;
    }

    setUploadingSeal(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("seals")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("seals")
        .getPublicUrl(fileName);

      const currentSeals = type === "seal" ? seals : paymentMethods;
      const maxOrder =
        currentSeals.length > 0
          ? Math.max(...currentSeals.map((s) => s.display_order))
          : -1;

      await createSeal.mutateAsync({
        name: newSealName.trim(),
        image_url: urlData.publicUrl,
        type,
        display_order: maxOrder + 1,
        active: true,
      });

      setNewSealName("");
      toast({
        title: "Imagem adicionada",
        description: `${
          type === "seal" ? "Selo" : "Bandeira"
        } adicionado com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingSeal(false);
      e.target.value = "";
    }
  };

  const handleDeleteSeal = async (id: string) => {
    setDeletingSealId(id);
    try {
      await deleteSeal.mutateAsync(id);
      toast({ title: "Removido", description: "Imagem removida com sucesso." });
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingSealId(null);
    }
  };

  const handleSealDragEnd = async (
    event: DragEndEvent,
    type: "seal" | "payment"
  ) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const items = type === "seal" ? localSeals : localPayments;
      const setItems = type === "seal" ? setLocalSeals : setLocalPayments;

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Update local state immediately for smooth UX
      setItems(newOrder);

      // Save to database
      try {
        await reorderSeals.mutateAsync(
          newOrder.map((item, index) => ({ id: item.id, display_order: index }))
        );
      } catch (error: any) {
        toast({
          title: "Erro ao reordenar",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEditUser = (userToEdit: UserWithRole) => {
    setEditingUser(userToEdit);
    setEditForm({
      full_name: userToEdit.full_name || "",
      role: userToEdit.role,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      // Update profile name if changed
      if (editForm.full_name !== editingUser.full_name) {
        await updateUserProfile(editingUser.user_id, {
          full_name: editForm.full_name,
        });
      }

      // Update role if changed
      if (editForm.role !== editingUser.role) {
        await updateUserRole(editingUser.user_id, editForm.role);
      }

      setEditingUser(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteConfirm) return;

    await deleteUserRole(deleteConfirm.user_id);
    setDeleteConfirm(null);
  };

  // My account handlers
  const openEditProfile = () => {
    setProfileForm({ full_name: user?.user_metadata?.full_name || "" });
    setFormErrors({});
    setEditProfileOpen(true);
  };

  const openEditEmail = () => {
    setEmailForm({ email: user?.email || "" });
    setFormErrors({});
    setEditEmailOpen(true);
  };

  const openEditPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setEditPasswordOpen(true);
  };

  const handleSaveProfile = async () => {
    setFormErrors({});
    try {
      profileSchema.parse(profileForm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileForm.full_name },
      });

      if (error) throw error;

      // Also update profiles table
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ full_name: profileForm.full_name })
          .eq("user_id", user.id);
      }

      toast({
        title: "Nome atualizado",
        description: "Suas informações foram salvas",
      });
      setEditProfileOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveEmail = async () => {
    setFormErrors({});
    try {
      emailSchema.parse(emailForm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.email,
      });

      if (error) throw error;

      toast({
        title: "Email de confirmação enviado",
        description:
          "Verifique sua caixa de entrada para confirmar o novo email",
      });
      setEditEmailOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    setFormErrors({});
    try {
      passwordSchema.parse(passwordForm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setSavingProfile(true);
    try {
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        setFormErrors({ currentPassword: "Senha atual incorreta" });
        setSavingProfile(false);
        return;
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso",
      });
      setEditPasswordOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const openCreateUser = () => {
    setNewUserForm({ full_name: "", email: "", password: "", role: "user" });
    setFormErrors({});
    setCreateUserOpen(true);
  };

  const handleCreateUser = async () => {
    setFormErrors({});
    try {
      newUserSchema.parse(newUserForm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setCreatingUser(true);
    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          data: { full_name: newUserForm.full_name },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from("profiles").insert({
          user_id: authData.user.id,
          full_name: newUserForm.full_name,
        });

        // Set role if admin
        if (newUserForm.role === "admin") {
          await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role: "admin",
          });
        }
      }

      toast({
        title: "Usuário criado",
        description:
          "O novo usuário foi cadastrado com sucesso. Um email de confirmação foi enviado.",
      });
      setCreateUserOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Minha Conta</TabsTrigger>
          <TabsTrigger value="store">Loja</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current User Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5" />
                      Minha Conta
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Informações do seu usuário
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-white/70">Nome</label>
                    <p className="font-medium text-white">
                      {user?.user_metadata?.full_name || "Não informado"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={openEditProfile}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-white/70">Email</label>
                    <p className="font-medium text-white">{user?.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={openEditEmail}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-white/70">Senha</label>
                    <p className="font-medium text-white">••••••••</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openEditPassword}
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current User Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5" />
                  Minhas Permissões
                </CardTitle>
                <CardDescription className="text-white/70">
                  Seu nível de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Administrador" : "Usuário"}
                  </Badge>
                </div>
                <div className="text-sm text-white/80">
                  {isAdmin ? (
                    <ul className="space-y-1">
                      <li>✓ Gerenciar produtos</li>
                      <li>✓ Gerenciar banners</li>
                      <li>✓ Visualizar todos os pedidos</li>
                      <li>✓ Gerenciar usuários e permissões</li>
                    </ul>
                  ) : (
                    <p>Você não possui permissões de administrador.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Store Tab */}
        <TabsContent value="store" className="space-y-6">
          {/* Store Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Store className="w-5 h-5" />
                Informações da Loja
              </CardTitle>
              <CardDescription className="text-white/70">
                Configure os dados exibidos no rodapé e páginas da loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store_name">Nome da Loja</Label>
                      <Input
                        id="store_name"
                        value={storeForm.store_name}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            store_name: e.target.value,
                          })
                        }
                        placeholder="Ex: AuraOutlet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Logotipo da Loja</Label>
                      <div className="flex items-center gap-3">
                        {storeForm.store_logo ? (
                          <div className="relative w-24 h-12 border rounded-lg overflow-hidden bg-muted flex items-center justify-center group">
                            <img
                              src={storeForm.store_logo}
                              alt="Logo"
                              className="max-w-full max-h-full object-contain p-1"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setStoreForm({ ...storeForm, store_logo: "" })
                              }
                              className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-12 border rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            Sem logo
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={uploadingLogo}
                            asChild
                          >
                            <span>
                              {uploadingLogo ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              {storeForm.store_logo ? "Alterar" : "Carregar"}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store_description">Descrição da Loja</Label>
                    <Textarea
                      id="store_description"
                      value={storeForm.store_description}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          store_description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store_phone">Telefone</Label>
                      <Input
                        id="store_phone"
                        value={storeForm.store_phone}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            store_phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store_email">Email</Label>
                      <Input
                        id="store_email"
                        type="email"
                        value={storeForm.store_email}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            store_email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store_address">Endereço</Label>
                      <Input
                        id="store_address"
                        value={storeForm.store_address}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            store_address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store_cnpj">CNPJ</Label>
                      <Input
                        id="store_cnpj"
                        value={storeForm.store_cnpj}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            store_cnpj: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook_url">Facebook URL</Label>
                      <Input
                        id="facebook_url"
                        value={storeForm.facebook_url}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            facebook_url: e.target.value,
                          })
                        }
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram_url">Instagram URL</Label>
                      <Input
                        id="instagram_url"
                        value={storeForm.instagram_url}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            instagram_url: e.target.value,
                          })
                        }
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtube_url">YouTube URL</Label>
                      <Input
                        id="youtube_url"
                        value={storeForm.youtube_url}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            youtube_url: e.target.value,
                          })
                        }
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter_url">Twitter URL</Label>
                      <Input
                        id="twitter_url"
                        value={storeForm.twitter_url}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            twitter_url: e.target.value,
                          })
                        }
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveStoreSettings}
                    disabled={savingStore}
                  >
                    {savingStore && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Salvar Configurações
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trust Seals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5" />
                Selos de Confiança
              </CardTitle>
              <CardDescription>
                Google, PROCON, Reclame Aqui, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSeals ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Arraste para reordenar os selos
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleSealDragEnd(e, "seal")}
                  >
                    <SortableContext
                      items={localSeals.map((s) => s.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex flex-wrap gap-3">
                        {localSeals.map((seal) => (
                          <SortableSealItem
                            key={seal.id}
                            seal={seal}
                            onDelete={handleDeleteSeal}
                            isDeleting={deletingSealId === seal.id}
                            size="seal"
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Nome do Selo</Label>
                      <Input
                        placeholder="Ex: Google, PROCON..."
                        value={newSealType === "seal" ? newSealName : ""}
                        onChange={(e) => {
                          setNewSealType("seal");
                          setNewSealName(e.target.value);
                        }}
                      />
                    </div>
                    <label className="cursor-pointer">
                      <Button
                        variant="outline"
                        disabled={uploadingSeal}
                        asChild
                      >
                        <span>
                          {uploadingSeal ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Adicionar Selo
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSealUpload(e, "seal")}
                      />
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="w-5 h-5" />
                Bandeiras de Pagamento
              </CardTitle>
              <CardDescription>
                Visa, Mastercard, Pix, Boleto, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPayments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Arraste para reordenar as bandeiras
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleSealDragEnd(e, "payment")}
                  >
                    <SortableContext
                      items={localPayments.map((p) => p.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex flex-wrap gap-3">
                        {localPayments.map((payment) => (
                          <SortableSealItem
                            key={payment.id}
                            seal={payment}
                            onDelete={handleDeleteSeal}
                            isDeleting={deletingSealId === payment.id}
                            size="payment"
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Nome da Bandeira</Label>
                      <Input
                        placeholder="Ex: Visa, Mastercard..."
                        value={newSealType === "payment" ? newSealName : ""}
                        onChange={(e) => {
                          setNewSealType("payment");
                          setNewSealName(e.target.value);
                        }}
                      />
                    </div>
                    <label className="cursor-pointer">
                      <Button
                        variant="outline"
                        disabled={uploadingSeal}
                        asChild
                      >
                        <span>
                          {uploadingSeal ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Adicionar Bandeira
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSealUpload(e, "payment")}
                      />
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Preview do Rodapé
              </CardTitle>
              <CardDescription>
                Visualização em tempo real das alterações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FooterPreview
                storeForm={storeForm}
                seals={localSeals}
                paymentMethods={localPayments}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie permissões dos usuários do sistema
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Atualizar
                  </Button>
                  <Button size="sm" onClick={openCreateUser}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Permissão</TableHead>
                        <TableHead>Cadastrado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {u.full_name || "Sem nome"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {u.user_id === user?.id && "(você)"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {u.role === "admin" ? "Administrador" : "Usuário"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(u.created_at),
                              "dd 'de' MMM, yyyy",
                              { locale: ptBR }
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(u)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {u.role === "admin" && u.user_id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteConfirm(u)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog
            open={!!editingUser}
            onOpenChange={() => setEditingUser(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Atualize as informações e permissões do usuário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                    placeholder="Nome do usuário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Permissão</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value: "admin" | "user") =>
                      setEditForm({ ...editForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Administradores têm acesso completo ao painel e podem
                    gerenciar produtos, pedidos e outros usuários.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog
            open={!!deleteConfirm}
            onOpenChange={() => setDeleteConfirm(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Remover permissão de administrador?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  O usuário "{deleteConfirm?.full_name || "Sem nome"}" perderá
                  acesso de administrador e se tornará um usuário comum.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRole}>
                  Remover permissão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit Profile Dialog */}
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Nome</DialogTitle>
                <DialogDescription>
                  Atualize seu nome de exibição
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="profile_name">Nome completo</Label>
                  <Input
                    id="profile_name"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm({ full_name: e.target.value })
                    }
                    placeholder="Seu nome"
                  />
                  {formErrors.full_name && (
                    <p className="text-sm text-destructive">
                      {formErrors.full_name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Email Dialog */}
          <Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Email</DialogTitle>
                <DialogDescription>
                  Um email de confirmação será enviado para o novo endereço
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new_email">Novo email</Label>
                  <Input
                    id="new_email"
                    type="email"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ email: e.target.value })}
                    placeholder="seu@novoemail.com"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditEmailOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEmail} disabled={savingProfile}>
                  {savingProfile && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Enviar confirmação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Password Dialog */}
          <Dialog open={editPasswordOpen} onOpenChange={setEditPasswordOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogDescription>
                  Digite sua senha atual e a nova senha desejada
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Senha atual</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                  {formErrors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {formErrors.currentPassword}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova senha</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                  {formErrors.newPassword && (
                    <p className="text-sm text-destructive">
                      {formErrors.newPassword}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditPasswordOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSavePassword} disabled={savingProfile}>
                  {savingProfile && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Alterar senha
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create User Dialog */}
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Cadastre um novo usuário no sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new_user_name">Nome completo</Label>
                  <Input
                    id="new_user_name"
                    value={newUserForm.full_name}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        full_name: e.target.value,
                      })
                    }
                    placeholder="Nome do usuário"
                  />
                  {formErrors.full_name && (
                    <p className="text-sm text-destructive">
                      {formErrors.full_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_user_email">Email</Label>
                  <Input
                    id="new_user_email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, email: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_user_password">Senha</Label>
                  <Input
                    id="new_user_password"
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                  {formErrors.password && (
                    <p className="text-sm text-destructive">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_user_role">Permissão</Label>
                  <Select
                    value={newUserForm.role}
                    onValueChange={(value: "admin" | "user") =>
                      setNewUserForm({ ...newUserForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Administradores têm acesso completo ao painel
                    administrativo.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateUserOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={creatingUser}>
                  {creatingUser && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Criar Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Como gerenciar permissões</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  <strong>Usuário:</strong> Acesso básico, pode visualizar e
                  fazer pedidos na loja.
                </li>
                <li>
                  <strong>Administrador:</strong> Acesso completo ao painel
                  administrativo, incluindo produtos, banners, pedidos e
                  gerenciamento de usuários.
                </li>
                <li>
                  <strong>Editar:</strong> Clique no ícone de lápis para alterar
                  nome ou permissão.
                </li>
                <li>
                  <strong>Remover admin:</strong> Clique na lixeira para remover
                  permissão de administrador (você não pode remover sua própria
                  permissão).
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
