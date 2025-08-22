'use client';

import { Video } from 'lucide-react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from  'next/image'
const VideoCallAction = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full text-green-200 dark:text-green-400 border-green-300/30 dark:border-blue-900 hover:bg-green-100 dark:hover:bg-green-400/30"
        >
          <Video className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>


          
                     <Image
                src="/v1.jpg"
                alt="Picture of the author"
                width={500}
                height={500}
                className='rounded-2xl '
              />







      </DialogContent>
    </Dialog>
  );
};

export default VideoCallAction;
