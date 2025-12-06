/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "../../lib/api";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export function SalesReports({ restaurantId }) {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const reportRef = useRef(null);

  const loadSalesData = useCallback(async () => {
    if (!restaurantId) return;

    setLoading(true);

    try {
      const data = await apiFetch(
        `/restaurants/${restaurantId}/sales?period=${period}`
      );
      setSalesData(data);
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, period]);

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      loadSalesData();
    }
  }, [restaurantId, loadSalesData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Unable to load sales data</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sales Reports</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {["today", "week", "month", "all"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {p === "today"
                  ? "Today"
                  : p === "week"
                  ? "Week"
                  : p === "month"
                  ? "Month"
                  : "All Time"}
              </button>
            ))}
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div ref={reportRef} className="p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">
              Total Revenue
            </span>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${salesData.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">
              Total Orders
            </span>
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {salesData.totalOrders}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {salesData.completedOrders || 0} completed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">
              Average Order
            </span>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${salesData.averageOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">
              Pending Orders
            </span>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {salesData.pendingOrders || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">Top Selling Items</h3>
        </div>
        <div className="p-6">
          {!salesData.topItems || salesData.topItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No sales data available
            </p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesData.topItems.map((item) => ({
                    name: item.name,
                    sales_count: item.quantity,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{
                      value: "Number of Orders",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} orders`, "Sales Count"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="sales_count"
                    fill="#f97316"
                    name="Sales Count"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {salesData.topItems.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            Detailed Sales List
          </h3>
        </div>
        <div className="p-6">
          {!salesData.topItems || salesData.topItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No sales data available
            </p>
          ) : (
            <div className="space-y-4">
              {salesData.topItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between pb-4 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${item.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
