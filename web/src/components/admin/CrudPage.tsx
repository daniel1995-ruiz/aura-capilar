"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { FormFields, type FieldDef } from "./FormFields";
import { Button, Card, Empty, Modal, PageHeader, SortableList, Spinner, toast } from "./ui";

type Item = { id: number; active?: boolean; [key: string]: any };

/** Página genérica de administración: lista con orden manual + formulario en modal. */
export function CrudPage({
  title, description, endpoint, fields, defaults, renderItem, itemName,
}: {
  title: string;
  description?: string;
  endpoint: string;
  fields: FieldDef[];
  defaults: Record<string, any>;
  renderItem: (item: Item) => React.ReactNode;
  itemName: string;
}) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => adminFetch<Item[]>(endpoint).then(setItems).catch((e) => toast.error(e.message)), [endpoint]);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await adminFetch(`${endpoint}/${editing.id}`, { method: "PUT", json: editing });
      else await adminFetch(endpoint, { json: editing });
      toast.ok("Cambios guardados");
      setEditing(null);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (next: Item[]) => {
    setItems(next);
    try {
      await adminFetch(`${endpoint}/reorder`, { method: "PUT", json: { ids: next.map((i) => i.id) } });
      toast.ok("Orden actualizado");
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const toggleActive = async (item: Item) => {
    try {
      await adminFetch(`${endpoint}/${item.id}`, { method: "PUT", json: { active: !item.active } });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (item: Item) => {
    if (!confirm(`¿Eliminar este ${itemName}? Esta acción no se puede deshacer.`)) return;
    try {
      await adminFetch(`${endpoint}/${item.id}`, { method: "DELETE" });
      toast.ok("Eliminado");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setEditing({ ...defaults })}>
            <Plus className="h-4 w-4" /> Agregar {itemName}
          </Button>
        }
      />
      <Card>
        {!items ? (
          <Spinner />
        ) : items.length === 0 ? (
          <Empty>No hay elementos todavía.</Empty>
        ) : (
          <>
            <p className="mb-2 text-xs text-stone-500">Arrastra o usa las flechas para cambiar el orden de aparición.</p>
            <SortableList
              items={items}
              onReorder={reorder}
              renderItem={(item) => (
                <div className="flex items-center gap-3">
                  <div className={`min-w-0 flex-1 ${item.active === false ? "opacity-50" : ""}`}>{renderItem(item)}</div>
                  {"active" in item && (
                    <Button variant="ghost" className="px-2" onClick={() => toggleActive(item)} title={item.active ? "Visible — clic para ocultar" : "Oculto — clic para mostrar"}>
                      {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-stone-400" />}
                    </Button>
                  )}
                  <Button variant="ghost" className="px-2" onClick={() => setEditing({ ...item })} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="px-2 text-red-600" onClick={() => remove(item)} aria-label="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          </>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Editar ${itemName}` : `Nuevo ${itemName}`}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={save} loading={saving}>Guardar</Button>
          </>
        }
      >
        {editing && <FormFields fields={fields} values={editing} onChange={setEditing} />}
      </Modal>
    </>
  );
}
