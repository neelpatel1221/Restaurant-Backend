import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteable, getTableQrCode, getTables } from "@/features/tableSlice";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { QrCodeModal } from "./qrCodeModal";
import { TableForm } from "./TableForm";
import { Plus, QrCode, Pencil, Trash } from "lucide-react";

export type Payment = {
  _id: string;
  tableNumber: number;
  isAvailable: boolean;
  qrCode: string;
  seating: number;
};

export function DataTableDemo() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableId, setTableId] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { tables, error, success, qrCode } = useSelector(
    (state: RootState) => state.tables
  );

  useEffect(() => {
    dispatch(getTables());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  }, [error]);

  useEffect(() => {
    if (success) toast({ title: "Success", description: success });
  }, [success]);

  const openQrCodeModal = async (id: string) => {
    try {
      await dispatch(getTableQrCode(id));
      setIsQrModalOpen(true);
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  const handleAddTable = () => setIsTableModalOpen(true);
  const closeQrCodeModal = () => setIsQrModalOpen(false);
  const closeTableFormModal = () => {
    setIsTableModalOpen(false);
    setTableId(null);
  };
  const openEditModal = (id: string) => {
    setTableId(id);
    setIsTableModalOpen(true);
  };

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Button variant="default" onClick={handleAddTable}>
          <Plus className="mr-2 h-4 w-4" /> Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
        {tables.map((tableItem) => (
          <div
            key={tableItem._id}
            className={`p-4 rounded-lg shadow-md border-2 flex flex-col items-center justify-center cursor-pointer transition-transform duration-200
              ${tableItem.isAvailable
                ? "bg-green-200 border-green-400 text-green-900 hover:scale-105"
                : "bg-gray-100 border-gray-400 text-black hover:scale-105"
              }
              hover:shadow-[0_0_10px_2px] hover:shadow-current
            `}
          >
            <div className="text-lg font-bold mb-1">Table {tableItem.tableNumber}</div>
            <div className="text-sm mb-2">Seating: {tableItem.seating ?? 2}</div>

            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => openQrCodeModal(tableItem._id)}>
                <QrCode className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEditModal(tableItem._id)}>
                <Pencil className="w-5 h-5 text-black" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    await dispatch(deleteable(tableItem._id)).unwrap();
                    dispatch(getTables());
                  } catch (error) {
                    console.error("Delete failed", error);
                  }
                }}
              >
                <Trash className="w-5 h-5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={closeQrCodeModal}
        onDownload={handleDownload}
      />

      <TableForm
        isOpen={isTableModalOpen}
        onClose={closeTableFormModal}
        id={tableId}
      />

      {/* <Toaster /> */}
    </div>
  );
}
