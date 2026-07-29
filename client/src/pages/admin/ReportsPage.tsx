import { useOrderReport, useRevenueReport, useDriverPerformance, useVendorPerformance } from '@/hooks/queries/useAdminQueries'
import { ReportChart } from '@/components/admin/ReportChart'

export default function ReportsPage() {
  const { data: orderData, isLoading: orderLoading } = useOrderReport()
  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport()
  const { data: driverData, isLoading: driverLoading } = useDriverPerformance()
  const { data: vendorData, isLoading: vendorLoading } = useVendorPerformance()

  const toChartData = (data: typeof orderData) =>
    data?.labels?.map((label, i) => ({
      label,
      value: data.datasets[0]?.data[i] || 0,
    })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ReportChart title="Orders Over Time" type="line" data={toChartData(orderData)} isLoading={orderLoading} />
        <ReportChart title="Revenue Breakdown" type="pie" data={toChartData(revenueData)} isLoading={revenueLoading} />
        <ReportChart title="Driver Performance" type="bar" data={toChartData(driverData)} isLoading={driverLoading} />
        <ReportChart title="Vendor Performance" type="bar" data={toChartData(vendorData)} isLoading={vendorLoading} />
      </div>
    </div>
  )
}
