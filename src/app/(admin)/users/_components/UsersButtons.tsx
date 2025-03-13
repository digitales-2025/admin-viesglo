import { Button } from '@/shared/components/ui/button'

export function UsersPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
      >
        <span>Invite User</span> 
      </Button>
    </div>
  )
}