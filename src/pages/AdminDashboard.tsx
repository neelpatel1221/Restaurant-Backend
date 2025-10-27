import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Menu,
  ShoppingCart,
  Clock,
  TrendingUp,
  Bell,
  ArrowRight
} from "lucide-react";

const AdminDashboard = () => {
  const stats = {
    activeOrders: 12,
    completedToday: 45,
    revenue: 1250.75,
    avgOrderValue: 27.85
  };

  const recentOrders = [
    { id: "12345", table: 5, items: 3, status: "preparing", time: "5 min ago", total: 55.37 },
    { id: "12346", table: 2, items: 2, status: "ready", time: "8 min ago", total: 32.50 },
    { id: "12347", table: 8, items: 4, status: "confirmed", time: "12 min ago", total: 68.25 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "ready": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      {/* ✅ Header */}
      <header className="bg-white shadow-sm border-b p-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-6xl mx-auto space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Cozy Kitchen Management</p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full flex items-center justify-center text-sm px-3 sm:px-4 w-full sm:w-auto"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge className="ml-2 bg-red-500 text-white">3</Badge>
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-sm px-3 sm:px-4">
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* ✅ Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: "Active Orders", value: stats.activeOrders, color: "orange", icon: <ShoppingCart className="w-6 h-6 text-orange-600" /> },
            { label: "Completed Today", value: stats.completedToday, color: "green", icon: <Clock className="w-6 h-6 text-green-600" /> },
            { label: "Today's Revenue", value: `$${stats.revenue}`, color: "blue", icon: <TrendingUp className="w-6 h-6 text-blue-600" /> },
            { label: "Avg Order Value", value: `$${stats.avgOrderValue}`, color: "purple", icon: <Users className="w-6 h-6 text-purple-600" /> },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="hover:shadow-lg transition-shadow rounded-xl"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">{item.label}</p>
                    <p className={`text-xl sm:text-3xl font-bold text-${item.color}-600`}>
                      {item.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${item.color}-100 rounded-full flex items-center justify-center`}>
                    {item.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ✅ Recent Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold">Recent Orders</CardTitle>
              <Link to="/admin/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs sm:text-sm flex items-center"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start sm:items-center justify-between sm:justify-start w-full sm:space-x-4">
                      <div className="text-left sm:text-center">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
                          Table {order.table}
                        </p>
                        <p className="text-xs text-gray-500">#{order.id}</p>
                      </div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <p className="font-medium text-sm sm:text-base">
                          {order.items} items • ${order.total}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 self-end sm:self-center">
                      <Badge
                        className={`${getStatusColor(order.status)} text-white text-xs px-3 py-1 capitalize`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-3 border-b border-orange-100">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                ⚡ Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-3">
              <Link to="/admin/menu" className="block">
                <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all h-10 sm:h-11 text-sm sm:text-base">
                  <Menu className="w-4 h-4 mr-3" />
                  Manage Menu
                </Button>
              </Link>

              <Link to="/admin/orders" className="block">
                <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all h-10 sm:h-11 text-sm sm:text-base">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  View Orders
                </Button>
              </Link>

              <Link to="/tables" className="block">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all h-10 sm:h-11 text-sm sm:text-base">
                  <Users className="w-4 h-4 mr-3" />
                  Table Management
                </Button>
              </Link>

              <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all h-10 sm:h-11 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 mr-3" />
                Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
