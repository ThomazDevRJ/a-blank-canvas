import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Loader2,
  Search,
  Eye,
  Package,
  Pencil,
  Trash2,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  shipped: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delivered: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"];

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    customer_email: "",
    status: "",
  });

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((order) => ({
        ...order,
        items: (Array.isArray(order.items)
          ? order.items
          : []) as unknown as OrderItem[],
      })) as Order[];
    },
  });

  // Subscribe to real-time changes
  React.useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        customer_name?: string;
        customer_email?: string;
        status?: string;
      };
    }) => {
      const { error } = await supabase.from("orders").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Pedido atualizado!",
        description: "As alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setIsEditOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Pedido excluído!",
        description: "O pedido foi removido.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const openEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      status: order.status,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      data: editForm,
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteOrderMutation.mutate(deleteConfirm.id);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      ID: order.id,
      Cliente: order.customer_name,
      Email: order.customer_email,
      Total: Number(order.total),
      Status: statusLabels[order.status] || order.status,
      Data: new Date(order.created_at).toLocaleDateString("pt-BR"),
      Itens: order.items
        .map((item) => `${item.name} (${item.quantity}x)`)
        .join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

    // Auto-width columns
    const colWidths = [
      { wch: 36 }, // ID
      { wch: 25 }, // Cliente
      { wch: 30 }, // Email
      { wch: 12 }, // Total
      { wch: 12 }, // Status
      { wch: 12 }, // Data
      { wch: 50 }, // Itens
    ];
    ws["!cols"] = colWidths;

    const fileName = `pedidos_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Relatório exportado!",
      description: `Arquivo ${fileName} baixado com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Pedidos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os pedidos da loja
          </p>
        </div>
        <Button onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, email ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/8 border-border text-black placeholder:text-muted-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/8 border-border text-foreground">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground text-lg font-semibold">
            Lista de Pedidos
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {filteredOrders.length} pedido(s)
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-4 px-3 font-medium text-muted-foreground hidden lg:table-cell">
                      Data
                    </th>
                    <th className="text-right py-4 px-3 font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-3 font-mono text-xs text-foreground/60">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="py-4 px-3 font-medium text-foreground">
                        {order.customer_name}
                      </td>
                      <td className="py-4 px-3 hidden md:table-cell text-muted-foreground">
                        {order.customer_email}
                      </td>
                      <td className="py-4 px-3 font-medium text-foreground">
                        {Number(order.total).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="py-4 px-3">
                        <Badge
                          className={`${
                            statusColors[order.status]
                          } border font-medium`}
                        >
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="py-4 px-3 text-muted-foreground hidden lg:table-cell">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetail(order)}
                            className="hover:bg-white/12 text-foreground/70 hover:text-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(order)}
                            className="hover:bg-white/12 text-foreground/70 hover:text-foreground"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(order)}
                            className="hover:bg-red-500/20 text-red-400"
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
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Detalhes do Pedido
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID do Pedido</span>
                  <p className="font-mono text-foreground">
                    {selectedOrder.id}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data</span>
                  <p className="text-foreground">
                    {new Date(selectedOrder.created_at).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cliente</span>
                  <p className="font-medium text-foreground">
                    {selectedOrder.customer_name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="text-foreground">
                    {selectedOrder.customer_email}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={`${statusColors[selectedOrder.status]} border`}
                  >
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Total</span>
                  <p className="text-lg font-bold text-primary">
                    {Number(selectedOrder.total).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-foreground">
                  Itens do Pedido
                </h4>
                <div className="border border-border rounded-lg divide-y divide-border">
                  {selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground">
                            Qtd: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-foreground">
                          {(item.price * item.quantity).toLocaleString(
                            "pt-BR",
                            {
                              style: "currency",
                              currency: "BRL",
                            }
                          )}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-muted-foreground">
                      Sem itens
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="text-foreground">
                Nome do Cliente
              </Label>
              <Input
                id="customer_name"
                value={editForm.customer_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, customer_name: e.target.value })
                }
                className="bg-white/8 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email" className="text-foreground">
                Email
              </Label>
              <Input
                id="customer_email"
                type="email"
                value={editForm.customer_email}
                onChange={(e) =>
                  setEditForm({ ...editForm, customer_email: e.target.value })
                }
                className="bg-white/8 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger className="bg-white/8 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {statusOptions.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="text-foreground hover:bg-white/10 focus:bg-white/10 focus:text-foreground"
                    >
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir pedido?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pedido de "
              {deleteConfirm?.customer_name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOrderMutation.isPending && (
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

export default OrdersPage;
