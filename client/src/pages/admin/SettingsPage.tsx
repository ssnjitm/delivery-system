import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/ui/form'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormItem>
            <Label>Application Name</Label>
            <Input defaultValue="Delivery System" />
          </FormItem>
          <FormItem>
            <Label>Support Email</Label>
            <Input type="email" defaultValue="support@delivery.com" />
          </FormItem>
          <FormItem>
            <Label>Support Phone</Label>
            <Input defaultValue="+977-1-4XXXXXX" />
          </FormItem>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}
