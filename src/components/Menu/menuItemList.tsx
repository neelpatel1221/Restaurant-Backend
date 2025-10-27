import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { deleteMenuItem, getMenuItems, MenuItem } from "@/features/menuSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { TableComponent } from "../ui/TableComponent";
import { MenuItemForm } from "./menuItemForm";

export function MenuItemList() {
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const { menuItems, loading, error, success } = useSelector((state: RootState) => state.menu);

  useEffect(() => {
    dispatch(getMenuItems());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message, { style: { backgroundColor: "#f8d7da", color: "#721c24" } });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toast.success(success, { style: { backgroundColor: "#d4edda", color: "#155724" } });
    }
  }, [success]);

  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-24 h-24 overflow-hidden rounded-lg shadow-md">
          <img className="object-cover w-full h-full" src={row.getValue("imageUrl")} alt={row.getValue("itemName")} />
        </div>
      ),
    },
    {
      accessorKey: "itemName",
      header: "Item",
      cell: ({ row }) => (
        <div className="capitalize font-semibold text-lg">{row.getValue("itemName")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.getValue("description") ?? 'No description available'}</div>
      ),
    },
    {
      accessorKey: "isAvailable",
      header: "Status",
      cell: ({ row }) => (
        <div className={`capitalize font-semibold ${row.getValue("isAvailable") ? 'text-green-500' : 'text-red-500'}`}>
          {row.getValue("isAvailable") ? "Available" : "Not Available"}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="text-sm font-medium text-gray-700">{row.getValue("price") ? `$${row.getValue("price")}` : 'N/A'}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await dispatch(deleteMenuItem(row.original._id)).unwrap();
                dispatch(getMenuItems());
                toast.success("Item deleted successfully!", { style: { backgroundColor: "#d4edda", color: "#155724" } });
              } catch (error) {
                toast.error("Delete failed", { style: { backgroundColor: "#f8d7da", color: "#721c24" } });
              }
            }}
          >
            <Trash className="text-red-500" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(row.original._id)}
          >
            <Pencil className="text-blue-500" />
          </Button>
        </div>
      ),
    },
  ];

  const closeTableFormModal = () => {
    setIsMenuItemModalOpen(false);
    setMenuId(null);
  };

  const openEditModal = (id: string) => {
    setMenuId(id);
    setIsMenuItemModalOpen(true);
  };

  return (
    <Card className="w-full mb-5 max-w-full shadow-sm rounded-2xl border border-orange-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800">Menu Items</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        {/* DESKTOP VIEW */}
        <div className="hidden md:block">
          <TableComponent
            data={menuItems}
            columns={columns}
            showColumnToggle={true}
          />
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden space-y-3">
          {menuItems?.length > 0 ? (
            menuItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 border border-orange-100 bg-white rounded-xl shadow-sm p-2 hover:shadow-md transition-all"
              >
                {/* IMAGE */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-orange-50">
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.itemName}</h3>
                    <p className="text-sm font-bold text-orange-600 whitespace-nowrap ml-2">
                      ₹{item.price}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                    {item.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(item._id)}
                        className="h-8 w-8 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            await dispatch(deleteMenuItem(item._id)).unwrap();
                            dispatch(getMenuItems());
                            toast.success("Item deleted successfully!", {
                              style: { backgroundColor: "#d4edda", color: "#155724" },
                            });
                          } catch (error) {
                            toast.error("Delete failed", {
                              style: { backgroundColor: "#f8d7da", color: "#721c24" },
                            });
                          }
                        }}
                        className="h-8 w-8 hover:bg-red-50"
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm">No menu items found.</p>
          )}
        </div>

        {/* FORM */}
        <MenuItemForm
          showAsDialog={isMenuItemModalOpen}
          showAsCard={false}
          onClose={closeTableFormModal}
          id={menuId}
        />
      </CardContent>
    </Card>
  );

}
