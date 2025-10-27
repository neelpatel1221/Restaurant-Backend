import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  CreditCard,
  Wallet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  done: boolean;
  prepTime: number; // static estimated prep time in minutes
}

interface Order {
  id: string;
  table: number;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  time: Date;
  specialInstructions: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "12345",
      table: 5,
      items: [
        { name: "Crispy Calamari", quantity: 2, done: false, prepTime: 8 },
        { name: "Grilled Salmon", quantity: 1, done: false, prepTime: 12 },
      ],
      total: 55.37,
      status: "preparing",
      paymentMethod: "online",
      paymentStatus: "paid",
      time: new Date(Date.now() - 18 * 60000),
      specialInstructions: "Medium rare salmon",
    },
    {
      id: "12346",
      table: 3,
      items: [
        { name: "Ribeye Steak", quantity: 1, done: false, prepTime: 15 },
        { name: "Chocolate Lava Cake", quantity: 1, done: false, prepTime: 10 },
      ],
      total: 41.98,
      status: "ready",
      paymentMethod: "cash",
      paymentStatus: "pending",
      time: new Date(Date.now() - 5 * 60000),
      specialInstructions: "",
    },
    {
      id: "12347",
      table: 8,
      items: [
        { name: "Truffle Arancini", quantity: 3, done: false, prepTime: 10 },
        { name: "Grilled Salmon", quantity: 2, done: false, prepTime: 12 },
      ],
      total: 94.96,
      status: "confirmed",
      paymentMethod: "online",
      paymentStatus: "paid",
      time: new Date(Date.now() - 25 * 60000),
      specialInstructions: "Extra sauce on the side",
    },
    {
      id: "12348",
      table: 2,
      items: [
        { name: "Margherita Pizza", quantity: 1, done: false, prepTime: 7 },
        { name: "Caesar Salad", quantity: 2, done: false, prepTime: 5 },
      ],
      total: 32.5,
      status: "preparing",
      paymentMethod: "online",
      paymentStatus: "paid",
      time: new Date(Date.now() - 12 * 60000),
      specialInstructions: "Extra cheese on pizza",
    },
    {
      id: "12349",
      table: 6,
      items: [
        { name: "Spaghetti Carbonara", quantity: 2, done: false, prepTime: 10 },
        { name: "Garlic Bread", quantity: 3, done: false, prepTime: 5 },
      ],
      total: 48.2,
      status: "confirmed",
      paymentMethod: "cash",
      paymentStatus: "pending",
      time: new Date(Date.now() - 20 * 60000),
      specialInstructions: "",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("active");

  // Status colors
  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-600 text-white",
    preparing: "bg-yellow-500 text-white",
    ready: "bg-green-600 text-white",
    served: "bg-gray-500 text-white",
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getMinutesAgo = (orderTime: Date) => {
    return Math.floor((currentTime.getTime() - orderTime.getTime()) / 60000);
  };

  const getColorScheme = (status: string) => {
    switch (status) {
      case "confirmed":
        return { card: "bg-blue-50", chip: "bg-blue-100 text-blue-900" };
      case "preparing":
        return { card: "bg-yellow-50", chip: "bg-yellow-100 text-yellow-900" };
      case "ready":
        return { card: "bg-green-50", chip: "bg-green-100 text-green-900" };
      case "served":
        return { card: "bg-gray-50", chip: "bg-gray-100 text-gray-900" };
      default:
        return { card: "bg-gray-50", chip: "bg-gray-100 text-gray-900" };
    }
  };

  const toggleItemDone = (orderId: string, itemIndex: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
            ...order,
            items: order.items.map((item, idx) =>
              idx === itemIndex ? { ...item, done: !item.done } : item
            ),
          }
          : order
      )
    );
  };

  const toggleShowAll = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // --- FILTER + SEARCH + PRIORITY ---
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.includes(search) ||
        order.table.toString().includes(search) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      const matchesFilter = filter === "all" || order.status === filter;
      if (activeTab === "active" && order.status === "served") return false;
      if (activeTab === "completed" && order.status !== "served") return false;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.time.getTime() - b.time.getTime()); // prioritized queue by oldest order

  // --- ITEM SUMMARY BAR ---
  const itemSummary: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      itemSummary[item.name] = (itemSummary[item.name] || 0) + item.quantity;
    });
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      {/* ITEM SUMMARY BAR */}
      {Object.keys(itemSummary).length > 0 && (
        <div className="flex flex-wrap gap-3 py-2 px-3 bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border">
          {Object.entries(itemSummary).map(([name, qty]) => (
            <div
              key={name}
              className="flex-shrink-0 bg-amber-100 text-amber-900 font-semibold px-3 py-1 rounded-full text-sm whitespace-nowrap"
            >
              {name} × {qty}
            </div>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tabs + Filter + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="flex bg-white/80 backdrop-blur-lg rounded-xl shadow-sm">
            <TabsTrigger value="active" className="rounded-lg font-semibold">
              Active Orders
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg font-semibold">
              Completed
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg font-semibold">
              Payments
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">All Orders</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
            </select>

            <input
              type="text"
              placeholder="Search..."
              className="border rounded-md p-2 text-sm w-48 focus:ring-2 focus:ring-amber-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ACTIVE ORDERS */}
        <TabsContent value="active">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const color = getColorScheme(order.status);
              const showAll = expandedOrders[order.id];
              const visibleItems = showAll ? order.items : order.items.slice(0, 1);
              const minsAgo = getMinutesAgo(order.time);
              const isWarning = minsAgo >= 10 && minsAgo < 15;
              const isPriority = minsAgo >= 15;

              return (
                <Card
                  key={order.id}
                  className={`relative ${color.card} border shadow-sm ${isPriority ? "border-red-500 animate-pulse" : ""
                    } ${isWarning ? "border-yellow-400" : ""}`}
                >
                  {/* Priority Alert */}
                  {isPriority && (
                    <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-xs font-semibold text-center py-1 rounded-t-md flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Priority: {minsAgo} min
                    </div>
                  )}

                  <CardHeader className={isPriority ? "pt-6" : ""}>
                    <CardTitle className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-800">
                        Table {order.table}
                      </span>
                      <span className="text-gray-500">
                        {minsAgo === 0 ? "Just now" : `${minsAgo} min ago`}
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Ordered Items */}
                    <div className="flex flex-col gap-2">
                      {visibleItems.map((item, idx) => {
                        const elapsed = item.prepTime
                          ? Math.min(Math.floor((minsAgo / item.prepTime) * 100), 100)
                          : 0;

                        return (
                          <div
                            key={idx}
                            className={`flex flex-col p-2 rounded-lg border ${item.done
                              ? "bg-gray-200 opacity-70 line-through text-gray-600"
                              : color.chip
                              }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {item.name} x{item.quantity}
                              </span>
                              <Button
                                variant={item.done ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleItemDone(order.id, idx)}
                                className="rounded-full text-xs px-3 py-1"
                              >
                                {item.done ? "Done" : "Mark Done"}
                              </Button>
                            </div>

                            {/* Prep Time Progress */}
                            <div className="h-1 bg-gray-300 rounded-full mt-1">
                              <div
                                className={`h-1 rounded-full ${elapsed >= 100 ? "bg-red-500" : "bg-green-500"
                                  }`}
                                style={{ width: `${elapsed}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              Prep: {item.prepTime} min
                            </div>
                          </div>
                        );
                      })}

                      {order.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowAll(order.id)}
                          className="text-gray-600 text-xs flex items-center gap-1 w-fit mt-1"
                        >
                          {showAll ? (
                            <>
                              <ChevronUp className="w-3 h-3" /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" /> Show More
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Note / Special Instructions */}
                    {order.specialInstructions && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-sm text-amber-900 mt-2">
                        <strong>Note:</strong> {order.specialInstructions}
                      </div>
                    )}

                    {/* Status Buttons */}
                    <div className="flex justify-between pt-3 border-t mt-2">
                      {["confirmed", "preparing", "ready", "served"].map(
                        (status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, status)}
                            className={`text-xs rounded-full ${order.status === status
                              ? statusColors[status]
                              : "hover:bg-gray-100"
                              }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}