import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StudyTimer } from '@/components/timer/StudyTimer'

export default function TimerPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Study Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <StudyTimer />
        </CardContent>
      </Card>
    </div>
  )
}

