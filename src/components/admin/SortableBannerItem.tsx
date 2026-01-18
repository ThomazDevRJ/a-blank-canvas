import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

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

interface SortableBannerItemProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function SortableBannerItem({ 
  banner, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: SortableBannerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-muted/50 rounded-lg ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      
      {banner.image_url ? (
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-32 h-20 object-cover rounded"
        />
      ) : (
        <div className="w-32 h-20 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
          Sem imagem
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{banner.title}</h3>
        {banner.subtitle && (
          <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
        )}
        {banner.button_text && (
          <p className="text-xs text-primary mt-1">{banner.button_text}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={banner.active}
            onCheckedChange={(checked) => onToggleActive(banner.id, checked)}
          />
          <Badge variant={banner.active ? 'default' : 'secondary'}>
            {banner.active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(banner)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(banner)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
