import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ImportWorkoutTemplate() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Import template</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import workout template</DialogTitle>
          <DialogDescription>
            Placeholder for workout template import flow.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
