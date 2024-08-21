'use client';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function Home() {
  const notify = () => toast('Wow so easy !');

  return (
    <div className="flex justify-between">
      <Button onClick={notify}>Toast</Button>
    </div>
  );
}
