import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CreateDeckForm } from '@/components/flashcards/CreateDeckForm'

export default function CreateDeckPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Flashcard Deck</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateDeckForm />
      </CardContent>
    </Card>
  )
}

