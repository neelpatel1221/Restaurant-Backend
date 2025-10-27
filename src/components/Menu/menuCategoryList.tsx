import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getMenuCategorys, Category, deleteCategory } from "@/features/menuSlice";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { TableComponent } from "../ui/TableComponent";
import { CategoryForm } from "./categoryForm";



export function MenuCategoryList() {
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>()
    const { categories, loading, error, success } = useSelector((state: RootState) => state.menu);

    useEffect(() => {
        dispatch(getMenuCategorys())
    }, [])

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error])

    useEffect(() => {
        if (success) {
            toast.success(success);
        }
    }, [success])


    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: "categoryName",
            header: "Category",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("categoryName")}</div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <div className="capitalize">{row.getValue("description")}</div>,
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => <div className="capitalize">{row.getValue("isActive") ? "Active" : "In Active"}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className="flex">
                        <Button variant="ghost" size="icon"
                            onClick={async () => {
                                try {
                                    await dispatch(deleteCategory(row.original._id)).unwrap();
                                    dispatch(getMenuCategorys());
                                } catch (error) {
                                    console.error("Delete failed", error);
                                }
                            }

                            } >
                            <Trash className="text-red-500" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => openCategoryEditModal(row.original._id)}>
                            <Pencil className="text-blue-500" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const closeCategoryFormModal = () => {
        setIsCategoryModalOpen(false);
        setCategoryId(null);
        setIsCategoryDialogOpen(false)

    };

    const openCategoryEditModal = (id: string) => {
        setIsCategoryDialogOpen(true)
        setCategoryId(id)
        setIsCategoryModalOpen(true);
    }

    return (
        <>
            <Card className="w-full mb-5 max-w-full">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800">Menu Categories</CardTitle>
                </CardHeader>

                <CardContent>
                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden md:block">
                        <TableComponent
                            data={categories}
                            columns={columns}
                            showColumnToggle={true}
                        />
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="block md:hidden space-y-3">
                        {categories?.length > 0 ? (
                            categories.map((category) => (
                                <div
                                    key={category._id}
                                    className="border border-orange-100 bg-white rounded-xl shadow-sm p-3 flex justify-between items-start hover:shadow-md transition-all"
                                >
                                    {/* Left Side: Info */}
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 capitalize">
                                            {category.categoryName}
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {category.description || "No description"}
                                        </p>
                                        <span
                                            className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${category.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {category.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    {/* Right Side: Actions */}
                                    <div className="flex flex-col items-end gap-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openCategoryEditModal(category._id)}
                                            className="h-8 w-8 hover:bg-blue-50"
                                        >
                                            <Pencil className="w-4 h-4 text-blue-500" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={async () => {
                                                try {
                                                    await dispatch(deleteCategory(category._id)).unwrap();
                                                    dispatch(getMenuCategorys());
                                                } catch (error) {
                                                    console.error("Delete failed", error);
                                                }
                                            }}
                                            className="h-8 w-8 hover:bg-red-50"
                                        >
                                            <Trash className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm">No categories found.</p>
                        )}
                    </div>

                    {/* Category Form */}
                    <CategoryForm
                        showAsDialog={isCategoryModalOpen}
                        showAsCard={false}
                        onClose={closeCategoryFormModal}
                        id={categoryId}
                    />
                </CardContent>
            </Card>
        </>
    );
}